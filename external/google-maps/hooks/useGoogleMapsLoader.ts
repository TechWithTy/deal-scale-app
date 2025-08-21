import { useEffect, useState } from "react";
import type { Library } from "@googlemaps/js-api-loader";

export function useGoogleMapsLoader(
	apiKey?: string,
	libraries: Library[] = ["places", "marker"],
) {
	const [loaded, setLoaded] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				if (typeof window !== "undefined" && (window as any).google?.maps) {
					if (!cancelled) setLoaded(true);
					return;
				}
				const { Loader } = await import("@googlemaps/js-api-loader");
				const resolvedKey =
					apiKey ||
					process.env.NEXT_PUBLIC_GMAPS_KEY ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
					"";
				if (!resolvedKey) {
					console.warn(
						"[Maps] No API key resolved. Set NEXT_PUBLIC_GMAPS_KEY.",
					);
				}
				console.debug("[Maps] Loading JS API", {
					libraries,
					hasKey: !!resolvedKey,
				});
				const loader = new Loader({
					apiKey: resolvedKey,
					libraries,
					version: "weekly",
					id: "google-maps-js-sdk",
				});
				await loader.load();
				if (!cancelled) setLoaded(true);
			} catch (e) {
				// Helpful console for diagnosing key/referrer issues
				console.error("[Maps] Failed to load Google Maps SDK", e);
				if (!cancelled) setError(e as Error);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [apiKey, libraries]);

	return { loaded, error };
}
