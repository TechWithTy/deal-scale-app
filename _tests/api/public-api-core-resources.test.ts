import {
	cancelCampaign,
	deleteCampaign,
	deleteLead,
	getCampaign,
	getCampaigns,
	getCashbuyer,
	getCashbuyers,
	getLead,
	getLeadList,
	getLeadListLeads,
	getLeadLists,
	getProperty,
	updateCampaign,
	updateLead,
} from "@/lib/api/public-api-core-resources";
import {
	normalizePublicApiLeadLists,
	toLeadList,
} from "@/lib/leads/public-api-lead-normalizers";
import { normalizePublicApiProperty } from "@/lib/properties/public-api-property-normalizer";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API Phase 1 core resources", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("calls Phase 1 core resource endpoints with encoded IDs and tokens", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
			),
		);

		await getCashbuyers({ limit: 5 }, "token");
		await getCashbuyer("buyer 1", "token");
		await getLeadLists({ limit: 10 }, "token");
		await getLeadList("list 1", "token");
		await getLeadListLeads("list 1", { cursor: "next" }, "token");
		await getLead("lead 1", "token");
		await updateLead("lead 1", { status: "contacted" }, "token");
		await deleteLead("lead 1", "token");
		await getProperty("property 1", "token");
		await getCampaigns({ status: "active" }, "token");
		await getCampaign("campaign 1", "token");
		await updateCampaign("campaign 1", { name: "Updated" }, "token");
		await cancelCampaign("campaign 1", "token");
		await deleteCampaign("campaign 1", "token");

		const calls = vi.mocked(fetch).mock.calls;
		expect(calls.map(([path]) => path)).toEqual([
			"/api/v1/cashbuyers?limit=5",
			"/api/v1/cashbuyers/buyer%201",
			"/api/v1/lead-lists?limit=10",
			"/api/v1/lead-lists/list%201",
			"/api/v1/lead-lists/list%201/leads?cursor=next",
			"/api/v1/leads/lead%201",
			"/api/v1/leads/lead%201",
			"/api/v1/leads/lead%201",
			"/api/v1/properties/property%201",
			"/api/v1/campaigns?status=active",
			"/api/v1/campaigns/campaign%201",
			"/api/v1/campaigns/campaign%201",
			"/api/v1/campaigns/campaign%201/cancel",
			"/api/v1/campaigns/campaign%201",
		]);
		expect((calls[0][1]?.headers as Headers).get("Authorization")).toBe(
			"Bearer token",
		);
		expect(calls[6][1]?.method).toBe("PATCH");
		expect(calls[7][1]?.method).toBe("DELETE");
		expect(calls[11][1]?.method).toBe("PATCH");
		expect(calls[12][1]?.method).toBe("POST");
		expect(calls[13][1]?.method).toBe("DELETE");
	});

	it("normalizes lead-list payloads into the table/list shape", () => {
		const rows = normalizePublicApiLeadLists({
			lead_lists: [
				{
					id: "list-1",
					lead_count: 1,
					leads: [
						{ email: "lead@example.com", first_name: "Ada", id: "lead-1" },
					],
					name: "Dallas Buyers",
					phone_count: 0,
				},
			],
		});

		expect(rows[0]).toMatchObject({
			id: "list-1",
			list: "Dallas Buyers",
			records: 1,
		});
		expect(rows[0].leads[0].contactInfo.email).toBe("lead@example.com");
		expect(toLeadList(rows[0]).listName).toBe("Dallas Buyers");
	});

	it("normalizes public property detail into the app property shape", () => {
		const property = normalizePublicApiProperty({
			id: "property-1",
			address: {
				city: "Dallas",
				state: "TX",
				street: "1 Main",
				zipCode: "75201",
			},
			beds: 3,
			baths: 2,
			list_price: 250000,
			property_type: "single family",
		});

		expect(property).toMatchObject({
			id: "property-1",
			address: { city: "Dallas", state: "TX" },
			metadata: { listPrice: 250000 },
			source: "realtor",
		});
	});
});
