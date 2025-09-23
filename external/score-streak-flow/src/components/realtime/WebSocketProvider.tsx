import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
} from "react";

export interface Player {
	id: string;
	username: string;
	score: number;
	rank: number;
	previousRank?: number;
	avatar?: string;
	isOnline: boolean;
	prediction?: number;
	profileUrl?: string; // optional https profile link
	// Basic profile metadata for display
	city?: string;
	state?: string;
	company?: string;
	// Simple reputation model inspired by MyBB (negative, neutral, positive)
	reputation: number; // total tally
	reputationDelta?: -1 | 0 | 1; // most recent rating direction
	// Backend-provided credit type for requests
	creditType?: "skip" | "ai" | "lead";
}

interface LeaderboardData {
	players: Player[];
	totalPlayers: number;
	myRank: number | null;
	lastUpdated: Date;
}

interface WebSocketContextType {
	leaderboardData: LeaderboardData;
	isConnected: boolean;
	reconnect: () => void;
	isPaused: boolean;
	pause: () => void;
	resume: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
	children: ReactNode;
}

// Mock data generator for demo purposes
const generateMockPlayers = (count: number): Player[] => {
	const usernames = [
		"ProGamer2024",
		"ShadowNinja",
		"CyberWarrior",
		"PixelMaster",
		"CodeHunter",
		"EliteSniper",
		"QuantumGamer",
		"NeonStriker",
		"VoidWalker",
		"FireStorm",
		"IceBreaker",
		"LightSpeed",
		"DarkPhoenix",
		"StormRider",
		"BlazeRunner",
		"CrimsonEdge",
		"FrostBite",
		"ThunderBolt",
		"NightCrawler",
		"StarHunter",
	];

	return Array.from({ length: count }, (_, i) => ({
		id: `player-${i + 1}`,
		username:
			usernames[i % usernames.length] + (i > 19 ? Math.floor(i / 20) : ""),
		score: Math.max(0, Math.floor(Math.random() * 100000) - i * 500),
		rank: i + 1,
		previousRank: i > 0 ? i + Math.floor(Math.random() * 3) - 1 : 1,
		avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
		isOnline: Math.random() > 0.3,
		prediction:
			Math.random() > 0.5 ? i + Math.floor(Math.random() * 10) - 5 : undefined,
		// demo profile link (https). Replace with your real domain when available
		profileUrl: `https://example.com/u/${i + 1}`,
		// Mock location/company
		city: ["Austin", "Miami", "Phoenix", "Seattle", "Denver", "Atlanta"][
			Math.floor(Math.random() * 6)
		],
		state: ["TX", "FL", "AZ", "WA", "CO", "GA"][Math.floor(Math.random() * 6)],
		company: [
			"Acme LLC",
			"Globex",
			"Initech",
			"Umbrella",
			"Wayne Enterprises",
			"Stark Industries",
		][Math.floor(Math.random() * 6)],
		// Reputation: mostly non-negative with occasional negatives, plus a recent delta
		reputation:
			Math.floor(Math.random() * 250) - Math.floor(Math.random() * 50),
		reputationDelta: (() => {
			const r = Math.random();
			if (r < 0.15) return -1; // 15% negative
			if (r < 0.25) return 0; // 10% neutral
			return 1; // 75% positive
		})(),
		creditType: (["skip", "ai", "lead"] as const)[
			Math.floor(Math.random() * 3)
		],
	}));
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
	children,
}) => {
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
		players: [],
		totalPlayers: 0,
		myRank: null,
		lastUpdated: new Date(),
	});
	const [isConnected, setIsConnected] = useState(false);
	const [isPaused, setIsPaused] = useState(true);
	const pausedRef = useRef(true);

	const updateLeaderboard = () => {
		const players = generateMockPlayers(100);
		// Sort by score descending
		players.sort((a, b) => b.score - a.score);
		// Update ranks
		players.forEach((player, index) => {
			player.rank = index + 1;
		});

		setLeaderboardData({
			players,
			totalPlayers: 50000 + Math.floor(Math.random() * 10000),
			myRank: 15 + Math.floor(Math.random() * 10), // Mock user rank
			lastUpdated: new Date(),
		});
	};

	useEffect(() => {
		// Simulate WebSocket connection
		setIsConnected(true);
		if (!pausedRef.current) {
			updateLeaderboard();
		}

		// Simulate live updates every 3-8 seconds
		const interval = setInterval(
			() => {
				if (pausedRef.current) return;
				updateLeaderboard();
			},
			3000 + Math.random() * 5000,
		);

		return () => clearInterval(interval);
	}, []);

	const reconnect = () => {
		setIsConnected(false);
		setTimeout(() => {
			setIsConnected(true);
			updateLeaderboard();
		}, 1000);
	};

	const pause = () => {
		pausedRef.current = true;
		setIsPaused(true);
	};

	const resume = () => {
		pausedRef.current = false;
		setIsPaused(false);
		// Optionally refresh immediately on resume
		updateLeaderboard();
	};

	return (
		<WebSocketContext.Provider
			value={{
				leaderboardData,
				isConnected,
				reconnect,
				isPaused,
				pause,
				resume,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};
