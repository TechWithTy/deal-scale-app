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
				className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 sm:w-auto"
				type="button"
			>
				Manage Subscription
			</Button>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl bg-card p-6 text-card-foreground shadow-xl">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-semibold text-foreground text-xl">
								Basic Subscription
							</h2>
							<button
								type="button"
								onClick={closeModal}
								className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								aria-label="Close"
							>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="mb-4 text-muted-foreground text-sm">
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
							<div className="rounded-lg bg-muted p-3">
								<div className="font-medium text-foreground">AI Credits</div>
								<div className="text-muted-foreground text-xs">
									{subscription.aiCredits.used} /{" "}
									{subscription.aiCredits.allotted} used
								</div>
								<div className="text-muted-foreground text-xs">
									Resets in: {subscription.aiCredits.resetInDays} days
								</div>
							</div>
							<div className="rounded-lg bg-muted p-3">
								<div className="font-medium text-foreground">Leads</div>
								<div className="text-muted-foreground text-xs">
									{subscription.leads.used} / {subscription.leads.allotted} used
								</div>
								<div className="text-muted-foreground text-xs">
									Resets in: {subscription.leads.resetInDays} days
								</div>
							</div>
							<div className="rounded-lg bg-muted p-3 md:col-span-2">
								<div className="font-medium text-foreground">Skip Traces</div>
								<div className="text-muted-foreground text-xs">
									{subscription.skipTraces.used} /{" "}
									{subscription.skipTraces.allotted} used
								</div>
								<div className="text-muted-foreground text-xs">
									Resets in: {subscription.skipTraces.resetInDays} days
								</div>
							</div>
						</div>
						<div className="mb-4 text-muted-foreground text-xs">
							Plan Details: {subscription.planDetails}
						</div>
						<Button
							className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
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
