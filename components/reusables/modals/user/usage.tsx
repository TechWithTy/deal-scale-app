"use client";
/**
 * AiUsageModal: Optimized modal wrapper for subscription usage display
 * Integrates with modal store and provides enhanced UI/UX
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { useModalStore } from "@/lib/stores/dashboard";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import PricingComparisonCard from "./usage/PricingComparisonCard";
import UsageModalActions from "./usage/UsageModalActions";
import UsageProgressBar from "./usage/UsageProgressBar";
import UsageSummary from "./usage/UsageSummarySidebar";

export interface UsageData {
	subscription: UserProfileSubscription;
}

// Fallback when no subscription is present on the signed-in user
const defaultSubscription: UserProfileSubscription = {
	id: "0",
	stripeSubscriptionID: "",
	name: "None",
	type: "monthly",
	status: "inactive",
	price: "$0",
	aiCredits: { allotted: 1000, used: 250, resetInDays: 7 },
	leads: { allotted: 500, used: 120, resetInDays: 7 },
	skipTraces: { allotted: 200, used: 50, resetInDays: 7 },
	renewalDate: "",
	createdAt: "",
	planDetails: "",
};

const AiUsageModal: React.FC = () => {
	const { isUsageModalOpen, closeUsageModal } = useModalStore();
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState<string>("overview");

	type CreditsBucket = { allotted: number; used: number; resetInDays?: number };
	type SubscriptionShape = {
		id?: string;
		stripeSubscriptionID?: string;
		name?: string;
		type?: string;
		status?: "active" | "inactive" | string;
		price?: string;
		aiCredits?: CreditsBucket;
		leads?: CreditsBucket;
		skipTraces?: CreditsBucket;
		renewalDate?: string;
		createdAt?: string;
		planDetails?: string;
	};

	const subscriptionData: UserProfileSubscription = useMemo(() => {
		const subs = (
			session?.user as { subscription?: SubscriptionShape } | undefined
		)?.subscription;
		if (!subs) return defaultSubscription;
		return {
			id: subs.id ?? defaultSubscription.id,
			stripeSubscriptionID:
				subs.stripeSubscriptionID ?? defaultSubscription.stripeSubscriptionID,
			name: subs.name ?? defaultSubscription.name,
			type:
				(subs.type as UserProfileSubscription["type"]) ??
				defaultSubscription.type,
			status:
				(subs.status as UserProfileSubscription["status"]) ??
				defaultSubscription.status,
			price: subs.price ?? defaultSubscription.price,
			aiCredits: {
				allotted:
					subs.aiCredits?.allotted ?? defaultSubscription.aiCredits.allotted,
				used: subs.aiCredits?.used ?? defaultSubscription.aiCredits.used,
				resetInDays:
					subs.aiCredits?.resetInDays ??
					defaultSubscription.aiCredits.resetInDays,
			},
			leads: {
				allotted: subs.leads?.allotted ?? defaultSubscription.leads.allotted,
				used: subs.leads?.used ?? defaultSubscription.leads.used,
				resetInDays:
					subs.leads?.resetInDays ?? defaultSubscription.leads.resetInDays,
			},
			skipTraces: {
				allotted:
					subs.skipTraces?.allotted ?? defaultSubscription.skipTraces.allotted,
				used: subs.skipTraces?.used ?? defaultSubscription.skipTraces.used,
				resetInDays:
					subs.skipTraces?.resetInDays ??
					defaultSubscription.skipTraces.resetInDays,
			},
			renewalDate: subs.renewalDate ?? defaultSubscription.renewalDate,
			createdAt: subs.createdAt ?? defaultSubscription.createdAt,
			planDetails: subs.planDetails ?? defaultSubscription.planDetails,
		};
	}, [session]);

	if (!isUsageModalOpen) return null;

	const { aiCredits, name, price } = subscriptionData;
	const { allotted, used } = aiCredits;
	const isFreePlan = name === "None" || price === "$0";

	const handleViewPlans = () => {
		setActiveTab("upgrade");
	};

	const handleSelectPlan = (planId: string) => {
		toast.success(`Selected ${planId} plan! Redirecting to checkout...`);
		// TODO: Implement actual checkout/upgrade logic
		// Example: window.location.href = `/checkout?plan=${planId}`;
	};

	const handleManageBilling = () => {
		toast.info("Opening billing portal...");
		// TODO: Implement Stripe billing portal redirect
		// Example: window.location.href = stripePortalUrl;
	};

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={closeUsageModal}
			onKeyDown={(e) => {
				if (e.key === "Escape") closeUsageModal();
			}}
		>
			<div
				className="fade-in-0 zoom-in-95 relative w-full max-w-5xl animate-in rounded-xl bg-white shadow-2xl dark:bg-gray-900"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={closeUsageModal}
					type="button"
					className="absolute top-4 right-4 z-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
					aria-label="Close modal"
				>
					<X className="h-5 w-5" />
				</button>

				{/* Content */}
				<div className="p-8">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						{/* Tab Navigation */}
						<TabsList className="mb-6 grid w-full grid-cols-2">
							<TabsTrigger value="overview">Usage Overview</TabsTrigger>
							<TabsTrigger value="upgrade">
								{isFreePlan ? "View Plans" : "Change Plan"}
							</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value="overview" className="space-y-6">
							<div className="grid gap-8 lg:grid-cols-2">
								{/* Left Column: Subscription Summary */}
								<div>
									<UsageSummary subscription={subscriptionData} />
								</div>

								{/* Right Column: Circular Progress */}
								<div className="flex items-center justify-center">
									<UsageProgressBar
										used={used}
										allotted={allotted}
										label="AI Credits"
									/>
								</div>
							</div>

							{/* Actions */}
							<UsageModalActions
								onClose={closeUsageModal}
								onViewPlans={handleViewPlans}
								onManageBilling={isFreePlan ? undefined : handleManageBilling}
								isFreePlan={isFreePlan}
								hasActiveSubscription={subscriptionData.status === "active"}
							/>
						</TabsContent>

						{/* Upgrade Tab */}
						<TabsContent value="upgrade" className="min-h-[400px]">
							<PricingComparisonCard
								currentPlanId={name}
								onSelectPlan={handleSelectPlan}
								billingCycle="monthly"
							/>

							{/* Back Button */}
							<div className="mt-6 flex justify-center">
								<button
									type="button"
									onClick={() => setActiveTab("overview")}
									className="text-gray-600 text-sm hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
								>
									← Back to Overview
								</button>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

export default AiUsageModal;
