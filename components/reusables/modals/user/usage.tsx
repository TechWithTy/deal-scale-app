"use client";

import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { useModalStore } from "@/lib/stores/dashboard";
import type React from "react";
import { useEffect, useState } from "react";

export interface UsageData {
	subscription: UserProfileSubscription;
}

// Simulate fetching real subscription data (replace with actual API call)
const fetchSubscriptionData = async (): Promise<UserProfileSubscription> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockUserProfile.subscription);
		}, 1000);
	});
};

const AiUsageModal: React.FC = () => {
	const { isUsageModalOpen, closeUsageModal } = useModalStore();
	const [subscriptionData, setSubscriptionData] =
		useState<UserProfileSubscription | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getData = async () => {
			const data = await fetchSubscriptionData(); // Replace with real API call
			setSubscriptionData(data);
			setLoading(false);
		};

		getData();
	}, []);

	if (!isUsageModalOpen) return null; // Don't render anything if the modal is not open

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!subscriptionData) {
		return <div>Error loading data</div>;
	}

	const { name, status, aiCredits, leads, skipTraces, price, renewalDate } =
		subscriptionData;

	const { allotted, used, resetInDays } = aiCredits;
	const usagePercentage = (used / allotted) * 100 || 0;

	return (
		<div
			style={{ zIndex: 9999 }}
			className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
		>
			<div
				style={{ zIndex: 10000 }}
				className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
			>
				{/* Close Button */}
				<button
					onClick={closeUsageModal}
					type="button"
					className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
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
							status === "active" ? "text-green-500" : "text-red-500"
						}`}
					>
						{status}
					</span>
				</div>

				{/* Center the price and renewal date */}
				<div className="mt-4 text-center">
					<div className="text-gray-500 text-sm">Price: {price}</div>
					<div className="text-gray-500 text-sm">
						Renewal Date: {new Date(renewalDate).toLocaleDateString()}
					</div>
				</div>

				{/* Center the Buy Now button */}
				<div className="mt-4 flex justify-center">
					<button
						type="button"
						className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700"
					>
						Buy Now
					</button>
				</div>

				{/* Usage Info */}
				<div className="mt-6 flex flex-col items-center rounded-lg border p-4 dark:border-gray-600">
					{/* Usage Circle */}
					<div className="relative h-32 w-32">
						<svg
							aria-hidden="true"
							className="h-full w-full"
							viewBox="0 0 36 36"
						>
							<path
								className="text-gray-200 dark:text-gray-700"
								d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="text-blue-600"
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
							<span className="font-semibold text-gray-700 text-xl dark:text-gray-300">
								{Math.floor(usagePercentage)}%
							</span>
						</div>
					</div>

					{/* Usage Details */}
					<div className="mt-4 text-center">
						{/* AI Credits */}
						<div className="text-gray-500 text-sm dark:text-gray-400">
							AI Credits Used:
						</div>
						<div className="font-medium text-gray-800 text-lg dark:text-gray-200">
							{used} / {allotted}
						</div>

						{/* Leads */}
						<div className="mt-2 text-gray-500 text-sm dark:text-gray-400">
							Leads Included:
						</div>
						<div className="font-medium text-gray-800 text-lg dark:text-gray-200">
							{leads.used} / {leads.allotted}
						</div>

						{/* Skip Traces */}
						<div className="mt-2 text-gray-500 text-sm dark:text-gray-400">
							Skip Traces Included:
						</div>
						<div className="font-medium text-gray-800 text-lg dark:text-gray-200">
							{skipTraces.used} / {skipTraces.allotted}
						</div>

						{/* Credit Reset */}
						<div className="mt-2 text-gray-500 text-sm dark:text-gray-400">
							Next Credit Reset In:
						</div>
						<div className="font-medium text-gray-800 text-lg dark:text-gray-200">
							{resetInDays} day{resetInDays !== 1 ? "s" : ""}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AiUsageModal;
