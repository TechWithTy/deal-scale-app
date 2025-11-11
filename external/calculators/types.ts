import type { ComponentType, ReactNode } from "react";

export type CalculatorCategory =
	| "Acquisition"
	| "Analysis"
	| "Financing"
	| "Investment Strategy"
	| "Operations";

export interface CalculatorDefinition {
	id: string;
	title: string;
	description: string;
	category: CalculatorCategory;
	keywords: string[];
	Component: ComponentType;
	cta?: {
		label: string;
		href: string;
		external?: boolean;
		icon?: ReactNode;
	};
}
