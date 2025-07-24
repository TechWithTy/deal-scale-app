"use client";
import { useModalStore } from "@/lib/stores/dashboard";
// ! UsageMain: Composes the entire Usage modal from modular subcomponents
import type React from "react";
import { toast } from "sonner";
import UsageCloseButton from "./UsageCloseButton";
import UsageModalActions from "./UsageModalActions";
import UsageProgressBar from "./UsageProgressBar";
import UsageSummary from "./UsageSummary";
import { useUsageData } from "./useUsageData";

const UsageModalMain: React.FC = () => {
	const { isUsageModalOpen, closeUsageModal } = useModalStore();
	const { data: subscription, loading } = useUsageData();

	if (!isUsageModalOpen) return null;
	if (loading) return <div>Loading...</div>;
	if (!subscription) return <div>Error loading data</div>;

	const { aiCredits } = subscription;
	const { allotted, used } = aiCredits;

	const handleBuyNow = () => {
		toast.success("Buy Now clicked! (Implement payment logic here)");
	};

	return (
		<div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<UsageCloseButton onClick={closeUsageModal} />
			<UsageSummary subscription={subscription} />
			<UsageProgressBar used={used} allotted={allotted} />
			<UsageModalActions
				onClose={closeUsageModal}
				onUpgrade={() => {
					/* todo: upgrade logic */
				}}
				onBuyNow={handleBuyNow}
			/>
		</div>
	);
};

export default UsageModalMain;
