import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type QuickStartCardChipTone =
	| "primary"
	| "success"
	| "warning"
	| "info"
	| "accent"
	| "neutral";

export interface QuickStartCardChipConfig {
	readonly label: string;
	readonly tone?: QuickStartCardChipTone;
}

export interface QuickStartActionConfig {
	readonly label: string;
	readonly icon: LucideIcon;
	readonly variant?: "default" | "outline";
	readonly className?: string;
	readonly onClick: () => void;
}

export interface QuickStartWizardPreset {
	readonly startStep?: string;
	readonly templateId?: string;
}

export interface QuickStartCardConfig {
	readonly key: string;
	readonly title: string;
	readonly description: string;
	readonly icon?: LucideIcon;
	readonly iconNode?: ReactNode;
	readonly cardClassName?: string;
	readonly titleClassName?: string;
	readonly iconWrapperClassName?: string;
	readonly iconClassName?: string;
	readonly footer?: ReactNode;
	readonly featureChips?: QuickStartCardChipConfig[];
	readonly actions: QuickStartActionConfig[];
	readonly wizardPreset?: QuickStartWizardPreset;
}
