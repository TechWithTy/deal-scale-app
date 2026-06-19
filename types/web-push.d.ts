declare module "web-push" {
	export interface PushSubscription {
		endpoint: string;
		keys: {
			auth: string;
			p256dh: string;
		};
		expirationTime?: number | null;
	}

	export interface WebPushError extends Error {
		statusCode?: number;
	}

	export function setVapidDetails(
		subject: string,
		publicKey: string,
		privateKey: string,
	): void;

	export function sendNotification(
		subscription: PushSubscription,
		payload?: string | Buffer,
		options?: { TTL?: number },
	): Promise<void>;

	const webPush: {
		setVapidDetails: typeof setVapidDetails;
		sendNotification: typeof sendNotification;
	};

	export default webPush;
}
