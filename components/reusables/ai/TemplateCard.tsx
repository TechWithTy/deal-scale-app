/**
 * Template Card Component
 * Memoized card for individual prompt templates
 * Optimized for rendering large lists
 */

"use client";

import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Copy,
	Check,
	Boxes,
	Shapes,
	Layers,
	MessageSquare,
	Zap,
	Star,
	CheckCircle2,
	XCircle,
	AlertCircle,
	ExternalLink,
} from "lucide-react";
import { memo } from "react";

export interface TemplateCardProps {
	template: {
		id: string;
		name: string;
		description?: string;
		tags: string[];
		isBuiltIn?: boolean;
	};
	categoryConfig: {
		color: string;
		bgColor: string;
		borderColor: string;
	};
	providerStatus: {
		chatgpt: { enabled: boolean; working: boolean; url: string };
		claude: { enabled: boolean; working: boolean; url: string };
		gemini: { enabled: boolean; working: boolean; url: string };
	};
	isCopied: boolean;
	onSelect: () => void;
	onProviderClick: (
		provider: "chatgpt" | "claude" | "gemini",
		status: { enabled: boolean; working: boolean; url: string },
	) => void;
}

function getProviderIcon(
	provider: "chatgpt" | "claude" | "gemini",
	status: { enabled: boolean; working: boolean },
) {
	if (!status.enabled) {
		return <XCircle className="h-3 w-3" />;
	}
	if (!status.working) {
		return <AlertCircle className="h-3 w-3" />;
	}
	return <CheckCircle2 className="h-3 w-3" />;
}

function getProviderColor(
	provider: "chatgpt" | "claude" | "gemini",
	status: { enabled: boolean; working: boolean },
) {
	if (!status.enabled) {
		return "bg-gray-500/10 text-gray-500 border-gray-500/30 cursor-not-allowed";
	}
	if (!status.working) {
		return "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20";
	}

	switch (provider) {
		case "chatgpt":
			return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20";
		case "claude":
			return "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20";
		case "gemini":
			return "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20";
	}
}

function getProviderBrandIcon(provider: "chatgpt" | "claude" | "gemini") {
	switch (provider) {
		case "chatgpt":
			return <MessageSquare className="h-3 w-3" />;
		case "claude":
			return <Zap className="h-3 w-3" />;
		case "gemini":
			return <Star className="h-3 w-3 fill-current" />;
	}
}

function getProviderLabel(provider: "chatgpt" | "claude" | "gemini") {
	switch (provider) {
		case "chatgpt":
			return "ChatGPT";
		case "claude":
			return "Claude";
		case "gemini":
			return "Gemini";
	}
}

export const TemplateCard = memo(function TemplateCard({
	template,
	categoryConfig,
	providerStatus,
	isCopied,
	onSelect,
	onProviderClick,
}: TemplateCardProps) {
	const isMaster =
		template.tags.includes("master") || template.tags.includes("featured");
	const isN8n = template.tags.includes("n8n");
	const isMake = template.tags.includes("make");
	const isKestra = template.tags.includes("kestra");

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`relative w-full rounded-lg border-l-4 p-2.5 text-left sm:p-3 ${categoryConfig.borderColor} ${categoryConfig.bgColor} group mb-2 transition-all hover:bg-accent/50 active:scale-[0.98] ${
				isMaster ? "shadow-lg ring-2 ring-primary/50" : ""
			}`}
		>
			{/* Provider Chips - Responsive Top Right */}
			<div className="absolute top-1 right-1 flex items-center gap-0.5 sm:top-2 sm:right-2 sm:gap-1">
				{(["chatgpt", "claude", "gemini"] as const).map((provider) => {
					const status = providerStatus[provider];
					return (
						<TooltipProvider key={provider}>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onProviderClick(provider, status);
										}}
										disabled={!status.enabled}
										className={`flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full p-1 transition-all sm:min-h-[28px] sm:min-w-[28px] sm:p-1.5 ${getProviderColor(provider, status)}`}
									>
										{getProviderBrandIcon(provider)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" className="text-xs">
									{!status.enabled ? (
										<span>
											{getProviderLabel(provider)} not enabled
											<br />
											<span className="text-[10px] text-muted-foreground">
												Enable in settings
											</span>
										</span>
									) : !status.working ? (
										<span>
											{getProviderLabel(provider)} connection issue
											<br />
											<span className="text-[10px] text-muted-foreground">
												Check API key
											</span>
										</span>
									) : (
										<span>Open in {getProviderLabel(provider)}</span>
									)}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					);
				})}
			</div>

			<div className="mb-1.5 flex items-start justify-between gap-2 sm:gap-3">
				<div className="min-w-0 flex-1 pr-16 sm:pr-20">
					<div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
						<h4
							className={`truncate font-semibold text-xs sm:text-sm ${categoryConfig.color} ${isMaster ? "sm:text-base" : ""}`}
						>
							{template.name}
						</h4>
						{isMaster && (
							<Badge
								variant="default"
								className="h-3.5 animate-pulse bg-primary px-1.5 py-0 text-[8px] text-primary-foreground sm:h-4 sm:text-[9px]"
							>
								MASTER
							</Badge>
						)}
						{isN8n && (
							<Badge
								variant="default"
								className="h-3.5 bg-gradient-to-r from-pink-500 to-rose-500 px-1.5 py-0 text-[8px] text-white sm:h-4 sm:text-[9px]"
							>
								<Boxes className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
								<span className="xs:inline hidden">n8n</span>
							</Badge>
						)}
						{isMake && (
							<Badge
								variant="default"
								className="h-3.5 bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-0 text-[8px] text-white sm:h-4 sm:text-[9px]"
							>
								<Shapes className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
								<span className="xs:inline hidden">Make</span>
							</Badge>
						)}
						{isKestra && (
							<Badge
								variant="default"
								className="h-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0 text-[8px] text-white sm:h-4 sm:text-[9px]"
							>
								<Layers className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
								<span className="xs:inline hidden">Kestra</span>
							</Badge>
						)}
						{template.isBuiltIn &&
							!isMaster &&
							!isN8n &&
							!isMake &&
							!isKestra && (
								<Badge
									variant="outline"
									className="h-3.5 px-1 py-0 text-[8px] sm:h-4 sm:text-[9px]"
								>
									Built-in
								</Badge>
							)}
					</div>
					<p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed sm:text-xs">
						{template.description}
					</p>
				</div>
			</div>

			{/* Tags */}
			{template.tags.length > 0 && (
				<div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2">
					{template.tags.slice(0, 3).map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="h-3.5 px-1.5 py-0 text-[8px] sm:h-4 sm:text-[9px]"
						>
							{tag}
						</Badge>
					))}
					{template.tags.length > 3 && (
						<Badge
							variant="secondary"
							className="h-3.5 px-1.5 py-0 text-[8px] sm:h-4 sm:text-[9px]"
						>
							+{template.tags.length - 3}
						</Badge>
					)}
				</div>
			)}

			{/* Copy Icon - Bottom Right on Hover */}
			<div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
				{isCopied ? (
					<div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600/20">
						<Check className="h-4 w-4 text-green-600" />
					</div>
				) : (
					<div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/80 backdrop-blur-sm hover:bg-muted">
						<Copy className="h-3.5 w-3.5 text-muted-foreground" />
					</div>
				)}
			</div>
		</button>
	);
});
