import { cn } from "@/lib/_utils";
import { ArrowUpRight } from "lucide-react"; // You can use any icon library
import type React from "react";
import { useState, useEffect } from "react";

interface StatCardProps {
	title: string;
	value: number;
	onClick: () => void;
	isActive: boolean; // Prop to check if the card is active
	click: boolean; // Prop to check if the card can be clicked
	animationComplete: boolean; // Prop to check if the animation should stop
	addedToday?: number; // New prop for how many were added today
	comingSoon?: boolean; // ! Overlay for coming soon features
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	onClick,
	isActive,
	click,
	animationComplete,
	addedToday,
	comingSoon,
}) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div
			className={cn(
				"relative rounded-md bg-card p-4 text-center text-card-foreground shadow-md transition-all",
				click && "cursor-pointer",
				click &&
					isActive &&
					!animationComplete &&
					value > 0 &&
					"animate-pulse border-4 border-accent",
			)}
			tabIndex={click && !comingSoon ? 0 : -1}
			role={click && !comingSoon ? "button" : undefined}
			onClick={click && !comingSoon ? onClick : undefined}
			onKeyUp={
				click && !comingSoon
					? (e) => {
							if (e.key === "Enter" || e.key === " ") onClick();
						}
					: undefined
			}
		>
			<p>{title}</p>
			<h2 className="py-1 text-3xl font-bold" suppressHydrationWarning>
				{mounted ? value : 0}
			</h2>

			{/* Added today badge */}
			{addedToday && (
				<div className="mt-2 flex items-center justify-center rounded-full bg-green-500/10 px-2 py-1 text-sm text-green-600 dark:bg-green-500/20 dark:text-green-400">
					<ArrowUpRight className="mr-1" size={16} />
					<span>{addedToday.toLocaleString()} just today</span>
				</div>
			)}

			{/* ! Coming Soon Overlay */}
			{comingSoon && (
				// ! Overlay blocks interaction and signals feature is not yet available
				<div
					className="pointer-events-auto absolute inset-0 z-10 flex select-none items-center justify-center rounded-md bg-background/60"
					style={{ backdropFilter: "blur(2px)" }}
				>
					<span className="text-lg font-bold text-primary-foreground drop-shadow">
						Coming Soon
					</span>
				</div>
			)}
		</div>
	);
};

export default StatCard;
