/**
 * WebSocket Connection Manager
 *
 * Singleton pattern for managing WebSocket connections across the app.
 * Prevents multiple connections and provides automatic reconnection.
 *
 * Features:
 * - Single connection shared across components
 * - Automatic reconnection with exponential backoff
 * - Event subscription system
 * - Connection state management
 * - Heartbeat/ping-pong for connection health
 *
 * @example
 * ```tsx
 * const ws = WebSocketManager.getInstance('wss://api.dealscale.app/ws');
 *
 * // Subscribe to events
 * const unsubscribe = ws.subscribe('campaign.update', (data) => {
 *   console.log('Campaign updated:', data);
 * });
 *
 * // Send message
 * ws.send('campaign.start', { campaignId: '123' });
 *
 * // Cleanup
 * unsubscribe();
 * ```
 */

type MessageHandler = (data: unknown) => void;
type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface WSMessage {
	type: string;
	data: unknown;
	timestamp: number;
}

export class WebSocketManager {
	private static instance: WebSocketManager | null = null;
	private socket: WebSocket | null = null;
	private url: string;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second
	private maxReconnectDelay = 30000; // Max 30 seconds
	private handlers = new Map<string, Set<MessageHandler>>();
	private connectionState: ConnectionState = "disconnected";
	private heartbeatInterval: NodeJS.Timeout | null = null;
	private reconnectTimeout: NodeJS.Timeout | null = null;

	private constructor(url: string) {
		this.url = url;
	}

	/**
	 * Get the singleton instance of WebSocketManager
	 */
	public static getInstance(url?: string): WebSocketManager {
		if (!WebSocketManager.instance) {
			if (!url) {
				throw new Error("URL is required for first initialization");
			}
			WebSocketManager.instance = new WebSocketManager(url);
		}
		return WebSocketManager.instance;
	}

	/**
	 * Reset the singleton instance (useful for testing)
	 */
	public static resetInstance(): void {
		if (WebSocketManager.instance) {
			WebSocketManager.instance.disconnect();
			WebSocketManager.instance = null;
		}
	}

	/**
	 * Connect to the WebSocket server
	 */
	public connect(): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			console.log("WebSocket already connected");
			return;
		}

		if (this.socket?.readyState === WebSocket.CONNECTING) {
			console.log("WebSocket connection already in progress");
			return;
		}

		try {
			this.connectionState = "connecting";
			this.socket = new WebSocket(this.url);

			this.socket.onopen = () => {
				console.log("✅ WebSocket connected");
				this.connectionState = "connected";
				this.reconnectAttempts = 0;
				this.reconnectDelay = 1000;
				this.startHeartbeat();
				this.notifyHandlers("connection.open", { connected: true });
			};

			this.socket.onmessage = (event) => {
				try {
					const message: WSMessage = JSON.parse(event.data);
					this.handleMessage(message);
				} catch (error) {
					console.error("Failed to parse WebSocket message:", error);
				}
			};

			this.socket.onerror = (error) => {
				console.error("❌ WebSocket error:", error);
				this.connectionState = "error";
				this.notifyHandlers("connection.error", { error });
			};

			this.socket.onclose = (event) => {
				console.log("WebSocket disconnected:", event.code, event.reason);
				this.connectionState = "disconnected";
				this.stopHeartbeat();
				this.notifyHandlers("connection.close", {
					code: event.code,
					reason: event.reason,
				});

				// Attempt to reconnect if not a normal closure
				if (event.code !== 1000) {
					this.scheduleReconnect();
				}
			};
		} catch (error) {
			console.error("Failed to create WebSocket connection:", error);
			this.connectionState = "error";
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from the WebSocket server
	 */
	public disconnect(): void {
		this.stopHeartbeat();
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		if (this.socket) {
			this.socket.close(1000, "Client disconnect");
			this.socket = null;
		}

		this.connectionState = "disconnected";
	}

	/**
	 * Subscribe to a specific message type
	 */
	public subscribe(type: string, handler: MessageHandler): () => void {
		if (!this.handlers.has(type)) {
			this.handlers.set(type, new Set());
		}

		this.handlers.get(type)!.add(handler);

		// Return unsubscribe function
		return () => {
			const handlers = this.handlers.get(type);
			if (handlers) {
				handlers.delete(handler);
				if (handlers.size === 0) {
					this.handlers.delete(type);
				}
			}
		};
	}

	/**
	 * Send a message through the WebSocket
	 */
	public send(type: string, data: unknown): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			const message: WSMessage = {
				type,
				data,
				timestamp: Date.now(),
			};
			this.socket.send(JSON.stringify(message));
		} else {
			console.warn("Cannot send message: WebSocket not connected");
			// Optionally queue messages for when connection is restored
		}
	}

	/**
	 * Get current connection state
	 */
	public getState(): ConnectionState {
		return this.connectionState;
	}

	/**
	 * Check if WebSocket is connected
	 */
	public isConnected(): boolean {
		return this.socket?.readyState === WebSocket.OPEN;
	}

	/**
	 * Handle incoming messages
	 */
	private handleMessage(message: WSMessage): void {
		const handlers = this.handlers.get(message.type);
		if (handlers) {
			handlers.forEach((handler) => {
				try {
					handler(message.data);
				} catch (error) {
					console.error(`Error in handler for ${message.type}:`, error);
				}
			});
		}
	}

	/**
	 * Notify all handlers of a specific event
	 */
	private notifyHandlers(type: string, data: unknown): void {
		const handlers = this.handlers.get(type);
		if (handlers) {
			handlers.forEach((handler) => handler(data));
		}
	}

	/**
	 * Schedule reconnection with exponential backoff
	 */
	private scheduleReconnect(): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("Max reconnection attempts reached");
			this.notifyHandlers("connection.failed", {
				attempts: this.reconnectAttempts,
			});
			return;
		}

		this.reconnectAttempts++;
		const delay = Math.min(
			this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
			this.maxReconnectDelay,
		);

		console.log(
			`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
		);

		this.reconnectTimeout = setTimeout(() => {
			console.log(
				`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
			);
			this.connect();
		}, delay);
	}

	/**
	 * Start heartbeat to keep connection alive
	 */
	private startHeartbeat(): void {
		this.stopHeartbeat();
		this.heartbeatInterval = setInterval(() => {
			if (this.socket?.readyState === WebSocket.OPEN) {
				this.send("ping", { timestamp: Date.now() });
			}
		}, 30000); // Ping every 30 seconds
	}

	/**
	 * Stop heartbeat
	 */
	private stopHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}
}

/**
 * React Hook for using WebSocket
 *
 * @example
 * ```tsx
 * function CampaignStatus({ campaignId }: { campaignId: string }) {
 *   const { subscribe, send, isConnected } = useWebSocket();
 *
 *   useEffect(() => {
 *     const unsubscribe = subscribe('campaign.update', (data) => {
 *       console.log('Campaign updated:', data);
 *     });
 *
 *     return unsubscribe;
 *   }, [subscribe]);
 *
 *   return (
 *     <div>
 *       Status: {isConnected ? 'Connected' : 'Disconnected'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocket(url?: string) {
	const wsUrl =
		url || process.env.NEXT_PUBLIC_WS_URL || "wss://api.dealscale.app/ws";
	const ws = WebSocketManager.getInstance(wsUrl);

	// Auto-connect on mount
	if (typeof window !== "undefined" && !ws.isConnected()) {
		ws.connect();
	}

	return {
		subscribe: ws.subscribe.bind(ws),
		send: ws.send.bind(ws),
		disconnect: ws.disconnect.bind(ws),
		isConnected: ws.isConnected(),
		getState: ws.getState(),
	};
}
