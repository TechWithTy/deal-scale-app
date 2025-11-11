import { describe, expect, it } from "vitest";

import { computeSmartImportDecision } from "@/components/quickstart/utils/smartImportDecision";

describe("computeSmartImportDecision", () => {
	it("returns CRM decision when a CRM connection exists", () => {
		const decision = computeSmartImportDecision({
			hasConnectedCrm: true,
			hasLeadLists: false,
			crmDisplayLabel: "GoHighLevel",
		});

		expect(decision.type).toBe("crm");
		expect(decision.toastTitle).toBe("Connected CRM detected");
		expect(decision.toastDescription).toBe(
			"Review your GoHighLevel mapping before importing.",
		);
	});

	it("returns select decision when lists exist and no CRM connection", () => {
		const decision = computeSmartImportDecision({
			hasConnectedCrm: false,
			hasLeadLists: true,
			crmDisplayLabel: "GoHighLevel",
		});

		expect(decision.type).toBe("select");
		expect(decision.toastTitle).toBe("Opening lead list selector...");
		expect(decision.toastDescription).toBe(
			"Select from your existing lists or upload a new one",
		);
	});

	it("returns upload decision when no lists and no CRM connection", () => {
		const decision = computeSmartImportDecision({
			hasConnectedCrm: false,
			hasLeadLists: false,
			crmDisplayLabel: "GoHighLevel",
		});

		expect(decision.type).toBe("upload");
		expect(decision.toastTitle).toBe("Upload your first lead list");
		expect(decision.toastDescription).toBe(
			"Import leads from CSV to get started",
		);
	});
});



