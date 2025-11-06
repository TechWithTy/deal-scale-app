/**
 * Debug Utility for Intent Signals
 *
 * Helper to verify intent signals are working correctly
 */

import type { LeadTypeGlobal } from "@/types/_dashboard/leads";

export function debugLeadIntentData(
	lead: LeadTypeGlobal,
	logLabel = "Lead",
): void {
	console.group(`🔍 ${logLabel} Intent Debug`);
	console.log(
		"Name:",
		`${lead.contactInfo?.firstName} ${lead.contactInfo?.lastName}`,
	);
	console.log("Status:", lead.status);
	console.log("Has intentSignals?", !!lead.intentSignals);
	console.log("Signal count:", lead.intentSignals?.length || 0);
	console.log("Has intentScore?", !!lead.intentScore);

	if (lead.intentScore) {
		console.log("Intent Score:", {
			total: lead.intentScore.total,
			level: lead.intentScore.level,
			trend: lead.intentScore.trend,
			trendPercent: lead.intentScore.trendPercent,
		});
		console.log("Score Breakdown:", lead.intentScore.breakdown);
	}

	if (lead.intentSignals && lead.intentSignals.length > 0) {
		console.log(
			"Sample Signals (first 3):",
			lead.intentSignals.slice(0, 3).map((s) => ({
				category: s.category,
				type: s.type,
				timestamp: s.timestamp,
			})),
		);
	}

	console.log(
		"Should show Intent Tab?",
		!!(lead.intentSignals && lead.intentSignals.length > 0 && lead.intentScore),
	);
	console.groupEnd();
}

export function verifyModalData(rowData: any): void {
	console.group("🔍 Modal Row Data Debug");
	console.log("Row original:", rowData);
	console.log("Has intentSignals?", !!rowData?.intentSignals);
	console.log("Signal count:", rowData?.intentSignals?.length || 0);
	console.log("Has intentScore?", !!rowData?.intentScore);
	console.log("Intent Score total:", rowData?.intentScore?.total);
	console.groupEnd();
}
