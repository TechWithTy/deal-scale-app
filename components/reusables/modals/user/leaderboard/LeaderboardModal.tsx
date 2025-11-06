"use client";

import { useModalStore } from "@/lib/stores/dashboard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LeaderboardContainer } from "@/external/score-streak-flow/src/components/leaderboard/LeaderboardContainer";
import { WebSocketProvider } from "@/external/score-streak-flow/src/components/realtime/WebSocketProvider";

export default function LeaderboardModal() {
	const { isLeaderboardModalOpen, closeLeaderboardModal } = useModalStore();

	return (
		<Dialog open={isLeaderboardModalOpen} onOpenChange={closeLeaderboardModal}>
			<DialogContent className="max-h-[90vh] max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl overflow-y-auto p-0">
				<DialogTitle className="sr-only">Leaderboard</DialogTitle>
				<div className="relative">
					{/* Leaderboard content with WebSocket provider */}
					<WebSocketProvider>
						<div className="p-2 sm:p-4">
							<LeaderboardContainer />
						</div>
					</WebSocketProvider>
				</div>
			</DialogContent>
		</Dialog>
	);
}
