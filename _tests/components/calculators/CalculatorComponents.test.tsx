import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
});

