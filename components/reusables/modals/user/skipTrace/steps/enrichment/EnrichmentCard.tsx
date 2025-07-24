import type { InputField } from "@/types/skip-trace/enrichment";
import { Check } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/_utils/kanban/utils";
import type { EnrichmentOption } from "@/types/skip-trace/enrichment";

interface EnrichmentCardProps {
	enrichment: EnrichmentOption;
	isSelected: boolean;
	onToggle: () => void;
	userInput: Record<InputField, string>;
}

export function EnrichmentCard({
	enrichment,
	isSelected,
	onToggle,
	userInput,
}: EnrichmentCardProps) {
	const { id, title, description, cost, features, isFree, badge } = enrichment;

	const missingFields = enrichment.requiredFields.filter(
		(field: InputField) => !userInput[field],
	);
	const isDisabled = missingFields.length > 0;

	const cardContent = (
		<div className="flex h-full flex-col p-4">
			<div className="flex items-start justify-between">
				<div className="flex-grow pr-2">
					<h3 className="font-semibold text-md">{title}</h3>
					<p className="text-gray-500 text-sm">{description}</p>
				</div>
				<div className="flex flex-col items-end">
					<div className="font-bold text-lg">{isFree ? "Free" : `${cost}`}</div>
					{!isFree && <p className="text-gray-500 text-xs">credits</p>}
				</div>
			</div>
			<div className="my-4 flex-grow border-gray-200 border-t" />
			<ul className="space-y-2 text-sm">
				{features.map((feature) => (
					<li key={feature} className="flex items-center">
						<Check className="mr-2 h-4 w-4 text-green-500" />
						<span>{feature}</span>
					</li>
				))}
			</ul>
		</div>
	);

	// Visually hidden checkbox for accessibility
	return isDisabled ? (
		<Tooltip>
			<TooltipTrigger asChild>
				<label
					className={cn(
						"relative block cursor-not-allowed rounded-lg border opacity-50 transition-all duration-200",
						isSelected
							? "border-transparent bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/50"
							: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600",
					)}
					aria-disabled="true"
				>
					<input
						type="checkbox"
						checked={isSelected}
						readOnly
						className="sr-only"
						tabIndex={-1}
						aria-hidden="true"
					/>
					{badge && typeof badge === "string" && (
						<Badge
							variant="default"
							className="-right-2 -top-2 absolute rounded-full px-2 py-1 font-semibold text-xs"
						>
							{badge}
						</Badge>
					)}
					{cardContent}
				</label>
			</TooltipTrigger>
			<TooltipContent>
				{missingFields.length > 0 ? (
					<div className="space-y-1">
						<p className="font-semibold">This option requires:</p>
						<ul className="list-disc pl-4">
							{missingFields.map((field, idx) => (
								<li key={typeof field === "string" ? field : `field-${idx}`}>
									{String(field)}
								</li>
							))}
						</ul>
					</div>
				) : (
					<p>Please enter the required field(s) to enable this option.</p>
				)}
			</TooltipContent>
		</Tooltip>
	) : (
		<label
			className={cn(
				"relative block cursor-pointer rounded-lg border transition-all duration-200",
				isSelected
					? "border-transparent bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/50"
					: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600",
			)}
			style={{ userSelect: "none" }}
		>
			<input
				type="checkbox"
				checked={isSelected}
				onChange={() => onToggle()}
				className="sr-only"
			/>
			{badge && typeof badge === "string" && (
				<Badge
					variant="default"
					className="-right-2 -top-2 absolute rounded-full px-2 py-1 font-semibold text-xs"
				>
					{badge}
				</Badge>
			)}
			{cardContent}
		</label>
	);
}
