# Calculator Module (external/calculators)

## Overview

- Central registry for reusable financial calculators.
- Provides metadata (id, title, category, description) alongside React components.
- Powers both the property detail overview calculators and the dedicated dashboard calculators hub.

## Key Exports

- `calculatorDefinitions`: ordered list of available calculators.
- `getCalculatorById(id)`: returns the full calculator definition or `undefined`.
- `getCalculatorComponent(id)`: convenient helper that returns the React component or `null`.
- `groupCalculatorsByCategory(definitions?)`: utility for building grouped navigation UIs.

## Components

- `AmortizationCalculator`
  - Inputs: Loan amount, term (years), interest rate.
  - Outputs: Monthly payment with validation on term (<= 60 years) and rate (<= 100%).
- `WholesaleCalculator`
  - Inputs: After Repair Value, repair costs, assignment fee, profit margin (selectable).
  - Outputs: Max Allowable Offer (MAO) formatted as a whole-dollar amount.
- `CalculatorHub`
  - Client component that renders a sidebar navigation and calculator grid given a list of calculator definitions.

## Usage Examples

```tsx
import { getCalculatorComponent } from "external/calculators";

const AmortizationCalculatorCard = getCalculatorComponent("amortization");

export function DealSummaryCalculators() {
	return (
		<div className="space-y-4">
			{AmortizationCalculatorCard ? <AmortizationCalculatorCard /> : null}
		</div>
	);
}
```

```tsx
import { calculatorDefinitions } from "external/calculators";
import { CalculatorHub } from "external/calculators/components/CalculatorHub";

export default function CalculatorsPage() {
	return <CalculatorHub calculators={calculatorDefinitions} />;
}
```

