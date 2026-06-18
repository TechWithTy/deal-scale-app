import { describe, expect, it } from "vitest";

import {
	makeData,
	makeRow,
} from "@/external/shadcn-table/src/examples/Lead/demoData";
import type { DemoLead } from "@/external/shadcn-table/src/examples/Lead/types";

function hasSocialLinks(lead: DemoLead) {
	return Array.isArray(lead.socials) && lead.socials.length > 0;
}

describe("lead list demo data", () => {
	it("keeps visible record counts aligned with generated leads", () => {
		const row = makeRow(0);

		expect(row.leads).toHaveLength(10);
		expect(row.records).toBe(row.leads.length);
		expect(row.phone).toBe(row.leads.filter((lead) => lead.phone).length);
		expect(row.emails).toBe(row.leads.filter((lead) => lead.email).length);
		expect(row.socials).toBe(row.leads.filter(hasSocialLinks).length);
	});

	it("applies the same lead count to every generated list row", () => {
		const rows = makeData(5);

		expect(rows).toHaveLength(5);
		for (const row of rows) {
			expect(row.records).toBe(10);
			expect(row.records).toBe(row.leads.length);
		}
	});

	it("seeds visible cash buyer rows with typed cash buyer profiles", () => {
		const rows = makeData(5);
		const cashBuyerRows = rows.filter((row) =>
			row.list.toLowerCase().includes("cash buyers"),
		);

		expect(cashBuyerRows).toHaveLength(3);
		for (const row of cashBuyerRows) {
			expect(row.records).toBe(10);
			for (const lead of row.leads) {
				expect(lead.leadCategory).toBe("cash-buyers");
				expect(lead.cashBuyerProfile?.buyerPersonas?.length).toBeGreaterThan(0);
				expect(lead.cashBuyerProfile?.strategies?.length).toBeGreaterThan(0);
				expect(lead.cashBuyerProfile?.buyBox?.zipCodes?.length).toBeGreaterThan(
					0,
				);
				expect(lead.cashBuyerProfile?.budgetMin).toBeGreaterThan(0);
				expect(lead.cashBuyerProfile?.budgetMax).toBeGreaterThan(
					lead.cashBuyerProfile?.budgetMin ?? 0,
				);
			}
		}
	});

	it("generates enough per-contact activity and intent signals to verify pagination", () => {
		const row = makeRow(0);
		const [lead] = row.leads;

		expect(lead).toBeDefined();
		expect(lead?.activity?.length).toBeGreaterThan(10);
		expect(lead?.intentSignals?.length).toBeGreaterThan(10);
		expect(
			new Set((lead?.activity ?? []).map((event) => event.summary)).size,
		).toBeGreaterThan(10);
		expect(
			Array.from(new Set((lead?.activity ?? []).map((event) => event.kind))),
		).toEqual(
			expect.arrayContaining([
				"call",
				"text",
				"email",
				"social",
				"outreach",
				"voicemail",
				"note",
			]),
		);
	});
});
