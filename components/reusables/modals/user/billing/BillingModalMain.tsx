"use client";

import { Button } from "@/components/ui/button";
import type {
	BillingHistoryItem,
	PaymentDetails,
} from "@/constants/_faker/profile/userData";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { downloadBillingHistoryAsXlsx } from "@/lib/_utils/files/billingHistory";
import { useState } from "react";
import BillingHistoryStep from "./steps/BillingHistoryStep";
import PaymentMethodsStep from "./steps/PaymentMethodsStep";
import SubscriptionDetailsStep from "./steps/SubscriptionDetailsStep";

// * Main Billing UI composed of all billing steps/components
interface BillingMainProps {
	billingHistory: BillingHistoryItem[];
	paymentDetails: PaymentDetails;
	subscription: UserProfileSubscription;
}

const BillingModalMain = ({
	billingHistory,
	paymentDetails,
	subscription,
}: BillingMainProps) => {
	// * Centralized state for modals and subscription
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
	const [isSubscriptionActive, setIsSubscriptionActive] = useState(
		subscription.status === "active",
	);
	const [subscriptionType, setSubscriptionType] = useState<
		"monthly" | "yearly"
	>(subscription.type);

	// * Handlers
	const openPaymentModal = () => setIsPaymentModalOpen(true);
	const closePaymentModal = () => setIsPaymentModalOpen(false);
	const openSubscriptionModal = () => setIsSubscriptionModalOpen(true);
	const closeSubscriptionModal = () => setIsSubscriptionModalOpen(false);
	const switchToYearly = () => setSubscriptionType("yearly");
	const cancelSubscription = () => {
		setIsSubscriptionActive(false);
		setSubscriptionType("monthly");
	};

	return (
		<div className="space-y-6">
			{/* * Payment Methods */}
			<PaymentMethodsStep
				paymentDetails={paymentDetails}
				subscription={subscription}
				onAddPaymentMethod={openPaymentModal}
			/>
			<Button
				onClick={openSubscriptionModal}
				className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
				type="button"
			>
				Manage Subscription
			</Button>
			{/* * Billing History */}
			<BillingHistoryStep billingHistory={billingHistory} />
			<Button
				onClick={() => downloadBillingHistoryAsXlsx(billingHistory)}
				variant="secondary"
				className="mt-4 w-full"
				type="button"
			>
				Download all
			</Button>
			{/* * Subscription Details Modal */}
			<SubscriptionDetailsStep
				isOpen={isSubscriptionModalOpen}
				onClose={closeSubscriptionModal}
				subscription={subscription}
				isSubscriptionActive={isSubscriptionActive}
				subscriptionType={subscriptionType}
				onSwitchToYearly={switchToYearly}
				onCancel={cancelSubscription}
			/>
			{/* todo: Add PaymentModal if you want to support adding new payment methods */}
		</div>
	);
};

export default BillingModalMain;
