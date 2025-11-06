"use client";
/**
 * UsageMain: Optimized Usage Modal with enhanced UI/UX
 * Displays subscription details, usage metrics, and upgrade options
 */
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingComparisonCard from "./PricingComparisonCard";
import UsageCloseButton from "./UsageCloseButton";
import UsageModalActions from "./UsageModalActions";
import UsageProgressBar from "./UsageProgressBar";
import UsageSummary from "./UsageSummarySidebar";
import { useUsageData } from "./useUsageData";

const UsageModalMain: React.FC = () => {
	const { data: subscription, loading } = useUsageData();
	const [activeTab, setActiveTab] = useState<string>("overview");

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
					<p className="text-gray-600 text-sm dark:text-gray-400">
						Loading your subscription details...
					</p>
				</div>
			</div>
		);
	}

	if (!subscription) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<p className="text-gray-900 text-lg font-semibold dark:text-white">
						Error loading data
					</p>
					<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
						Please try again later or contact support
					</p>
				</div>
			</div>
		);
	}

	const { aiCredits, name, price } = subscription;
	const { allotted, used } = aiCredits;
	const isFreePlan = name === "None" || price === "$0";

	const handleViewPlans = () => {
		setActiveTab("upgrade");
		toast.info("View available upgrade plans below");
	};

	const handleSelectPlan = (planId: string) => {
		toast.success(`Selected ${planId} plan! (Implement checkout logic here)`);
		// TODO: Implement actual checkout/upgrade logic
	};

	const handleManageBilling = () => {
		toast.info("Redirecting to billing portal... (Implement Stripe portal)");
		// TODO: Implement Stripe billing portal redirect
	};

	const handleClose = () => {
		// TODO: Implement modal close logic
		toast.info("Close modal");
	};

	return (
		<div className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl dark:bg-gray-900">
			{/* Close Button */}
			<UsageCloseButton onClick={handleClose} />

			{/* Content */}
			<div className="p-8">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
								<UsageSummary subscription={subscription} />
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
							onClose={handleClose}
							onViewPlans={handleViewPlans}
							onManageBilling={isFreePlan ? undefined : handleManageBilling}
							isFreePlan={isFreePlan}
							hasActiveSubscription={subscription.status === "active"}
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
	);
};

export default UsageModalMain;
