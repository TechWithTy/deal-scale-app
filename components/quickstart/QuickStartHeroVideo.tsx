"use client";

import React, { useMemo, useEffect } from "react";

import {
	QuickStartVideoPreview,
	QUICKSTART_DEFAULT_VIDEO,
} from "@/components/quickstart/QuickStartVideoPreview";
import { getQuickStartHeadlineCopy } from "@/lib/config/quickstart/headlines";
import type { QuickStartPersonaId } from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { cn } from "@/lib/utils/index";

interface QuickStartHeroVideoProps {
	readonly className?: string;
	readonly personaId?: QuickStartPersonaId | null;
}

const QuickStartHeroVideo = ({
	className,
	personaId,
}: QuickStartHeroVideoProps) => {
	const selectedPersona = useQuickStartWizardDataStore(
		(state) => state.personaId,
	);

	const copy = useMemo(
		() => getQuickStartHeadlineCopy(personaId ?? selectedPersona),
		[personaId, selectedPersona],
	);

	const video = copy.video ?? QUICKSTART_DEFAULT_VIDEO;
	useEffect(() => {
		if (process.env.NODE_ENV !== "production") {
			console.debug("[QuickStartHeroVideo] active video config", video);
		}
	}, [video]);

	if (!video) {
		return null;
	}

	return (
		<QuickStartVideoPreview
			className={cn("mt-8", className)}
			videoConfig={video}
		/>
	);
};

export default QuickStartHeroVideo;
