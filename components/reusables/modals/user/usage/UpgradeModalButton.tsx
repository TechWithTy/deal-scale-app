"use client";
import { Button } from "@/components/ui/button";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { useModalStore } from "@/lib/stores/dashboard";
import { ArrowUpCircle } from "lucide-react";

interface UpgradeButtonProps {
	currentMembership: UserProfileSubscription;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
	currentMembership,
}) => {
	const { openUpgradeModal } = useModalStore();

	if (currentMembership.name === "Basic") {
		return (
			<Button
				onClick={openUpgradeModal}
				className="group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 hover:border-amber-400/80 hover:shadow-xl hover:shadow-amber-500/50 dark:border-amber-500/50 dark:from-amber-500 dark:to-orange-600 dark:hover:border-amber-400/80 md:px-4 md:py-2"
				title="Upgrade now"
			>
				<span className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
				<span className="relative flex items-center justify-center">
					<ArrowUpCircle className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
				</span>
				<span className="relative ml-0 hidden font-semibold md:ml-2 md:inline">
					Upgrade now
				</span>
			</Button>
		);
	}
	return null;
};
