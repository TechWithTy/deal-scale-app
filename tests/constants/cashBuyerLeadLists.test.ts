import { describe, expect, it } from "vitest";

import { leadListData } from "@/constants/dashboard/leadList";

describe("cash buyer lead lists", () => {
	it("includes lead-list fixtures backed by typed cash buyer leads", () => {
		const cashBuyerLists = leadListData.filter((list) =>
			list.listName.toLowerCase().includes("cash buyers"),
		);

		expect(cashBuyerLists.length).toBeGreaterThanOrEqual(3);
		for (const list of cashBuyerLists) {
			expect(list.records).toBe(list.leads.length);
			expect(list.phone).toBeGreaterThan(0);
			expect(list.emails).toBeGreaterThan(0);
			expect(list.leads.length).toBeGreaterThan(0);
			expect(
				list.leads.every((lead) => lead.leadCategory === "cash-buyers"),
			).toBe(true);
			expect(
				list.leads.every((lead) => Boolean(lead.cashBuyerProfile?.buyBox)),
			).toBe(true);
		}
	});
});
