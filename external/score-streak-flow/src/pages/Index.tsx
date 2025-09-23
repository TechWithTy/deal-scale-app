import { WebSocketProvider } from "@ssf/components/realtime/WebSocketProvider";
import { LeaderboardContainer } from "@ssf/components/leaderboard/LeaderboardContainer";

const Index = () => {
	return (
		<WebSocketProvider>
			<LeaderboardContainer />
		</WebSocketProvider>
	);
};

export default Index;
