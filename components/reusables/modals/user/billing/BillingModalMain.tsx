"use client";

import { Button } from "@/components/ui/button";
import type {
	BillingHistoryItem,
	PaymentDetails,
} from "@/constants/_faker/profile/userData";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { downloadBillingHistoryAsXlsx } from "@/lib/_utils/files/billingHistory";
import { useModalStore } from "@/lib/stores/dashboard";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
// ! Switched to Zustand for modal visibility control
import BillingHistoryStep from "./steps/BillingHistoryStep";
import ManageSubscriptionModal from "./steps/ManageSubscriptionModal";
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
	// ! Zustand modal state for open/close
	const { isBillingModalOpen, openBillingModal, closeBillingModal } =
		useModalStore((state) => ({
			isBillingModalOpen: state.isBillingModalOpen,
			openBillingModal: state.openBillingModal,
			closeBillingModal: state.closeBillingModal,
		})); // ! Correct hook from stores/useModalStore.ts

	// * Local state for non-modal logic
	const [isSubscriptionActive, setIsSubscriptionActive] = useState(
		subscription.status === "active",
	);
	const [subscriptionType, setSubscriptionType] = useState<
		"monthly" | "yearly"
	>(subscription.type);

	// * Local modal state for Payment Methods and Manage Subscription
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isManageSubscriptionOpen, setIsManageSubscriptionOpen] =
		useState(false);

	// * Handlers
	const openPaymentModal = () => {
		setIsPaymentModalOpen(true);
		setIsManageSubscriptionOpen(false);
	};
	const closePaymentModal = () => setIsPaymentModalOpen(false);
	const openManageSubscriptionModal = () => {
		setIsManageSubscriptionOpen(true);
		setIsPaymentModalOpen(false);
	};
	const closeManageSubscriptionModal = () => setIsManageSubscriptionOpen(false);

	const switchToYearly = () => setSubscriptionType("yearly");
	const cancelSubscription = () => {
		setIsSubscriptionActive(false);
		setSubscriptionType("monthly");
	};

	// ! Only render modal if open (Zustand-controlled)
	if (!isBillingModalOpen) return null;

	return (
		<Modal
			title="Billing & Subscription"
			description="Manage your payment methods, subscription, and view billing history."
			isOpen={isBillingModalOpen}
			onClose={closeBillingModal}
		>
			<div className="space-y-6">
				{/* * Payment Methods */}
				<h3 className="text-center font-medium text-lg dark:text-gray-200">
					Payment Methods
				</h3>
				<PaymentMethodsStep
					paymentDetails={paymentDetails}
					subscription={subscription}
					onAddPaymentMethod={openPaymentModal}
				/>
				{/* Manage Subscription Modal Trigger & Modal */}
				<div className="my-4 flex justify-center">
					<ManageSubscriptionModal subscription={subscription} />
				</div>
				{/* * Billing History */}
				<h3 className="text-center font-medium text-lg dark:text-gray-200">
					Billing History
				</h3>
				<BillingHistoryStep billingHistory={billingHistory} />
				<Button
					onClick={() => downloadBillingHistoryAsXlsx(billingHistory)}
					variant="secondary"
					className="mt-4 w-full"
					type="button"
				>
					Download all
				</Button>
				{/* * Payment Method Modal (overlay) */}
				{isPaymentModalOpen && (
					<Modal
						title="Add Payment Method"
						description="Add or update your payment method."
						isOpen={isPaymentModalOpen}
						onClose={closePaymentModal}
					>
						{/* Insert actual payment method form/component here */}
						<div>Add Payment Method Form (todo)</div>
					</Modal>
				)}

				{/* todo: Add PaymentModal if you want to support adding new payment methods */}
			</div>
		</Modal>
	);
};

export default BillingModalMain;
