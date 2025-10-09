"use client";

import { type LucideIcon } from "lucide-react";
import { type FC, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/_utils";

export interface QuickStartActionConfig {
	readonly label: string;
	readonly icon: LucideIcon;
	readonly variant?: "default" | "outline";
	readonly className?: string;
	readonly onClick: () => void;
}

export interface QuickStartCardConfig {
	readonly key: string;
	readonly title: string;
	readonly description: string;
	readonly icon?: LucideIcon;
	readonly iconNode?: ReactNode;
	readonly cardClassName?: string;
	readonly titleClassName?: string;
	readonly iconWrapperClassName?: string;
	readonly iconClassName?: string;
	readonly footer?: ReactNode;
	readonly actions: QuickStartActionConfig[];
}

interface QuickStartActionsGridProps {
	readonly cards: QuickStartCardConfig[];
}

const QuickStartActionsGrid: FC<QuickStartActionsGridProps> = ({ cards }) => (
	<div
		className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 xl:grid-cols-3"
		style={{
			display: "grid",
			gridAutoRows: "auto",
			alignItems: "start",
			justifyItems: "center",
		}}
	>
		{cards.map(
			({
				key,
				title,
				description,
				icon: Icon,
				iconNode,
				actions,
				cardClassName,
				titleClassName,
				iconWrapperClassName,
				iconClassName,
				footer,
			}) => (
				<Card
					key={key}
					className={cn(
						"group flex h-auto w-full max-w-sm flex-col border-2 transition hover:border-primary/20 hover:shadow-lg",
						cardClassName,
					)}
				>
					<CardHeader className="pb-4 text-center">
						<div
							className={cn(
								"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20",
								iconWrapperClassName,
							)}
						>
							{iconNode ??
								(Icon ? (
									<Icon className={cn("h-6 w-6 text-primary", iconClassName)} />
								) : null)}
						</div>
						<CardTitle className={cn("text-xl", titleClassName)}>
							{title}
						</CardTitle>
						<CardDescription>{description}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col pt-0">
						<div className="flex flex-col gap-3">
							{actions.map(
								({ label, icon: ActionIcon, variant, className, onClick }) => (
									<Button
										key={label}
										type="button"
										size="lg"
										variant={variant}
										className={cn("w-full", className)}
										onClick={onClick}
									>
										<ActionIcon className="mr-2 h-4 w-4" />
										{label}
									</Button>
								),
							)}
							{footer}
						</div>
					</CardContent>
				</Card>
			),
		)}
	</div>
);

export default QuickStartActionsGrid;
