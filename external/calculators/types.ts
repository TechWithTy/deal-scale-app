import type { ComponentType, ReactNode } from "react";

export type CalculatorCategory =
	| "Acquisition"
	| "Analysis"
	| "Financing"
	| "Investment Strategy"
	| "Operations";

export type CalculatorInitialValues = Record<string, string | number>;

export interface CalculatorComponentProps {
	initialValues?: CalculatorInitialValues;
}

export interface CalculatorDefinition {
	id: string;
	title: string;
	description: string;
	category: CalculatorCategory;
	keywords: string[];
	Component: ComponentType<CalculatorComponentProps>;
	cta?: {
		label: string;
		href: string;
		external?: boolean;
		icon?: ReactNode;
	};
}
