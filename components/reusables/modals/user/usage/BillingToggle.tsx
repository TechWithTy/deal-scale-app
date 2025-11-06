/**
 * Billing Cycle Toggle Component
 * Switches between Monthly and Yearly billing options
 */

import type { BillingCycle } from "@/lib/mock/plans";

interface BillingToggleProps {
	billingCycle: BillingCycle;
	onBillingCycleChange: (cycle: BillingCycle) => void;
	disabled?: boolean;
}

export function BillingToggle({
	billingCycle,
	onBillingCycleChange,
	disabled = false,
}: BillingToggleProps) {
	return (
		<div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-1">
			<button
				type="button"
				onClick={() => onBillingCycleChange("monthly")}
				disabled={disabled}
				className={`flex-1 rounded-md px-4 py-2 font-medium text-sm transition-colors ${
					billingCycle === "monthly"
						? "bg-primary text-primary-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				} disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				Monthly
			</button>
			<button
				type="button"
				onClick={() => onBillingCycleChange("yearly")}
				disabled={disabled}
				className={`flex-1 rounded-md px-4 py-2 font-medium text-sm transition-colors ${
					billingCycle === "yearly"
						? "bg-primary text-primary-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				} disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				Yearly
			</button>
		</div>
	);
}
