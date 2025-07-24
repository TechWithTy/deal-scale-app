"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PaymentMethodsStep from "../steps/PaymentMethodsStep";
import BillingHistoryStep from "../steps/BillingHistoryStep";
import SubscriptionDetailsStep from "../steps/SubscriptionDetailsStep";
import type {
	BillingHistoryItem,
	PaymentDetails,
} from "@/constants/_faker/profile/userData";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { downloadBillingHistoryAsXlsx } from "@/lib/_utils/files/billingHistory";
import { useModalStore } from "@/lib/stores/dashboard";
import type React from "react";
import { useEffect, useState } from "react";
import { PaymentModal } from "../../payment/steps/paymentDetailts";

// Modal Props
interface BillingModalProps {
	billingHistory: BillingHistoryItem[];
	paymentDetails: PaymentDetails;
	subscription: UserProfileSubscription;
}

// Custom Modal Component
const Modal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
	// Prevent background scroll when the modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
				<button
					type="button"
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
						strokeWidth="2"
						stroke="currentColor"
						className="h-6 w-6"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				{children}
			</div>
		</div>
	);
};

// Billing Modal Component
export const BillingModal: React.FC<BillingModalProps> = ({
	billingHistory,
	paymentDetails,
	subscription,
}) => {
	const { isBillingModalOpen, closeBillingModal } = useModalStore();
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
	const [isSubscriptionActive, setIsSubscriptionActive] = useState(
		subscription.status === "active",
	);
	const [subscriptionType, setSubscriptionType] = useState<
		"monthly" | "yearly"
	>(subscription.type);

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
		<>
			<Modal isOpen={isBillingModalOpen} onClose={closeBillingModal}>
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
				<BillingHistoryStep billingHistory={billingHistory} />
				<Button
					onClick={() => downloadBillingHistoryAsXlsx(billingHistory)}
					variant="secondary"
					className="mt-4 w-full"
				>
					Download all
				</Button>
			</Modal>

			{isPaymentModalOpen && (
				<PaymentModal closePaymentModal={closePaymentModal} />
			)}
			<SubscriptionDetailsStep
				isOpen={isSubscriptionModalOpen}
				onClose={closeSubscriptionModal}
				subscription={subscription}
				isSubscriptionActive={isSubscriptionActive}
				subscriptionType={subscriptionType}
				onSwitchToYearly={switchToYearly}
				onCancel={cancelSubscription}
			/>
		</>
	);
};
