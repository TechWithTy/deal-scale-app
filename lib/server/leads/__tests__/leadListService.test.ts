import { describe, expect, it } from "vitest";
import type { LeadList, LeadTypeGlobal } from "@/types/_dashboard/leads";
import {
	findLeadById,
	findLeadListById,
	buildLeadDetailPath,
} from "../leadListService";

const leadA: LeadTypeGlobal = {
	id: "lead-a",
	contactInfo: {
		firstName: "Alice",
		lastName: "Walker",
		email: "alice@example.com",
		phone: "555-111-2222",
		address: "123 Main St",
		domain: "example.com",
		social: "@alice",
	},
	summary: "Interested in investment properties",
	bed: 3,
	bath: 2,
	sqft: 1800,
	status: "New Lead",
	followUp: null,
	lastUpdate: new Date().toISOString(),
	address1: {
		fullStreetLine: "123 Main St",
		city: "Austin",
		state: "TX",
		zipCode: "78701",
	},
};

const leadB: LeadTypeGlobal = {
	id: "lead-b",
	contactInfo: {
		firstName: "Brenda",
		lastName: "Stone",
		email: "brenda@example.com",
		phone: "555-333-4444",
		address: "456 Oak St",
		domain: "example.com",
		social: "@brenda",
	},
	summary: "Looking to sell within 90 days",
	bed: 4,
	bath: 3,
	sqft: 2200,
	status: "Contacted",
	followUp: null,
	lastUpdate: new Date().toISOString(),
	address1: {
		fullStreetLine: "456 Oak St",
		city: "Dallas",
		state: "TX",
		zipCode: "75201",
	},
};

const sampleLists: LeadList[] = [
	{
		id: "list-1",
		listName: "Austin Buyers",
		uploadDate: "2024-10-01",
		records: 200,
		phone: 150,
		emails: 140,
		dataLink: "https://example.com/list-1",
		socials: { facebook: 30, linkedin: 20 },
		leads: [leadA],
	},
	{
		id: "list-2",
		listName: "Dallas Sellers",
		uploadDate: "2024-10-05",
		records: 180,
		phone: 160,
		emails: 155,
		dataLink: "https://example.com/list-2",
		socials: { facebook: 40, linkedin: 35 },
		leads: [leadB],
	},
];

describe("leadListService", () => {
	it("finds a lead list by id", () => {
		const list = findLeadListById("list-1", sampleLists);
		expect(list?.listName).toBe("Austin Buyers");
	});

	it("returns undefined when lead list is missing", () => {
		const list = findLeadListById("missing", sampleLists);
		expect(list).toBeUndefined();
	});

	it("finds a lead within a list", () => {
		const payload = findLeadById("list-2", "lead-b", sampleLists);
		expect(payload?.lead.contactInfo.firstName).toBe("Brenda");
		expect(payload?.list.listName).toBe("Dallas Sellers");
	});

	it("returns undefined when lead is not present", () => {
		const payload = findLeadById("list-1", "lead-x", sampleLists);
		expect(payload).toBeUndefined();
	});

	it("builds lead detail path with query params", () => {
		const url = buildLeadDetailPath("list-1", "lead-a", {
			context: "campaign",
		});
		expect(url).toBe(
			"/dashboard/lead-list/list-1/lead/lead-a?context=campaign",
		);
	});
});
