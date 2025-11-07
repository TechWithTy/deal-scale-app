"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PrizeWheel from "@/external/wheel-spinner/PrizeWheel";
import type { Prize } from "@/external/wheel-spinner/types";
import { useModalStore } from "@/lib/stores/dashboard";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { toast } from "sonner";
import { PrizeLegend } from "./PrizeLegend";

/**
 * Prize pool with diverse rewards:
 * - AI Credits (robot emoji)
 * - SkipTrace Credits (magnifying glass emoji)
 * - Lead Credits (target emoji)
 * - Feature trials (star emoji)
 * - Tier upgrades (trophy emoji)
 * - Special perks (gift emoji)
 */
const prizes: Prize[] = [
	// AI Credits (different robot emojis for amounts)
	{
		id: "ai-50",
		label: "50 AI Credits",
		icon: "🤖",
		color: "#3B82F6",
		weight: 3,
	},
	{
		id: "ai-100",
		label: "100 AI Credits",
		icon: "🦾", // Robot arm for larger amount
		color: "#2563EB",
		weight: 2,
	},

	// SkipTrace Credits (different search emojis)
	{
		id: "skiptrace-25",
		label: "25 SkipTrace Credits",
		icon: "🔍",
		color: "#10B981",
		weight: 3,
	},
	{
		id: "skiptrace-50",
		label: "50 SkipTrace Credits",
		icon: "🔎", // Different magnifying glass for larger amount
		color: "#059669",
		weight: 1,
	},

	// Lead Credits (different target emojis)
	{
		id: "leads-100",
		label: "100 Lead Credits",
		icon: "🎯",
		color: "#F59E0B",
		weight: 3,
	},
	{
		id: "leads-250",
		label: "250 Lead Credits",
		icon: "🏹", // Bow and arrow for larger amount
		color: "#D97706",
		weight: 2,
	},

	// Feature Trials (7-day access to specific locked features)
	{
		id: "trial-ai-agent",
		label: "7-Day AI Agent Trial",
		icon: "⭐",
		color: "#8B5CF6",
		weight: 1,
	},
	{
		id: "trial-voice-clone",
		label: "7-Day Voice Clone Trial",
		icon: "🎙️",
		color: "#7C3AED",
		weight: 1,
	},

	// Credit Boosts (instead of full tier upgrade to prevent abuse)
	{
		id: "boost-credits-30pct",
		label: "+30% All Credits (7 Days)",
		icon: "⚡",
		color: "#EC4899",
		weight: 1,
	},

	// Special Perks
	{
		id: "perk-bonus-credits",
		label: "2x Credits Next Spin",
		icon: "🎁",
		color: "#EF4444",
		weight: 1,
	},
];

export default function WheelSpinnerModal() {
	const { isWheelSpinnerModalOpen, closeWheelSpinnerModal } = useModalStore();
	const sessionUser = useSessionStore((state) => state.user);

	const userId = sessionUser?.id || sessionUser?.email || "demo-user";

	const handleWin = (result: {
		prizeId: string;
		label: string;
		at: string;
	}) => {
		const prizeType = result.prizeId.split("-")[0];

		// Custom toast messages based on prize type
		switch (prizeType) {
			case "ai":
				toast.success(`🤖 You won ${result.label}!`, {
					description:
						"Your AI credits have been added. Use them for AI-powered calls and features.",
					duration: 6000,
				});
				break;
			case "skiptrace":
				toast.success(`🔍 You won ${result.label}!`, {
					description:
						"Your SkipTrace credits have been added. Use them to enrich lead data.",
					duration: 6000,
				});
				break;
			case "leads":
				toast.success(`🎯 You won ${result.label}!`, {
					description:
						"Your Lead credits have been added. Use them to import and manage leads.",
					duration: 6000,
				});
				break;
			case "trial":
				toast.success(`⭐ You won ${result.label}!`, {
					description:
						"Your trial access has been activated. Check your account features!",
					duration: 8000,
				});
				break;
			case "boost":
				toast.success(`⚡ You won ${result.label}!`, {
					description:
						"Your credit boost is now active for 7 days. Earn 30% more on all credits!",
					duration: 8000,
				});
				break;
			case "perk":
				toast.success(`🎁 You won ${result.label}!`, {
					description:
						"Your next spin will award double credits. Spin again tomorrow!",
					duration: 8000,
				});
				break;
			default:
				toast.success(`🎉 You won ${result.label}!`, {
					description: "Your reward has been added to your account.",
					duration: 5000,
				});
		}

		// TODO: Integrate with actual credit system
		// Based on prizeId, call appropriate API:
		// - ai-* → addCredits('aiCredits', amount)
		// - skiptrace-* → addCredits('skipTraces', amount)
		// - leads-* → addCredits('leads', amount)
		// - trial-* → activateFeatureTrial(featureName, duration)
		// - boost-* → activateCreditBoost(percentage, duration)
		// - perk-* → setNextSpinBonus(multiplier)
	};

	return (
		<Dialog
			open={isWheelSpinnerModalOpen}
			onOpenChange={closeWheelSpinnerModal}
		>
			<DialogContent className="mx-4 max-w-lg sm:mx-auto">
				<DialogTitle className="sr-only">Daily Wheel Spinner</DialogTitle>
				<div className="relative">
					{/* Wheel content */}
					<div className="flex flex-col items-center gap-4 py-6">
						<div className="text-center">
							<h2 className="font-bold text-2xl">Daily Spin</h2>
							<p className="text-muted-foreground text-sm">
								Win AI, SkipTrace, or Lead credits, plus exclusive trials and
								perks!
							</p>
						</div>

						<PrizeWheel
							userId={userId}
							cadence="daily"
							prizes={prizes}
							onWin={handleWin}
							showWheelPopup={false}
							showResultModal={false}
							showCountdown
							theme={{
								size: 280,
								spinUpMs: 300,
								spinDownMs: 2000,
							}}
						/>

						{/* Prize Legend */}
						<div className="w-full px-4">
							<PrizeLegend prizes={prizes} />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
