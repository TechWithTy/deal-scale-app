"use client";

import { useEffect, useState } from "react";

type NetworkTier = "slow" | "moderate" | "fast";

interface NetworkQuality {
	tier: NetworkTier;
	downlink: number | null;
	effectiveType: string | null;
}

const tierMap: Record<string, NetworkTier> = {
	"slow-2g": "slow",
	"2g": "slow",
	"3g": "moderate",
	"4g": "fast",
};

export function useNetworkQuality(): NetworkQuality {
	const [quality, setQuality] = useState<NetworkQuality>(() => ({
		tier: "fast",
		downlink: null,
		effectiveType: null,
	}));

	useEffect(() => {
		const connection = (
			navigator as unknown as {
				connection?: {
					effectiveType?: string;
					downlink?: number;
					addEventListener?: (type: string, listener: () => void) => void;
					removeEventListener?: (type: string, listener: () => void) => void;
				};
			}
		).connection;

		if (!connection) return;
		const activeConnection = connection;

		function updateQuality() {
			const effectiveType = activeConnection.effectiveType ?? null;
			const downlink = activeConnection.downlink ?? null;
			const tier = effectiveType ? (tierMap[effectiveType] ?? "fast") : "fast";
			setQuality({ tier, downlink, effectiveType });
		}

		updateQuality();
		activeConnection.addEventListener?.("change", updateQuality);

		return () => {
			activeConnection.removeEventListener?.("change", updateQuality);
		};
	}, []);

	return quality;
}
