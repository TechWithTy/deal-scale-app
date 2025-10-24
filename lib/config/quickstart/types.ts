import type {
	QuickStartCardChipConfig,
	QuickStartWizardPreset,
} from "@/components/quickstart/types";
import type { WebhookStage } from "@/lib/stores/dashboard";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type QuickStartActionHandlerKey =
	| "onImport"
	| "onSelectList"
	| "onConfigureConnections"
	| "onCampaignCreate"
	| "onViewTemplates"
	| "onBrowserExtension"
	| "onStartNewSearch"
	| "onOpenSavedSearches"
	| "onWizardStub";

export type QuickStartActionDescriptor =
	| {
			readonly id: string;
			readonly kind: "handler";
			readonly label: string;
			readonly icon: LucideIcon;
			readonly variant?: "default" | "outline";
			readonly className?: string;
			readonly handler: QuickStartActionHandlerKey;
	  }
	| {
			readonly id: string;
			readonly kind: "webhook";
			readonly label: string;
			readonly icon: LucideIcon;
			readonly variant?: "default" | "outline";
			readonly className?: string;
			readonly stage: WebhookStage;
	  }
	| {
			readonly id: string;
			readonly kind: "route";
			readonly label: string;
			readonly icon: LucideIcon;
			readonly variant?: "default" | "outline";
			readonly className?: string;
			readonly href: string;
	  };

export interface QuickStartCardDescriptor {
	readonly id: string;
	readonly enabled: boolean;
	readonly order: number;
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
	readonly actions: QuickStartActionDescriptor[];
	readonly wizardPreset?: QuickStartWizardPreset;
}
