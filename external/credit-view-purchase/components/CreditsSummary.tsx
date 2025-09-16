"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buildPurchaseUrl, type CreditKind } from "../utils/buildPurchaseUrl";

export interface CreditBucket {
	allotted?: number;
	used?: number;
}

export interface CreditsSummaryProps {
	ai?: CreditBucket;
	leads?: CreditBucket;
	skipTraces?: CreditBucket;
	/** Optional default amount to prefill in purchase URL if we cannot infer a good target */
	defaultAmount?: number;
	/** Base URL for the external purchase app, defaults to https://buy.dealscale.io */
	purchaseBaseUrl?: string;
}

function Line({
	label,
	kind,
	bucket,
	defaultAmount = 100,
	purchaseBaseUrl = "https://buy.dealscale.io",
}: {
	label: string;
	kind: CreditKind;
	bucket?: CreditBucket;
	defaultAmount?: number;
	purchaseBaseUrl?: string;
}) {
	const used = bucket?.used ?? 0;
	const allotted = bucket?.allotted ?? 0;
	const remaining = Math.max(0, allotted - used);
	const amount = remaining > 0 ? remaining : defaultAmount;
	const href = buildPurchaseUrl(kind, amount, purchaseBaseUrl);
	const pctRemaining =
		allotted > 0 ? Math.max(0, Math.min(100, (remaining / allotted) * 100)) : 0;

	return (
		<div className="rounded-md border border-border bg-card p-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex flex-col">
						<span className="text-sm font-medium text-foreground">{label}</span>
						<span className="text-xs text-muted-foreground">
							{used} / {allotted}
						</span>
					</div>
					<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
						Remaining: {remaining}
					</span>
				</div>
				<Link
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
					aria-label={`Add ${label} credits`}
				>
					<Plus className="h-4 w-4" />
				</Link>
			</div>
			{/* Remaining progress bar */}
			<div
				className="mt-2 h-1.5 w-full rounded bg-muted"
				role="progressbar"
				aria-label={`${label} remaining`}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(pctRemaining)}
			>
				<div
					className="h-full rounded bg-primary"
					style={{ width: `${pctRemaining}%` }}
				/>
			</div>
		</div>
	);
}

export function CreditsSummary({
	ai,
	leads,
	skipTraces,
	defaultAmount = 100,
	purchaseBaseUrl = "https://buy.dealscale.io",
}: CreditsSummaryProps) {
	return (
		<div className="space-y-2">
			<Line
				label="AI"
				kind="ai"
				bucket={ai}
				defaultAmount={defaultAmount}
				purchaseBaseUrl={purchaseBaseUrl}
			/>
			<Line
				label="Leads"
				kind="leads"
				bucket={leads}
				defaultAmount={defaultAmount}
				purchaseBaseUrl={purchaseBaseUrl}
			/>
			<Line
				label="Skip Traces"
				kind="skip-traces"
				bucket={skipTraces}
				defaultAmount={defaultAmount}
				purchaseBaseUrl={purchaseBaseUrl}
			/>
		</div>
	);
}
