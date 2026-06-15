import { describe, expect, it } from "vitest";

import type { DemoLead } from "@/external/shadcn-table/src/examples/Lead/types";
import { filterLeadList } from "@/external/shadcn-table/src/examples/Lead/utils/leadListFilters";

function lead(overrides: Partial<DemoLead>): DemoLead {
	return {
		id: overrides.id ?? "lead-1",
		status: overrides.status ?? "New Lead",
		name: overrides.name ?? "Taylor Morgan",
		address: overrides.address ?? "123 Main St",
		associatedAddress: overrides.associatedAddress ?? "123 Main St",
		email: overrides.email ?? "taylor@example.com",
		phone: overrides.phone ?? "555-0100",
		socials: overrides.socials ?? [],
		phoneVerified: overrides.phoneVerified ?? false,
		emailVerified: overrides.emailVerified ?? false,
		addressVerified: overrides.addressVerified ?? false,
		socialVerified: overrides.socialVerified ?? false,
	} as DemoLead;
}

describe("filterLeadList", () => {
	it("searches lead identity and contact fields", () => {
		const leads = [
			lead({ id: "1", name: "Taylor Morgan" }),
			lead({ id: "2", name: "Jordan Lee", phone: "555-7788" }),
		];

		const result = filterLeadList(leads, {
			query: "7788",
			status: "all",
			verification: "all",
		});

		expect(result.map((item) => item.id)).toEqual(["2"]);
	});

	it("filters by status and verification", () => {
		const leads = [
			lead({ id: "1", status: "Contacted", phoneVerified: true }),
			lead({ id: "2", status: "Contacted", phoneVerified: false }),
			lead({ id: "3", status: "Qualified", phoneVerified: true }),
		];

		const result = filterLeadList(leads, {
			query: "",
			status: "Contacted",
			verification: "phone",
		});

		expect(result.map((item) => item.id)).toEqual(["1"]);
	});
});
