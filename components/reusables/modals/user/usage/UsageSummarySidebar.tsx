import { Badge } from "@/components/ui/badge";
// ! UsageSummary: Shows credits, leads, skip traces with enhanced UI/UX
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import { Calendar, CreditCard, Zap } from "lucide-react";
import type React from "react";

interface UsageSummaryProps {
	subscription: UserProfileSubscription;
}

const UsageSummary: React.FC<UsageSummaryProps> = ({ subscription }) => {
	const { name, status, aiCredits, leads, skipTraces, price, renewalDate } =
		subscription;
	const { resetInDays } = aiCredits;

	// Calculate if user is on free plan
	const isFreePlan = name === "None" || price === "$0";

	// Format renewal date safely
	const formatRenewalDate = (date: string) => {
		try {
			const parsedDate = new Date(date);
			if (Number.isNaN(parsedDate.getTime())) {
				return "Not applicable";
			}
			return parsedDate.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return "Not applicable";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
						{isFreePlan ? "Free Plan" : `${name} Plan`}
					</h2>
					<Badge
						variant={status === "active" ? "default" : "secondary"}
						className={
							status === "active"
								? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
								: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
						}
					>
						{status === "active" ? "Active" : "Inactive"}
					</Badge>
				</div>

				{/* Pricing Info */}
				<div className="flex items-center gap-4 text-gray-600 text-sm dark:text-gray-400">
					<div className="flex items-center gap-2">
						<CreditCard className="h-4 w-4" />
						<span className="font-medium text-gray-900 dark:text-white">
							{isFreePlan ? "$0/month" : `${price}/month`}
						</span>
					</div>
					{!isFreePlan && (
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<span>Renews: {formatRenewalDate(renewalDate)}</span>
						</div>
					)}
				</div>
			</div>

			{/* Usage Stats Grid */}
			<div className="space-y-4 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
				<div className="flex items-center gap-2 font-medium text-gray-700 text-sm dark:text-gray-300">
					<Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
					<span>Current Usage</span>
				</div>

				<div className="grid gap-4">
					{/* AI Credits */}
					<UsageMetric
						label="AI Credits"
						used={aiCredits.used}
						allotted={aiCredits.allotted}
						color="blue"
					/>

					{/* Leads */}
					<UsageMetric
						label="Leads"
						used={leads.used}
						allotted={leads.allotted}
						color="purple"
					/>

					{/* Skip Traces */}
					<UsageMetric
						label="Skip Traces"
						used={skipTraces.used}
						allotted={skipTraces.allotted}
						color="indigo"
					/>
				</div>

				{/* Reset Timer */}
				{!isFreePlan && (
					<div className="mt-4 rounded-md border-blue-500 border-l-4 bg-blue-50 p-3 dark:bg-blue-900/20">
						<p className="text-blue-800 text-sm dark:text-blue-200">
							Credits reset in{" "}
							<span className="font-semibold">
								{resetInDays} day{resetInDays !== 1 ? "s" : ""}
							</span>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

/**
 * UsageMetric: Individual metric with progress bar
 */
interface UsageMetricProps {
	label: string;
	used: number;
	allotted: number;
	color: "blue" | "purple" | "indigo";
}

const UsageMetric: React.FC<UsageMetricProps> = ({
	label,
	used,
	allotted,
	color,
}) => {
	const percentage = allotted > 0 ? (used / allotted) * 100 : 0;
	const isLow = percentage < 20;
	const isModerate = percentage >= 20 && percentage < 50;
	const isHigh = percentage >= 50 && percentage < 80;
	const isCritical = percentage >= 80;

	const colorClasses = {
		blue: {
			bg: "bg-blue-100 dark:bg-blue-900/20",
			fill: isCritical
				? "bg-red-500"
				: isHigh
					? "bg-orange-500"
					: isModerate
						? "bg-yellow-500"
						: "bg-blue-600",
		},
		purple: {
			bg: "bg-purple-100 dark:bg-purple-900/20",
			fill: isCritical
				? "bg-red-500"
				: isHigh
					? "bg-orange-500"
					: isModerate
						? "bg-yellow-500"
						: "bg-purple-600",
		},
		indigo: {
			bg: "bg-indigo-100 dark:bg-indigo-900/20",
			fill: isCritical
				? "bg-red-500"
				: isHigh
					? "bg-orange-500"
					: isModerate
						? "bg-yellow-500"
						: "bg-indigo-600",
		},
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="font-medium text-gray-700 text-sm dark:text-gray-300">
					{label}
				</span>
				<span className="font-semibold text-gray-900 text-sm dark:text-white">
					{used.toLocaleString()} / {allotted.toLocaleString()}
				</span>
			</div>
			<div className="relative h-2 w-full overflow-hidden rounded-full">
				<div
					className={`absolute inset-0 ${colorClasses[color].bg}`}
					aria-hidden="true"
				/>
				<div
					className={`relative h-full transition-all duration-500 ease-out ${colorClasses[color].fill}`}
					style={{ width: `${Math.min(percentage, 100)}%` }}
					aria-label={`${percentage.toFixed(1)}% used`}
				/>
			</div>
			<div className="flex justify-between text-gray-500 text-xs dark:text-gray-400">
				<span>{percentage.toFixed(1)}% used</span>
				{allotted > 0 && (
					<span>{(allotted - used).toLocaleString()} remaining</span>
				)}
			</div>
		</div>
	);
};

export default UsageSummary;
