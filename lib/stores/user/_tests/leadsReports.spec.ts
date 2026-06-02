import { describe, expect, it } from "vitest";
import { useUserLeadsReportsStore } from "../userProfile";

describe("Leads reports summaries", () => {
	it("expose DNC and status summaries", () => {
		const s = useUserLeadsReportsStore.getState();

		const dnc = s.dncSummary();
		expect(dnc).toHaveProperty("totalDNC");
		expect(dnc).toHaveProperty("byFlag");
		expect(dnc).toHaveProperty("bySource");

		const statuses = s.statusCounts();
		expect(typeof statuses).toBe("object");
	});
});
