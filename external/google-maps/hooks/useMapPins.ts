import { useCallback, useState } from "react";
import type { Coordinates } from "../types";

export function useMapPins(initial?: Coordinates | null) {
	const [pin, setPin] = useState<Coordinates | null>(initial ?? null);

	const setFromClick = useCallback((e: google.maps.MapMouseEvent) => {
		const ll = e.latLng?.toJSON();
		if (ll) setPin(ll);
	}, []);

	const update = useCallback(
		(coords: Coordinates | null) => setPin(coords),
		[],
	);

	return { pin, setFromClick, update } as const;
}
