"use client";

import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { useModalStore } from "@/lib/stores/dashboard";
import type React from "react";
import { useMemo } from "react";
import { useSession } from "next-auth/react";

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
	aiCredits: { allotted: 0, used: 0, resetInDays: 0 },
	leads: { allotted: 0, used: 0, resetInDays: 0 },
	skipTraces: { allotted: 0, used: 0, resetInDays: 0 },
	renewalDate: "",
	createdAt: "",
	planDetails: "",
};

const AiUsageModal: React.FC = () => {
	const { isUsageModalOpen, closeUsageModal } = useModalStore();
	const { data: session } = useSession();

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
				allotted: subs.aiCredits?.allotted ?? 0,
				used: subs.aiCredits?.used ?? 0,
				resetInDays: subs.aiCredits?.resetInDays ?? 0,
			},
			leads: {
				allotted: subs.leads?.allotted ?? 0,
				used: subs.leads?.used ?? 0,
				resetInDays: subs.leads?.resetInDays ?? 0,
			},
			skipTraces: {
				allotted: subs.skipTraces?.allotted ?? 0,
				used: subs.skipTraces?.used ?? 0,
				resetInDays: subs.skipTraces?.resetInDays ?? 0,
			},
			renewalDate: subs.renewalDate ?? defaultSubscription.renewalDate,
			createdAt: subs.createdAt ?? defaultSubscription.createdAt,
			planDetails: subs.planDetails ?? defaultSubscription.planDetails,
		};
	}, [session]);

	if (!isUsageModalOpen) return null; // Don't render anything if the modal is not open

	const { name, status, aiCredits, leads, skipTraces, price, renewalDate } =
		subscriptionData;

	const { allotted, used, resetInDays } = aiCredits;
	const usagePercentage = (used / allotted) * 100 || 0;

	return (
		<div
			style={{ zIndex: 9999 }}
			className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
		>
			<div
				style={{ zIndex: 10000 }}
				className="relative w-full max-w-lg rounded-lg bg-card p-6 text-card-foreground shadow-lg"
			>
				{/* Close Button */}
				<button
					onClick={closeUsageModal}
					type="button"
					className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						stroke="currentColor"
						aria-hidden="true"
						className="h-6 w-6"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* Modal Content */}
				<div className="text-center font-medium text-lg">
					AI Subscription - {name} Plan
					<span
						className={`ml-2 text-sm ${
							status === "active" ? "text-green-500" : "text-destructive"
						}`}
					>
						{status}
					</span>
				</div>

				{/* Center the price and renewal date */}
				<div className="mt-4 text-center">
					<div className="text-muted-foreground text-sm">Price: {price}</div>
					<div className="text-muted-foreground text-sm">
						Renewal Date: {new Date(renewalDate).toLocaleDateString()}
					</div>
				</div>

				{/* Center the Buy Now button */}
				<div className="mt-4 flex justify-center">
					<button
						type="button"
						className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
					>
						Buy Now
					</button>
				</div>

				{/* Usage Info */}
				<div className="mt-6 flex flex-col items-center rounded-lg border border-border p-4">
					{/* Usage Circle */}
					<div className="relative h-32 w-32">
						<svg
							aria-hidden="true"
							className="h-full w-full"
							viewBox="0 0 36 36"
						>
							<path
								className="text-muted"
								d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="text-primary"
								strokeDasharray={`${usagePercentage}, 100`}
								d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke="currentColor"
								strokeWidth="4"
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="font-semibold text-foreground text-xl">
								{Math.floor(usagePercentage)}%
							</span>
						</div>
					</div>

					{/* Usage Details */}
					<div className="mt-4 text-center">
						{/* AI Credits */}
						<div className="text-muted-foreground text-sm">
							AI Credits Used:
						</div>
						<div className="font-medium text-foreground text-lg">
							{used} / {allotted}
						</div>

						{/* Leads */}
						<div className="mt-2 text-muted-foreground text-sm">
							Leads Included:
						</div>
						<div className="font-medium text-foreground text-lg">
							{leads.used} / {leads.allotted}
						</div>

						{/* Skip Traces */}
						<div className="mt-2 text-muted-foreground text-sm">
							Skip Traces Included:
						</div>
						<div className="font-medium text-foreground text-lg">
							{skipTraces.used} / {skipTraces.allotted}
						</div>

						{/* Credit Reset */}
						<div className="mt-2 text-muted-foreground text-sm">
							Next Credit Reset In:
						</div>
						<div className="font-medium text-foreground text-lg">
							{resetInDays} day{resetInDays !== 1 ? "s" : ""}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AiUsageModal;
