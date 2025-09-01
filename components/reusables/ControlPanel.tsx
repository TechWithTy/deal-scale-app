"use client";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import {
	useCampaignControls,
	mockPauseWorkflow,
	mockStartWorkflow,
	mockStopWorkflow,
} from "@/lib/stores/campaignControls";

export function ControlPanel({ campaignId }: { campaignId: string }) {
	const state = useCampaignControls((s) => s.getStateFor(campaignId));
	const play = useCampaignControls((s) => s.play);
	const pause = useCampaignControls((s) => s.pause);
	const stop = useCampaignControls((s) => s.stop);

	const onPlay = () => {
		play(campaignId);
		mockStartWorkflow(campaignId);
	};
	const onPause = () => {
		pause(campaignId);
		mockPauseWorkflow(campaignId);
	};
	const onStop = () => {
		stop(campaignId);
		mockStopWorkflow(campaignId);
	};

	return (
		<TooltipProvider>
			<div className="flex items-center justify-center gap-2">
				{state !== "playing" && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="default"
								onClick={onPlay}
								aria-label="Play campaign"
								type="button"
							>
								▶
							</Button>
						</TooltipTrigger>
						<TooltipContent>Play</TooltipContent>
					</Tooltip>
				)}
				{state === "playing" && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="secondary"
								onClick={onPause}
								aria-label="Pause campaign"
								type="button"
							>
								⏸
							</Button>
						</TooltipTrigger>
						<TooltipContent>Pause</TooltipContent>
					</Tooltip>
				)}
				{state !== "idle" && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								onClick={onStop}
								aria-label="Stop campaign"
								type="button"
							>
								■
							</Button>
						</TooltipTrigger>
						<TooltipContent>Stop</TooltipContent>
					</Tooltip>
				)}
			</div>
		</TooltipProvider>
	);
}
