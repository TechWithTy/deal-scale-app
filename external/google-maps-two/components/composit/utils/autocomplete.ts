export interface ACSeed {
	placeId?: string;
	location?: google.maps.LatLngLiteral;
	formattedAddress?: string;
	name?: string;
}

export type PlaceChangedHandler = (seed: ACSeed) => void;

export interface ACOptions {
	fields?: string[];
	types?: string[];
	// e.g., { country: 'us' }
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	componentRestrictions?: any;
}

export async function initAutocomplete(
	input: HTMLInputElement,
	onPlaceChanged: PlaceChangedHandler,
	options?: ACOptions,
): Promise<() => void> {
	// SSR guard
	if (typeof window === "undefined") {
		return () => {};
	}

	// Force-only: Use Places UI Kit PlaceAutocompleteElement
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const placesV3: any = await (
			(window as any).google?.maps as any
		)?.importLibrary?.("places");
		const PAE = (placesV3 as any)?.PlaceAutocompleteElement;
		if (PAE && input?.parentElement) {
			const parent = input.parentElement;
			const host = document.createElement("div");
			host.style.width = "100%";
			// Replace the original input node so only one field exists in the DOM
			parent.replaceChild(host, input);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const pae: any = new PAE();
			pae.placeholder = input.placeholder || "Search address";
			try {
				if (options?.componentRestrictions?.country) {
					pae.componentRestrictions = {
						country: options.componentRestrictions.country,
					};
				}
			} catch {}
			host.appendChild(pae);
			const handler = async (evt: Event) => {
				try {
					const ce = evt as CustomEvent<{ place?: any }>;
					const placeAny = ce?.detail?.place;
					if (placeAny?.fetchFields) {
						await placeAny.fetchFields({
							fields: ["id", "displayName", "formattedAddress", "location"],
						});
						const locAny = placeAny.location?.toJSON?.();
						const seed: ACSeed = {
							placeId: placeAny.id ?? undefined,
							formattedAddress:
								placeAny.formattedAddress ?? placeAny.displayName?.toString?.(),
							name: placeAny.displayName?.toString?.(),
							location: locAny,
						};
						onPlaceChanged(seed);
					}
				} catch {}
			};
			pae.addEventListener("gmp-placeselect", handler as EventListener);
			return () => {
				try {
					pae.removeEventListener("gmp-placeselect", handler as EventListener);
				} catch {}
				try {
					// Restore the original input in place of the host for cleanliness
					if (host.parentElement) {
						host.parentElement.replaceChild(input, host);
					}
				} catch {}
			};
		}
	} catch {}

	// If UI Kit is unavailable, no-op but do not crash
	return () => {};
}
