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

## Components (UI)

- `AmortizationCalculator` — mortgage payment modeling.
- `WholesaleCalculator` — MAO computations for assignment deals.
- `FixFlipROICalculator` — investment, profit, and ROI for fix & flips.
- `RentalCashFlowCalculator` — cash flow, cap rate, and cash-on-cash returns.
- `BRRRRCalculator` — cash out, retained equity, NOI, and refinance payments.
- `DealComparisonCalculator` — efficiency scoring and ranking across deals.
- `OfferEstimatorCalculator` — MAO + AI adjustments using comparable sales.
- `LTVCalculator` — loan-to-value ratios.
- `DSCRCalculator` — debt service coverage ratios.
- `CommissionSplitCalculator` — broker/agent split breakdowns.
- `ClosingCostCalculator` — transfer taxes, total closing costs, and net proceeds.
- `CalculatorHub` — renders sidebar navigation plus grouped calculator grid.

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

