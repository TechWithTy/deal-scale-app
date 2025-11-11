import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { calculatorDefinitions } from "external/calculators";
import { CalculatorHub } from "external/calculators/components/CalculatorHub";

describe("CalculatorHub", () => {
	it("lists available calculators with sidebar navigation anchors", () => {
		render(<CalculatorHub calculators={calculatorDefinitions} />);

		for (const definition of calculatorDefinitions) {
			expect(
				screen.getByRole("heading", { name: definition.title }),
			).toBeInTheDocument();

			expect(
				screen.getByRole("link", { name: definition.title }),
			).toHaveAttribute("href", `#calculator-${definition.id}`);
		}
	});
});

