import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import type { FC } from "react";
import { useEffect } from "react";

// * Props for SubscriptionDetailsStep
interface SubscriptionDetailsStepProps {
	isOpen: boolean;
	onClose: () => void;
	subscription: UserProfileSubscription;
	isSubscriptionActive: boolean;
	subscriptionType: "monthly" | "yearly";
	onSwitchToYearly: () => void;
	onCancel: () => void;
}

const SubscriptionDetailsStep: FC<SubscriptionDetailsStepProps> = ({
	isOpen,
	onClose,
	subscription,
	isSubscriptionActive,
	subscriptionType,
	onSwitchToYearly,
	onCancel,
}) => {
	// * Prevent background scroll when modal is open
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
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
					type="button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						aria-hidden="true"
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
				<div className="space-y-4 p-4 sm:p-6 dark:text-gray-300">
					<div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
						<div>
							<h4 className="font-medium text-lg dark:text-gray-200">
								{subscription.name} Subscription
							</h4>
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								{isSubscriptionActive
									? "Active Subscription"
									: "No Active Subscription"}
							</p>
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Renews: {subscription.renewalDate}
							</p>
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Price: ${subscription.price} / {subscriptionType}
							</p>
							{/* AI Credits */}
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								AI Credits: {subscription.aiCredits.used} /{" "}
								{subscription.aiCredits.allotted} used
							</p>
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Resets in: {subscription.aiCredits.resetInDays} days
							</p>
							{/* Leads */}
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Leads: {subscription.leads.used} / {subscription.leads.allotted}{" "}
								used
							</p>
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Resets in: {subscription.leads.resetInDays} days
							</p>
							{/* Skip Traces */}
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Skip Traces: {subscription.skipTraces.used} /{" "}
								{subscription.skipTraces.allotted} used
							</p>
							<p className="text-muted-foreground text-sm dark:text-gray-400">
								Resets in: {subscription.skipTraces.resetInDays} days
							</p>
						</div>
						{/* Conditional Rendering of Buy or Cancel Button */}
						{!isSubscriptionActive ? (
							<Button
								className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
								type="button"
							>
								Buy Subscription
							</Button>
						) : (
							<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
								<Button
									variant="outline"
									onClick={onCancel}
									className="w-full px-4 py-2 sm:w-auto"
									type="button"
								>
									Cancel
								</Button>
								{subscriptionType === "monthly" && (
									<Button
										onClick={onSwitchToYearly}
										className="w-full whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 sm:w-auto"
										type="button"
									>
										Switch to Yearly and Save
									</Button>
								)}
							</div>
						)}
					</div>
					<Separator className="dark:border-gray-600" />
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm dark:text-gray-400">
							Plan Details: {subscription.planDetails}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionDetailsStep;
