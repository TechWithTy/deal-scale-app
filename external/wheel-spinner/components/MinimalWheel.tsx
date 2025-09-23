"use client";

import { PrizeWheel } from "../PrizeWheel";
import type { Cadence, Prize, SpinResult } from "../types";
import type { PrizeWheelProps } from "../PrizeWheel";

export type MinimalWheelProps = Omit<
	PrizeWheelProps,
	"onWin" | "userId" | "prizes" | "cadence"
> & {
	cadence: Cadence;
	prizes: Prize[];
	userId: string;
	onWin?: (payload: SpinResult) => void;
};

const MinimalWheel = ({
	cadence,
	prizes,
	userId,
	onWin,
	storageKeyBase,
	disabled,
	showCountdown = true,
	autoSpin = false,
	showResultModal = false,
	showWheelPopup = false,
	persistence,
	theme,
	ariaLabel,
	allowAdminOverride = false,
	className,
}: MinimalWheelProps) => {
	return (
		<PrizeWheel
			cadence={cadence}
			prizes={prizes}
			onWin={onWin ?? (() => {})}
			userId={userId}
			storageKeyBase={storageKeyBase}
			disabled={disabled}
			showCountdown={showCountdown}
			autoSpin={autoSpin}
			showResultModal={showResultModal}
			showWheelPopup={showWheelPopup}
			persistence={persistence}
			theme={theme}
			ariaLabel={ariaLabel}
			allowAdminOverride={allowAdminOverride}
			className={className}
		/>
	);
};

export default MinimalWheel;
