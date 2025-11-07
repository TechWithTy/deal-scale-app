"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign, Info, ExternalLink } from "lucide-react";

interface MonetizationToggleProps {
	enabled: boolean;
	onEnabledChange: (enabled: boolean) => void;
	priceMultiplier: number;
	onPriceMultiplierChange: (value: number) => void;
	acceptedTerms: boolean;
	onAcceptedTermsChange: (accepted: boolean) => void;
	itemType?: "template" | "workflow" | "search" | "voice" | "salesScript";
}

export function MonetizationToggle({
	enabled,
	onEnabledChange,
	priceMultiplier,
	onPriceMultiplierChange,
	acceptedTerms,
	onAcceptedTermsChange,
	itemType = "template",
}: MonetizationToggleProps) {
	const itemTypeLabel = (() => {
		switch (itemType) {
			case "workflow":
				return "Workflow";
			case "search":
				return "Search";
			case "voice":
				return "Voice";
			case "salesScript":
				return "Sales Script";
			case "template":
			default:
				return "Template";
		}
	})();

	return (
		<>
			{/* Monetization Toggle */}
			<div className="flex items-center justify-between rounded-lg border border-border bg-gradient-to-r from-emerald-50 to-green-50 p-4 dark:from-emerald-950/20 dark:to-green-950/20">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
						<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					</div>
					<div className="space-y-0.5">
						<div className="flex items-center gap-2">
							<Label
								htmlFor="monetization-enabled"
								className="cursor-pointer font-semibold"
							>
								Monetize {itemTypeLabel}
							</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Info className="h-4 w-4 text-muted-foreground" />
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p className="text-xs">
											Enable to share your {itemType} in the public marketplace
											and earn revenue from each use. {itemTypeLabel}s are
											reviewed before publication.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<p className="text-muted-foreground text-xs">
							Make this {itemType} public and earn from marketplace sales
						</p>
					</div>
				</div>
				<Switch
					id="monetization-enabled"
					checked={enabled}
					onCheckedChange={onEnabledChange}
				/>
			</div>

			{/* Monetization Settings (shown when enabled) */}
			{enabled && (
				<div className="space-y-4 rounded-lg border border-border bg-accent/30 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4 text-primary" />
							<Label className="font-semibold text-sm">
								Monetization Settings
							</Label>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Info className="h-4 w-4 text-muted-foreground" />
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p className="text-xs">
											Enabling monetization will make this {itemType} publicly
											available in the marketplace. You'll earn revenue based on
											usage and your selected multiplier.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>

					{/* Price Multiplier Selector */}
					<div className="space-y-2">
						<Label htmlFor="price-multiplier" className="text-sm">
							Price Multiplier
						</Label>
						<Select
							value={priceMultiplier.toString()}
							onValueChange={(value) =>
								onPriceMultiplierChange(Number.parseInt(value, 10))
							}
						>
							<SelectTrigger id="price-multiplier" className="w-full">
								<SelectValue placeholder="Select multiplier" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">1x - Standard ($9.99/use)</SelectItem>
								<SelectItem value="2">2x - Premium ($19.99/use)</SelectItem>
								<SelectItem value="3">
									3x - Professional ($29.99/use)
								</SelectItem>
								<SelectItem value="4">4x - Enterprise ($39.99/use)</SelectItem>
								<SelectItem value="5">5x - Elite ($49.99/use)</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Higher multipliers are recommended for advanced, proven {itemType}
							s with strong performance history.
						</p>
					</div>

					{/* Terms & Conditions */}
					<div className="flex items-start gap-2 rounded-md border border-border bg-background/50 p-3">
						<Switch
							id="accept-terms"
							checked={acceptedTerms}
							onCheckedChange={onAcceptedTermsChange}
							className="mt-0.5"
						/>
						<div className="flex-1 space-y-1">
							<Label
								htmlFor="accept-terms"
								className="cursor-pointer font-medium text-sm"
							>
								I accept the Terms & Conditions
							</Label>
							<p className="text-muted-foreground text-xs">
								By enabling monetization, you agree to our{" "}
								<a
									href="/terms/marketplace"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-primary hover:underline"
								>
									Marketplace Terms
									<ExternalLink className="h-3 w-3" />
								</a>{" "}
								and{" "}
								<a
									href="/terms/creator"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-primary hover:underline"
								>
									Creator Agreement
									<ExternalLink className="h-3 w-3" />
								</a>
							</p>
						</div>
					</div>

					{/* Public Notice */}
					<div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
						<Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
						<p className="text-blue-900 text-xs dark:text-blue-100">
							<strong>Public {itemTypeLabel}:</strong> This {itemType} will be
							visible in the public marketplace. Your profile name and stats
							will be displayed. Ensure no sensitive information is included.
						</p>
					</div>
				</div>
			)}
		</>
	);
}
