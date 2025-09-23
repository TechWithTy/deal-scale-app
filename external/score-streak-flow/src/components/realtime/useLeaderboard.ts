import { useWebSocket } from "./WebSocketProvider";

export const useLeaderboard = () => {
	const { leaderboardData, isConnected, reconnect, isPaused, pause, resume } =
		useWebSocket();

	return {
		players: leaderboardData.players,
		totalPlayers: leaderboardData.totalPlayers,
		myRank: leaderboardData.myRank,
		lastUpdated: leaderboardData.lastUpdated,
		isConnected,
		reconnect,
		isPaused,
		pause,
		resume,
	};
};
