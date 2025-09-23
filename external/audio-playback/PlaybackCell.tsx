"use client";

import * as React from "react";
import type { CallInfo } from "@/types/_dashboard/campaign";
import { PlayButtonSkip } from "./PlayButtonSkip";

type Props = {
	callInformation: CallInfo[];
};

export function PlaybackCell({ callInformation }: Props) {
	const [index, setIndex] = React.useState(0);

	if (!callInformation?.length)
		return <span className="text-muted-foreground">No Calls</span>;

	const current = callInformation[index]?.callResponse;
	const title = current?.id ?? `Call ${index + 1}`;
	const recordingUrl = current?.recordingUrl ?? "";

	const handleNext = () => {
		if (index < callInformation.length - 1) setIndex((i) => i + 1);
	};
	const handlePrev = () => {
		if (index > 0) setIndex((i) => i - 1);
	};

	return (
		<PlayButtonSkip
			title={title}
			audioSrc={recordingUrl}
			// Use the audio's intrinsic duration for the full timeline
			// startTime and endTime omitted on purpose to avoid using absolute timestamps
			onNextCall={handleNext}
			onPrevCall={handlePrev}
			isNextDisabled={index >= callInformation.length - 1}
			isPrevDisabled={index <= 0}
		/>
	);
}
