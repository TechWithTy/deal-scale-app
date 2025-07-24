"use client";
import { useModalStore } from "@/lib/stores/dashboard";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { Button } from "@/components/ui/button";
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
				className="inline-flex items-center rounded-full border bg-white text-gray-700 transition-colors duration-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
			>
				<span className="animate-jump pr-2">
					<ArrowUpCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
				</span>
				Upgrade now
			</Button>
		);
	}
	return null;
};
