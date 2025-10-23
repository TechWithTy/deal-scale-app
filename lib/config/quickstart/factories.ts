import type { WebhookStage } from "@/lib/stores/dashboard";
import type { LucideIcon } from "lucide-react";

import type {
	QuickStartActionDescriptor,
	QuickStartActionHandlerKey,
	QuickStartCardDescriptor,
} from "./types";

export const handlerAction = ({
	id,
	label,
	icon,
	handler,
	variant,
	className,
}: {
	readonly id: string;
	readonly label: string;
	readonly icon: LucideIcon;
	readonly handler: QuickStartActionHandlerKey;
	readonly variant?: "default" | "outline";
	readonly className?: string;
}): QuickStartActionDescriptor => ({
	id,
	kind: "handler",
	label,
	icon,
	handler,
	variant,
	className,
});

export const routeAction = ({
	id,
	label,
	icon,
	href,
	variant,
	className,
}: {
	readonly id: string;
	readonly label: string;
	readonly icon: LucideIcon;
	readonly href: string;
	readonly variant?: "default" | "outline";
	readonly className?: string;
}): QuickStartActionDescriptor => ({
	id,
	kind: "route",
	label,
	icon,
	href,
	variant,
	className,
});

export const webhookAction = ({
	id,
	label,
	icon,
	stage,
	variant,
	className,
}: {
	readonly id: string;
	readonly label: string;
	readonly icon: LucideIcon;
	readonly stage: WebhookStage;
	readonly variant?: "default" | "outline";
	readonly className?: string;
}): QuickStartActionDescriptor => ({
	id,
	kind: "webhook",
	label,
	icon,
	stage,
	variant,
	className,
});

export const primaryCardStyles: Pick<
	QuickStartCardDescriptor,
	"cardClassName" | "titleClassName" | "iconWrapperClassName"
> = {
	cardClassName:
		"border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
	titleClassName: "text-primary",
	iconWrapperClassName: "bg-primary/20 group-hover:bg-primary/30",
};

export const orangeCardStyles: Pick<
	QuickStartCardDescriptor,
	"cardClassName" | "titleClassName" | "iconWrapperClassName" | "iconClassName"
> = {
	cardClassName:
		"border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-400/10 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20",
	titleClassName: "text-orange-600",
	iconWrapperClassName: "bg-orange-500/20 group-hover:bg-orange-500/30",
	iconClassName: "text-orange-600",
};

export const greenCardStyles: Pick<
	QuickStartCardDescriptor,
	"cardClassName" | "titleClassName" | "iconWrapperClassName" | "iconClassName"
> = {
	cardClassName:
		"border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-400/10 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20",
	titleClassName: "text-green-600",
	iconWrapperClassName: "bg-green-500/20 group-hover:bg-green-500/30",
	iconClassName: "text-green-600",
};

export const outlinePrimary =
	"border-primary/30 text-primary hover:bg-primary/10";
export const outlineGreen =
	"border-green-500/30 text-green-600 hover:bg-green-500/10";
export const outlineOrange =
	"border-orange-500/30 text-orange-600 hover:bg-orange-500/10";
