import { ArrowUpRight } from "lucide-react"; // You can use any icon library
import type React from "react";

interface StatCardProps {
	title: string;
	value: number;
	onClick: () => void;
	isActive: boolean; // Prop to check if the card is active
	click: boolean; // Prop to check if the card can be clicked
	animationComplete: boolean; // Prop to check if the animation should stop
	addedToday?: number; // New prop for how many were added today
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	onClick,
	isActive,
	click,
	animationComplete,
	addedToday,
}) => {
	return (
		<div
			tabIndex={click ? 0 : -1}
			role={click ? "button" : undefined}
			onClick={click ? onClick : undefined}
			onKeyUp={
				click
					? (e) => {
							if (e.key === "Enter" || e.key === " ") onClick();
						}
					: undefined
			}
			className={`${
				click && "cursor-pointer"
			} rounded-md bg-white p-4 text-center shadow-md transition-all dark:bg-gray-800 dark:text-white ${
				click && isActive && !animationComplete && value > 0
					? "animate-pulse border-4 border-orange-500 dark:border-gray-400"
					: ""
			}`}
		>
			<p>{title}</p>
			<h2 className="py-1 font-bold text-3xl">{value}</h2>

			{/* Added today badge */}
			{addedToday && (
				<div className="mt-2 flex items-center justify-center rounded-full bg-green-100 px-2 py-1 text-green-600 text-sm dark:bg-green-900 dark:text-green-400">
					<ArrowUpRight className="mr-1" size={16} />
					<span>{addedToday.toLocaleString()} just today</span>
				</div>
			)}
		</div>
	);
};

export default StatCard;
