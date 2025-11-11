/**
 * UsageProgressBar: Enhanced circular progress with multi-ring visualization
 */
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import type React from "react";

interface UsageProgressBarProps {
	used: number;
	allotted: number;
	label?: string;
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
	used,
	allotted,
	label = "Overall Usage",
}) => {
	const usagePercentage = allotted > 0 ? (used / allotted) * 100 : 0;
	const isLow = usagePercentage < 50;
	const isModerate = usagePercentage >= 50 && usagePercentage < 80;
	const isHigh = usagePercentage >= 80 && usagePercentage < 95;
	const isCritical = usagePercentage >= 95;

	// Determine color based on usage level
	const getStrokeColor = () => {
		if (isCritical) return "#ef4444"; // red-500
		if (isHigh) return "#f97316"; // orange-500
		if (isModerate) return "#eab308"; // yellow-500
		return "#3b82f6"; // blue-600
	};

	const getStatusIcon = () => {
		if (isCritical) return <AlertTriangle className="h-5 w-5 text-red-500" />;
		if (isHigh) return <Activity className="h-5 w-5 text-orange-500" />;
		return <CheckCircle className="h-5 w-5 text-green-500" />;
	};

	const getStatusText = () => {
		if (isCritical) return "Critical";
		if (isHigh) return "High Usage";
		if (isModerate) return "Moderate";
		return "Healthy";
	};

	const getStatusColor = () => {
		if (isCritical) return "text-red-600 dark:text-red-400";
		if (isHigh) return "text-orange-600 dark:text-orange-400";
		if (isModerate) return "text-yellow-600 dark:text-yellow-400";
		return "text-green-600 dark:text-green-400";
	};

	return (
		<div className="flex flex-col items-center space-y-4 py-6">
			{/* Circular Progress */}
			<div className="relative">
				{/* Outer glow effect */}
				<div
					className="absolute inset-0 rounded-full opacity-20 blur-xl"
					style={{ backgroundColor: getStrokeColor() }}
					aria-hidden="true"
				/>

				{/* Main circle */}
				<div className="relative h-40 w-40">
					<svg
						aria-hidden="true"
						className="-rotate-90 h-full w-full transform"
						viewBox="0 0 36 36"
					>
						{/* Background circle */}
						<circle
							cx="18"
							cy="18"
							r="15.9155"
							fill="none"
							className="stroke-gray-200 dark:stroke-gray-700"
							strokeWidth="3"
						/>

						{/* Progress circle */}
						<circle
							cx="18"
							cy="18"
							r="15.9155"
							fill="none"
							stroke={getStrokeColor()}
							strokeWidth="3"
							strokeDasharray={`${usagePercentage} ${100 - usagePercentage}`}
							strokeLinecap="round"
							className="transition-all duration-1000 ease-out"
						/>
					</svg>

					{/* Center content */}
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="font-bold text-3xl text-gray-900 dark:text-white">
							{Math.round(usagePercentage)}%
						</span>
						<span className="mt-1 text-gray-500 text-xs dark:text-gray-400">
							used
						</span>
					</div>
				</div>
			</div>

			{/* Status Indicator */}
			<div className="flex items-center gap-2">
				{getStatusIcon()}
				<div className="text-center">
					<p className={`font-semibold text-sm ${getStatusColor()}`}>
						{getStatusText()}
					</p>
					<p className="text-gray-600 text-xs dark:text-gray-400">
						{used.toLocaleString()} of {allotted.toLocaleString()}{" "}
						{label.toLowerCase()}
					</p>
				</div>
			</div>

			{/* Warning message for high usage */}
			{(isHigh || isCritical) && (
				<div
					className={`rounded-md border px-4 py-2 text-sm ${
						isCritical
							? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
							: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-200"
					}`}
				>
					{isCritical
						? "You've nearly exhausted your credits. Consider upgrading."
						: "You're approaching your usage limit."}
				</div>
			)}
		</div>
	);
};

export default UsageProgressBar;
