"use client";

import type { ActivityDataPoint, ChartConfigLocal } from "../types";

type CustomPopoverProps = {
	activeNode: ActivityDataPoint | null;
	config: ChartConfigLocal;
};

export default function CustomPopover({
	activeNode,
	config,
}: CustomPopoverProps) {
	if (!activeNode) return null;

	return (
		<div className="min-w-[220px] rounded-lg border bg-background p-3 shadow-md">
			<div className="mb-2">
				<div className="text-muted-foreground text-xs">Time</div>
				<div className="font-medium text-sm">
					{new Date(activeNode.timestamp).toLocaleString()}
				</div>
			</div>
			<div className="space-y-1">
				{Object.entries(activeNode as Record<string, string | number>)
					.filter(([key]) => key !== "timestamp")
					.map(([key, value]) => {
						const entry = config[key];
						const label = entry?.label ?? key;
						const color = entry?.color ?? "#8884d8";
						return (
							<div
								key={key}
								className="flex items-center justify-between gap-4"
							>
								<div className="flex items-center gap-2">
									<span
										aria-hidden
										className="inline-block h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: color }}
									/>
									<span className="text-muted-foreground text-xs">{label}</span>
								</div>
								<span className="font-medium text-sm">{String(value)}</span>
							</div>
						);
					})}
			</div>
		</div>
	);
}
