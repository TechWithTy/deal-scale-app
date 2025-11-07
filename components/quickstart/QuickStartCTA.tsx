"use client";

import React, { useMemo } from "react";

import PersonaCTA from "@/components/cta/PersonaCTA";
import {
	getQuickStartCTACopy,
	type QuickStartCTADisplayMode,
} from "@/lib/config/quickstart/ctas";
import type { QuickStartPersonaId } from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import type { QuickStartCTAButton } from "@/lib/config/quickstart/ctas";

interface QuickStartCTAProps {
	readonly displayMode?: QuickStartCTADisplayMode;
	readonly personaId?: QuickStartPersonaId | null;
	readonly onPrimaryClick?: () => void;
	readonly onSecondaryClick?: () => void;
	readonly orientation?: "vertical" | "horizontal";
	readonly className?: string;
}

const QuickStartCTA = ({
	className,
	displayMode = "primary",
	onPrimaryClick,
	onSecondaryClick,
	orientation,
	personaId,
}: QuickStartCTAProps) => {
	const selectedPersona = useQuickStartWizardDataStore(
		(state) => state.personaId,
	);

	const copy = useMemo(
		() => getQuickStartCTACopy(personaId ?? selectedPersona),
		[personaId, selectedPersona],
	);

	const shouldShowSecondary = displayMode !== "primary";
	const fallbackSecondary = useMemo(
		() =>
			({
				label: "Preview Guided Demo",
				emphasis: "outline",
				description: "Tour DealScale’s AI workflows before you launch.",
				badge: "See it in action",
			}) satisfies QuickStartCTAButton,
		[],
	);

	return (
		<PersonaCTA
			className={className}
			displayMode={displayMode}
			primary={copy.primary}
			secondary={
				shouldShowSecondary ? (copy.secondary ?? fallbackSecondary) : undefined
			}
			microcopy={copy.microcopy}
			orientation={orientation}
			onPrimaryClick={onPrimaryClick}
			onSecondaryClick={onSecondaryClick}
		/>
	);
};

export default QuickStartCTA;
