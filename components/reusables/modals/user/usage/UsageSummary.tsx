// ! UsageSummary: Shows credits, leads, skip traces, etc.
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import type React from "react";

interface UsageSummaryProps {
	subscription: UserProfileSubscription;
}

const UsageSummary: React.FC<UsageSummaryProps> = ({ subscription }) => {
	const { name, status, aiCredits, leads, skipTraces, price, renewalDate } =
		subscription;
	const { allotted, used, resetInDays } = aiCredits;

	return (
		<>
			<div className="text-center font-medium text-lg">
				AI Subscription - {name} Plan
				<span
					className={`ml-2 text-sm ${status === "active" ? "text-green-500" : "text-red-500"}`}
				>
					{status}
				</span>
			</div>
			<div className="mt-4 text-center">
				<div className="text-gray-500 text-sm">Price: {price}</div>
				<div className="text-gray-500 text-sm">
					Renewal Date: {new Date(renewalDate).toLocaleDateString()}
				</div>
			</div>
			<div className="mt-6 flex flex-col items-center rounded-lg border p-4 dark:border-gray-600">
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
		</>
	);
};

export default UsageSummary;
