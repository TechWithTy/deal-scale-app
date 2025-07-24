// ! UsageProgressBar: Shows AI credits progress
import type React from "react";

interface UsageProgressBarProps {
	used: number;
	allotted: number;
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
	used,
	allotted,
}) => {
	const usagePercentage = (used / allotted) * 100 || 0;
	return (
		<div className="relative mx-auto h-32 w-32">
			<svg aria-hidden="true" className="h-full w-full" viewBox="0 0 36 36">
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
	);
};

export default UsageProgressBar;
