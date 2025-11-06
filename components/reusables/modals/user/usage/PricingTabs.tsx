/**
 * Pricing Category Tabs Component
 * Modern tab design for category switching
 */

import type { PricingCategory } from "@/lib/mock/plans";

interface PricingTabsProps {
	activeCategory: PricingCategory;
	onCategoryChange: (category: PricingCategory) => void;
}

export function PricingTabs({
	activeCategory,
	onCategoryChange,
}: PricingTabsProps) {
	const categories: { id: PricingCategory; label: string }[] = [
		{ id: "subscription", label: "Subscription" },
		{ id: "successBased", label: "Success-Based" },
		{ id: "oneTime", label: "One-Time" },
	];

	return (
		<div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
			{categories.map((category) => (
				<button
					key={category.id}
					type="button"
					onClick={() => onCategoryChange(category.id)}
					className={`flex-1 rounded-md px-4 py-2.5 font-semibold text-sm transition-all ${
						activeCategory === category.id
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{category.label}
				</button>
			))}
		</div>
	);
}
