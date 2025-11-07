import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { QuickStartTemplateId } from "@/lib/config/quickstart/templates";
import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";

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
	readonly isRoute?: boolean; // Indicates this action is a navigation/redirect
}

export interface QuickStartWizardPreset {
	/**
	 * Optional persona to preselect when the wizard opens.
	 * When paired with a goal id, the wizard jumps directly to the summary step.
	 */
	readonly personaId?: QuickStartPersonaId;
	/**
	 * Optional goal to prefill for the summary plan. Must match the persona when provided.
	 */
	readonly goalId?: QuickStartGoalId;
	/**
	 * Optional campaign template to apply to downstream stores when launching from a card.
	 */
	readonly templateId?: QuickStartTemplateId;
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
	readonly showBorderBeam?: boolean;
	readonly borderBeamConfig?: {
		size?: number;
		duration?: number;
		delay?: number;
		colorFrom?: string;
		colorTo?: string;
	};
}
