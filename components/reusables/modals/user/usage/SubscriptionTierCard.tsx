/**
 * Subscription Tier Card Component
 * Modern, clean design for subscription plans
 */

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import type { SubscriptionTier, BillingCycle } from "@/lib/mock/plans";

interface SubscriptionTierCardProps {
	tier: SubscriptionTier;
	billingCycle: BillingCycle;
	isSelected: boolean;
	onSelect: () => void;
	paymentState?: "idle" | "processing" | "confirmed";
	discountCode?: string;
}

export function SubscriptionTierCard({
	tier,
	billingCycle,
	isSelected,
	onSelect,
	paymentState = "idle",
}: SubscriptionTierCardProps) {
	const currentPrice =
		billingCycle === "monthly"
			? tier.billing.monthly.price
			: tier.billing.yearly.price;

	const priceSuffix =
		billingCycle === "monthly" ? "/ month" : tier.billing.yearly.label;

	const showDiscount =
		billingCycle === "yearly" && tier.billing.yearly.discount;

	const formatCredit = (value: number | "Unlimited"): string => {
		if (value === "Unlimited") return "Unlimited";
		return value.toLocaleString();
	};

	// Separate unlocked and locked features
	const unlockedFeatures = tier.planFeatures?.filter((f) => f.unlocked) || [];
	const lockedFeatures = tier.planFeatures?.filter((f) => !f.unlocked) || [];

	return (
		<div
			className={`group relative flex flex-col rounded-xl border-2 transition-all duration-200 ${
				isSelected
					? "border-primary bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-xl shadow-primary/5"
					: "border-border bg-card hover:border-primary/30 hover:shadow-lg"
			}`}
		>
			{/* Selected Indicator */}
			{isSelected && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<Badge className="bg-primary text-primary-foreground shadow-md">
						Selected
					</Badge>
				</div>
			)}

			<div className="flex flex-col p-6">
				{/* Header */}
				<div className="mb-4">
					<div className="mb-3 flex items-start justify-between">
						<h3 className="font-bold text-2xl text-foreground">{tier.name}</h3>
						{tier.tags && tier.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 justify-end">
								{tier.tags.map((tag, idx) => (
									<Badge
										key={idx}
										variant={tag === "Most Popular" ? "default" : "secondary"}
										className="text-xs font-semibold"
									>
										{tag}
									</Badge>
								))}
							</div>
						)}
					</div>
					{showDiscount && (
						<div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
							<span>✨</span>
							<span>{tier.billing.yearly.discount} off + 2 months free</span>
						</div>
					)}
				</div>

				{/* Pricing */}
				<div className="mb-6 border-b border-border/50 pb-4">
					<div className="flex flex-wrap items-baseline gap-2">
						<span className="font-bold text-4xl text-foreground">
							${currentPrice.toLocaleString()}
						</span>
						<span className="font-medium text-base text-muted-foreground">
							{priceSuffix}
						</span>
					</div>
					{billingCycle === "yearly" && tier.billing.yearly.original && (
						<div className="mt-2">
							<span className="text-sm text-muted-foreground line-through">
								${tier.billing.yearly.original.toLocaleString()}/yr
							</span>
						</div>
					)}
				</div>

				{/* Credits Section */}
				<div className="mb-6 space-y-3.5">
					<div className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
						Credits Per Month
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
								<span className="text-sm font-medium text-foreground">
									AI Credits
								</span>
							</div>
							<span className="font-semibold text-foreground">
								{formatCredit(tier.credits.ai)}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
								<span className="text-sm font-medium text-foreground">
									Lead Credits
								</span>
							</div>
							<span className="font-semibold text-foreground">
								{formatCredit(tier.credits.leads)}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
								<span className="text-sm font-medium text-foreground">
									Skip Trace
								</span>
							</div>
							<span className="font-semibold text-foreground">
								{formatCredit(tier.credits.skipTrace)}
							</span>
						</div>
					</div>

					{/* Credit Explanations */}
					<div className="mt-3 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
						<div className="space-y-1.5">
							<div>• 1 AI credit = 5 min call or 10 messages</div>
							<div>• 1 lead credit = 1 look-alike generation</div>
							<div>• 1 skip trace credit = 1 lead enrichment</div>
						</div>
					</div>
				</div>

				{/* Add-on */}
				<div className="mb-6 rounded-lg bg-muted/40 px-3 py-2 text-center">
					<span className="text-sm font-medium text-muted-foreground">
						{tier.addOn}
					</span>
				</div>

				{/* Key Features - Only show main tier features */}
				{tier.features.length > 0 && (
					<div className="mb-6">
						<div className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							What's Included
						</div>
						<ul className="space-y-2.5">
							{tier.features.map((feature, index) => (
								<li
									key={`${tier.id}-feature-${index}`}
									className="flex items-start gap-2.5"
								>
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
									<span className="text-sm text-foreground">{feature}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Unlocked Features - Show prominent */}
				{unlockedFeatures.length > 0 && (
					<div className="mb-4">
						<div className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Available Features
						</div>
						<div className="space-y-2">
							{unlockedFeatures.slice(0, 4).map((feature, index) => (
								<div
									key={`${tier.id}-unlocked-${index}`}
									className="flex items-center gap-2.5 rounded-md bg-green-50/50 px-2.5 py-2 dark:bg-green-950/20"
								>
									<CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
									{feature.link ? (
										<Link
											href={feature.link}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs font-medium text-foreground hover:text-primary transition-colors"
										>
											{feature.name}
										</Link>
									) : (
										<span className="text-xs font-medium text-foreground">
											{feature.name}
										</span>
									)}
								</div>
							))}
							{unlockedFeatures.length > 4 && (
								<div className="text-xs text-muted-foreground">
									+{unlockedFeatures.length - 4} more features
								</div>
							)}
						</div>
					</div>
				)}

				{/* Locked Features - Show less prominent */}
				{lockedFeatures.length > 0 && (
					<div className="mb-6">
						<div className="mb-2 flex items-center gap-2">
							<Lock className="h-3.5 w-3.5 text-muted-foreground" />
							<span className="text-xs font-medium text-muted-foreground">
								Coming in higher tiers
							</span>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{lockedFeatures.slice(0, 3).map((feature, index) => (
								<span
									key={`${tier.id}-locked-${index}`}
									className="rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground line-through"
								>
									{feature.name}
								</span>
							))}
							{lockedFeatures.length > 3 && (
								<span className="rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
									+{lockedFeatures.length - 3}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Spacer to push button to bottom */}
				<div className="mt-auto"></div>

				{/* Select Button */}
				<button
					type="button"
					onClick={onSelect}
					disabled={paymentState === "processing"}
					className={`mt-6 w-full rounded-lg py-3 font-semibold text-base transition-all ${
						isSelected
							? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg"
							: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:border-primary/80"
					} disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					{isSelected ? "✓ Selected" : "Select Plan"}
				</button>
			</div>
		</div>
	);
}
