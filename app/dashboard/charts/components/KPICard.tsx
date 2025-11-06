"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/_utils";

interface KPICardProps {
	title: string;
	value: string | number;
	delta: number;
	deltaLabel: string;
	icon: LucideIcon;
	format?: "number" | "percentage" | "currency";
}

export function KPICard({
	title,
	value,
	delta,
	deltaLabel,
	icon: Icon,
	format = "number",
}: KPICardProps) {
	const isPositive = delta >= 0;
	const TrendIcon = isPositive ? ArrowUp : ArrowDown;

	const formatValue = (val: string | number) => {
		if (format === "percentage") return `${val}%`;
		if (format === "currency") return `$${val.toLocaleString()}`;
		return val.toLocaleString();
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{formatValue(value)}</div>
				<div className="flex items-center gap-1 text-xs mt-1">
					<TrendIcon
						className={cn(
							"h-3 w-3",
							isPositive
								? "text-green-600 dark:text-green-500"
								: "text-red-600 dark:text-red-500",
						)}
					/>
					<span
						className={cn(
							"font-medium",
							isPositive
								? "text-green-600 dark:text-green-500"
								: "text-red-600 dark:text-red-500",
						)}
					>
						{isPositive ? "+" : ""}
						{delta}%
					</span>
					<span className="text-muted-foreground">{deltaLabel}</span>
				</div>
			</CardContent>
		</Card>
	);
}
