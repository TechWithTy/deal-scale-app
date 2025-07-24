import { Button } from "@/components/ui/button";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { useState } from "react";
import SubscriptionDetailsStep from "./SubscriptionDetailsStep";

interface ManageSubscriptionModalProps {
	subscription: UserProfileSubscription;
}

const ManageSubscriptionModal = ({
	subscription,
}: ManageSubscriptionModalProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubscriptionActive, setIsSubscriptionActive] = useState(
		subscription.status === "active",
	);
	const [subscriptionType, setSubscriptionType] = useState<
		"monthly" | "yearly"
	>(subscription.type);

	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);
	const switchToYearly = () => setSubscriptionType("yearly");
	const cancelSubscription = () => {
		setIsSubscriptionActive(false);
		setSubscriptionType("monthly");
	};

	return (
		<>
			<Button
				onClick={openModal}
				className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
				type="button"
			>
				Manage Subscription
			</Button>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
					<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-semibold text-gray-900 text-xl dark:text-white">
								Basic Subscription
							</h2>
							<button
								type="button"
								onClick={closeModal}
								className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
								aria-label="Close"
							>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="mb-4 text-gray-700 text-sm dark:text-gray-300">
							<div className="mb-1">
								{subscription.status === "active"
									? "Active Subscription"
									: "No Active Subscription"}
							</div>
							<div className="mb-1">
								Renews:{" "}
								<span className="font-medium">{subscription.renewalDate}</span>
							</div>
							<div className="mb-1">
								Price:{" "}
								<span className="font-medium">
									${subscription.price} / {subscription.type}
								</span>
							</div>
						</div>
						<div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
							<div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-900">
								<div className="font-medium text-gray-900 dark:text-white">
									AI Credits
								</div>
								<div className="text-gray-600 text-xs dark:text-gray-400">
									{subscription.aiCredits.used} /{" "}
									{subscription.aiCredits.allotted} used
								</div>
								<div className="text-gray-500 text-xs dark:text-gray-500">
									Resets in: {subscription.aiCredits.resetInDays} days
								</div>
							</div>
							<div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-900">
								<div className="font-medium text-gray-900 dark:text-white">
									Leads
								</div>
								<div className="text-gray-600 text-xs dark:text-gray-400">
									{subscription.leads.used} / {subscription.leads.allotted} used
								</div>
								<div className="text-gray-500 text-xs dark:text-gray-500">
									Resets in: {subscription.leads.resetInDays} days
								</div>
							</div>
							<div className="rounded-lg bg-gray-100 p-3 md:col-span-2 dark:bg-gray-900">
								<div className="font-medium text-gray-900 dark:text-white">
									Skip Traces
								</div>
								<div className="text-gray-600 text-xs dark:text-gray-400">
									{subscription.skipTraces.used} /{" "}
									{subscription.skipTraces.allotted} used
								</div>
								<div className="text-gray-500 text-xs dark:text-gray-500">
									Resets in: {subscription.skipTraces.resetInDays} days
								</div>
							</div>
						</div>
						<div className="mb-4 text-gray-700 text-xs dark:text-gray-300">
							Plan Details: {subscription.planDetails}
						</div>
						<Button
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							type="button"
							onClick={() => {
								/* todo: handle subscribe/upgrade */
							}}
						>
							{subscription.status === "active"
								? "Manage Subscription"
								: "Buy Subscription"}
						</Button>
					</div>
				</div>
			)}
		</>
	);
};

export default ManageSubscriptionModal;
