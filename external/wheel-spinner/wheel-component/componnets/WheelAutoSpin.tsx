"use client";

import { useEffect, useRef } from "react";

type Props = {
	enabled?: boolean;
	locked?: boolean;
	busy?: boolean;
	onReadyToSpin: () => void;
};

export default function WheelAutoSpin({
	enabled,
	locked,
	busy,
	onReadyToSpin,
}: Props) {
	const firedRef = useRef(false);
	useEffect(() => {
		if (!enabled) return;
		if (firedRef.current) return;
		if (!locked && !busy) {
			firedRef.current = true; // single-shot per mount
			const id = setTimeout(onReadyToSpin, 150);
			return () => clearTimeout(id);
		}
	}, [enabled, locked, busy, onReadyToSpin]);
	return null;
}
