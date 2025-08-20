import { useEffect, useState } from "react";

export function useGoogleMapsLoader(
	apiKey?: string,
	libraries: string[] = ["places"],
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
				const loader = new Loader({
					apiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
					libraries,
				});
				await loader.load();
				if (!cancelled) setLoaded(true);
			} catch (e) {
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
