import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { calculatorDefinitions } from "external/calculators";

const getCalculator = (id: string) => {
	const calculator = calculatorDefinitions.find((item) => item.id === id);
	if (!calculator) {
		throw new Error(`Missing calculator definition for id: ${id}`);
	}
	return calculator;
};

describe("calculator component behavior", () => {
	it("exposes components for every calculator id", () => {
		const ids = calculatorDefinitions.map((calculator) => calculator.id);
		for (const id of ids) {
			expect(() => getCalculator(id)).not.toThrow();
		}
	});

	it("computes amortization monthly payment and enforces validation", async () => {
		const { Component } = getCalculator("amortization");
		render(<Component />);

		fireEvent.change(screen.getByLabelText(/loan amount/i), {
			target: { value: "250000" },
		});
		fireEvent.change(screen.getByLabelText(/loan term/i), {
			target: { value: "30" },
		});
		fireEvent.change(screen.getByLabelText(/interest rate/i), {
			target: { value: "6.5" },
		});

		expect(
			screen.getByText(/\$1,580\.17/),
		).toBeInTheDocument();

		const loanTerm = screen.getByLabelText(/loan term/i);
		fireEvent.change(loanTerm, { target: { value: "80" } });

		expect(
			screen.getByText(/loan term cannot be greater than 60/i),
		).toBeInTheDocument();
	});

	it("calculates wholesale max allowable offer with adjustable margin", async () => {
		const { Component } = getCalculator("wholesale");
		render(<Component />);

		fireEvent.change(screen.getByLabelText(/after repair value/i), {
			target: { value: "200000" },
		});
		fireEvent.change(screen.getByLabelText(/cost of repairs/i), {
			target: { value: "50000" },
		});
		fireEvent.change(screen.getByLabelText(/assignment fee/i), {
			target: { value: "10000" },
		});

		expect(screen.getByText(/\$80,000/)).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText(/profit margin/i), {
			target: { value: "0.8" },
		});

		expect(screen.getByText(/\$100,000/)).toBeInTheDocument();
	});

	it("calculates fix & flip ROI outputs", () => {
		const { Component } = getCalculator("fix-flip-roi");
		render(<Component />);

		const cardHeading = screen.getAllByRole("heading", {
			name: /fix & flip roi calculator/i,
		})[0];
		const card = cardHeading.closest("section");
		if (!card) {
			throw new Error("Expected calculator card not found");
		}
		const scoped = within(card);

		fireEvent.change(scoped.getByLabelText(/after repair value/i), {
			target: { value: "350000" },
		});
		fireEvent.change(scoped.getByLabelText(/purchase price/i), {
			target: { value: "200000" },
		});
		fireEvent.change(scoped.getByLabelText(/rehab cost/i), {
			target: { value: "50000" },
		});
		fireEvent.change(scoped.getByLabelText(/holding cost/i), {
			target: { value: "15000" },
		});
		fireEvent.change(scoped.getByLabelText(/selling fees/i), {
			target: { value: "20000" },
		});

		expect(scoped.getByText(/\$65,000/)).toBeInTheDocument();
		expect(scoped.getByText(/22\.81%/)).toBeInTheDocument();
		const totals = scoped.getAllByText(/\$285,000/);
		expect(totals.length).toBeGreaterThanOrEqual(1);
	});

	it("prefills fix & flip calculator when initial values are provided", () => {
		const { Component } = getCalculator("fix-flip-roi");
		const initialValues = {
			arv: 350000,
			purchasePrice: 200000,
			rehabCost: 50000,
			holdingCost: 15000,
			sellingFees: 20000,
		};
		render(<Component initialValues={initialValues} />);

		const cardHeading = screen.getAllByRole("heading", {
			name: /fix & flip roi calculator/i,
		})[0];
		const card = cardHeading.closest("section");
		if (!card) {
			throw new Error("Expected calculator card not found");
		}
		const scoped = within(card);

		expect(scoped.getByDisplayValue("350000")).toBeInTheDocument();
		expect(scoped.getByText(/\$65,000/)).toBeInTheDocument();
		expect(scoped.getByText(/22\.81%/)).toBeInTheDocument();
	});

	it("computes rental cash flow metrics", () => {
		const { Component } = getCalculator("rental-cashflow");
		render(<Component />);

		fireEvent.change(screen.getByLabelText(/monthly rent/i), {
			target: { value: "2500" },
		});
		fireEvent.change(screen.getByLabelText(/vacancy rate/i), {
			target: { value: "5" },
		});
		fireEvent.change(screen.getByLabelText(/monthly expenses/i), {
			target: { value: "800" },
		});
		fireEvent.change(screen.getByLabelText(/loan payment/i), {
			target: { value: "900" },
		});
		fireEvent.change(screen.getByLabelText(/property value/i), {
			target: { value: "320000" },
		});
		fireEvent.change(screen.getByLabelText(/down payment/i), {
			target: { value: "64000" },
		});

		expect(screen.getByText(/\$675\.00/)).toBeInTheDocument();
		expect(screen.getByText(/\$8,100\.00/)).toBeInTheDocument();
		expect(screen.getByText(/2\.53%/)).toBeInTheDocument();
		expect(screen.getByText(/11\.77%/)).toBeInTheDocument();
	});
});

