import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { CashBuyerProfilePanel } from "@/external/shadcn-table/src/examples/Lead/CashBuyerProfilePanel";
import type { DemoLead } from "@/external/shadcn-table/src/examples/Lead/types";

function cashBuyerLead(): DemoLead {
	return {
		id: "cash-buyer-1",
		leadCategory: "cash-buyers",
		status: "Contacted",
		contactInfo: {
			firstName: "Maya",
			lastName: "Patel",
			email: "maya@example.com",
			phone: "214-555-0184",
			address: "2101 Cedar Springs Road",
			domain: "example.com",
			social: "https://linkedin.com/in/maya",
		},
		address1: {
			fullStreetLine: "2101 Cedar Springs Road",
			city: "Dallas",
			state: "TX",
			zipCode: "75201",
		},
		summary: "Cash buyer",
		bed: 3,
		bath: 2,
		sqft: 1450,
		followUp: null,
		lastUpdate: "2026-06-18",
		cashBuyerProfile: {
			buyerPersonas: ["investor", "flipper"],
			budgetMin: 180000,
			budgetMax: 475000,
			strategies: ["Fix and flip", "BRRRR"],
			buyBox: {
				states: ["TX"],
				counties: ["Dallas"],
				cities: ["Dallas", "Garland"],
				zipCodes: ["75201", "75043"],
				propertyTypes: ["Single family", "Duplex"],
				occupancy: "any",
				priceMin: 150000,
				priceMax: 450000,
				bedroomsMin: 2,
				bedroomsMax: 5,
				bathroomsMin: 1,
				bathroomsMax: 4,
				sqftMin: 900,
				sqftMax: 2600,
				notes: "Wants light-to-medium rehab.",
			},
		},
	};
}

describe("CashBuyerProfilePanel", () => {
	it("renders buy box, budget, personas, strategies, and notes", () => {
		render(<CashBuyerProfilePanel lead={cashBuyerLead()} />);

		expect(screen.getByText("Cash Buyer Buy Box")).toBeInTheDocument();
		expect(screen.getByText("$180,000 - $475,000")).toBeInTheDocument();
		expect(screen.getByText("$150,000 - $450,000")).toBeInTheDocument();
		expect(
			screen.getByText("Dallas, Garland | Dallas | TX"),
		).toBeInTheDocument();
		expect(screen.getByText("75201, 75043")).toBeInTheDocument();
		expect(screen.getByText("Single family, Duplex")).toBeInTheDocument();
		expect(screen.getByText("Investor")).toBeInTheDocument();
		expect(screen.getByText("Flipper")).toBeInTheDocument();
		expect(screen.getByText("Fix and flip")).toBeInTheDocument();
		expect(screen.getByText("BRRRR")).toBeInTheDocument();
		expect(
			screen.getByText("Wants light-to-medium rehab."),
		).toBeInTheDocument();
	});

	it("does not render for non-cash-buyer leads without a profile", () => {
		const lead = cashBuyerLead();
		delete lead.cashBuyerProfile;

		const { container } = render(<CashBuyerProfilePanel lead={lead} />);

		expect(container).toBeEmptyDOMElement();
	});
});
