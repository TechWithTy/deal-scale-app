import type { Metadata } from "next";

import PageContainer from "@/components/layout/page-container";
import { calculatorDefinitions } from "external/calculators";
import { CalculatorHub } from "external/calculators/components/CalculatorHub";

export const metadata: Metadata = {
	title: "Deal Scale Calculators",
	description:
		"Access financing and deal analysis calculators to evaluate opportunities across your pipeline.",
};

export default function CalculatorsPage() {
	return (
		<PageContainer scrollable>
			<div className="space-y-8">
				<header className="space-y-2">
					<h1 className="font-semibold text-3xl text-foreground">
						Calculator Hub
					</h1>
					<p className="text-muted-foreground">
						Run quick financial analyses without leaving your workflow. Save
						time validating assumptions and keep every property decision data
						driven.
					</p>
				</header>

				<CalculatorHub calculators={calculatorDefinitions} />
			</div>
		</PageContainer>
	);
}
