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
	componentRestrictions?: google.maps.places.ComponentRestrictions;
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

	// Wait for hydration to complete before manipulating the DOM
	await new Promise<void>((resolve) => {
		if (document.readyState === "complete") {
			resolve();
			return;
		}
		window.addEventListener("load", () => resolve(), { once: true });
	});

	// Use traditional Places Autocomplete with proper error handling
	try {
		const googleMaps = window.google?.maps;
		if (!googleMaps?.importLibrary) {
			throw new Error("Google Maps importLibrary not available");
		}

		const placesLib = (await googleMaps.importLibrary("places")) as PlacesImport;
		if (!placesLib?.Autocomplete) {
			throw new Error("Places Autocomplete not available");
		}

		const autocomplete = new placesLib.Autocomplete(input, {
			fields: options?.fields || ["place_id", "geometry", "name", "formatted_address"],
			componentRestrictions: options?.componentRestrictions || { country: "us" },
		});

		const handler = (place: google.maps.places.PlaceResult | null) => {
			if (!place?.geometry?.location) return;
			const locationLiteral = place.geometry.location.toJSON();
			const seed: ACSeed = {
				placeId: place.place_id ?? undefined,
				formattedAddress: place.formatted_address ?? undefined,
				name: place.name ?? undefined,
				location: locationLiteral,
			};
			onPlaceChanged(seed);
		};

		autocomplete.addListener("place_changed", () => {
			const place = autocomplete.getPlace();
			handler(place);
		});

		return () => {
			try {
				google.maps.event.clearInstanceListeners(autocomplete);
			} catch {}
		};
	} catch (error) {
		console.warn("Traditional Places Autocomplete failed:", error);
	}

	try {
		return mountUiKitAutocomplete({ input, onPlaceChanged, options });
	} catch (error) {
		console.warn("UI Kit autocomplete failed:", error);
	}

	// If all else fails, no-op but do not crash
	return () => {};
}

type PlacesImport = {
	Autocomplete?: typeof google.maps.places.Autocomplete;
	Place?: typeof google.maps.places.Place;
	PlacesService?: typeof google.maps.places.PlacesService;
	PlacesServiceStatus?: typeof google.maps.places.PlacesServiceStatus;
	PlaceAutocompleteElement?: new () => HTMLElement;
};

interface MountUiKitArgs {
	input: HTMLInputElement;
	onPlaceChanged: PlaceChangedHandler;
	options?: ACOptions;
}

type UiKitEvent = CustomEvent<{ place?: google.maps.places.Place }>;

function mountUiKitAutocomplete({ input, onPlaceChanged, options }: MountUiKitArgs) {
	const googleMaps = window.google?.maps;
	if (!googleMaps?.importLibrary) {
		throw new Error("Google Maps importLibrary not available for UI Kit");
	}

	// Ensure base stylesheet is injected once for theming support
	ensureAutocompleteThemeInjected();

	let wrapper: HTMLDivElement | null = null;
	let uiKitElement: HTMLElement | null = null;

	const connect = async () => {
		const placesLib = (await googleMaps.importLibrary("places")) as PlacesImport;
		const ElementCtor = placesLib?.PlaceAutocompleteElement;
		if (!ElementCtor || !input.parentElement) {
			throw new Error("Places UI Kit element unavailable");
		}

		wrapper = document.createElement("div");
		wrapper.style.width = "100%";
		wrapper.style.position = "relative";

		uiKitElement = new ElementCtor();
		uiKitElement.setAttribute("style", "width: 100%; display: block;");

		const placeholder = input.getAttribute("placeholder");
		if (placeholder) {
			uiKitElement.setAttribute("placeholder", placeholder);
		}
		if (options?.componentRestrictions?.country) {
			uiKitElement.setAttribute(
				"componentRestrictions",
				JSON.stringify({ country: options.componentRestrictions.country }),
			);
		}

		input.dataset.googlePlacesHidden = "true";
		input.style.position = "absolute";
		input.style.opacity = "0";
		input.style.pointerEvents = "none";
		input.parentElement.insertBefore(wrapper, input.nextSibling);
		wrapper.appendChild(uiKitElement);

		const handleSelect = async (event: Event) => {
			const detail = (event as UiKitEvent).detail?.place;
			if (!detail?.fetchFields) {
				return;
			}
			await detail.fetchFields({
				fields: ["id", "displayName", "formattedAddress", "location"],
			});
			const locationLiteral = detail.location?.toJSON();
			if (!locationLiteral) return;
			const seed: ACSeed = {
				placeId: detail.id ?? undefined,
				formattedAddress: detail.formattedAddress ?? detail.displayName ?? undefined,
				name: detail.displayName ?? undefined,
				location: locationLiteral,
			};
			onPlaceChanged(seed);
			input.value = seed.formattedAddress ?? seed.name ?? "";
		};

		uiKitElement.addEventListener("gmp-placeselect", handleSelect as EventListener);

		return () => {
			uiKitElement?.removeEventListener("gmp-placeselect", handleSelect as EventListener);
		};
	};

	let detachListener: (() => void) | undefined;
	connect()
		.then((fn) => {
			detachListener = fn;
		})
		.catch((error) => {
			console.warn("Failed to mount Places UI Kit element:", error);
		});

	return () => {
		try {
			detachListener?.();
		} finally {
			if (uiKitElement?.parentElement) {
				uiKitElement.parentElement.removeChild(uiKitElement);
			}
			if (wrapper?.parentElement) {
				wrapper.parentElement.removeChild(wrapper);
			}
			if (input.dataset.googlePlacesHidden) {
				delete input.dataset.googlePlacesHidden;
				input.style.position = "";
				input.style.opacity = "";
				input.style.pointerEvents = "";
			}
		}
	};
}

let hasInjectedAutocompleteTheme = false;

function ensureAutocompleteThemeInjected() {
	if (hasInjectedAutocompleteTheme) return;
	const styleId = "ds-google-autocomplete-theme";
	if (document.getElementById(styleId)) {
		hasInjectedAutocompleteTheme = true;
		return;
	}

	const style = document.createElement("style");
	style.id = styleId;
	style.textContent = buildAutocompleteTheme();
	document.head.appendChild(style);
	hasInjectedAutocompleteTheme = true;
}

function buildAutocompleteTheme(): string {
	return `
		:root {
			--ds-autocomplete-bg: hsl(var(--card));
			--ds-autocomplete-surface: hsl(var(--background));
			--ds-autocomplete-border: hsl(var(--border));
			--ds-autocomplete-foreground: hsl(var(--foreground));
			--ds-autocomplete-muted: hsl(var(--muted-foreground));
			--ds-autocomplete-hover: hsla(var(--primary), 0.12);
			--ds-autocomplete-active: hsla(var(--primary), 0.18);
		}

		@media (prefers-color-scheme: dark) {
			:root {
				--ds-autocomplete-bg: hsl(var(--card));
				--ds-autocomplete-surface: hsl(var(--background));
				--ds-autocomplete-border: hsl(var(--border));
				--ds-autocomplete-foreground: hsl(var(--foreground));
				--ds-autocomplete-muted: hsl(var(--muted-foreground));
				--ds-autocomplete-hover: hsla(var(--primary), 0.24);
				--ds-autocomplete-active: hsla(var(--primary), 0.32);
			}
		}

		gmp-place-autocomplete {
			color-scheme: light dark;
			--_gmp-autocomplete-background-color: var(--ds-autocomplete-bg);
			--_gmp-autocomplete-border-color: var(--ds-autocomplete-border);
			--_gmp-autocomplete-text-color: var(--ds-autocomplete-foreground);
			--_gmp-autocomplete-secondary-text-color: var(--ds-autocomplete-muted);
			--_gmp-autocomplete-hover-background-color: var(--ds-autocomplete-hover);
			--_gmp-autocomplete-active-background-color: var(--ds-autocomplete-active);
			--_gmp-autocomplete-highlight-color: hsl(var(--primary));
			--_gmp-autocomplete-focus-ring-color: hsla(var(--primary), 0.65);
			--_gmp-autocomplete-surface-color: var(--ds-autocomplete-surface);
			--_gmp-autocomplete-border-radius: 0.75rem;
			--_gmp-autocomplete-item-border-radius: 0.5rem;
		}

		gmp-place-autocomplete::part(prediction-list) {
			background: var(--ds-autocomplete-surface);
			border: 1px solid var(--ds-autocomplete-border);
			border-radius: var(--_gmp-autocomplete-border-radius);
			box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
			padding-block: 0.25rem;
		}

		gmp-place-autocomplete::part(prediction-item) {
			color: var(--ds-autocomplete-foreground);
			background: transparent;
		}

		gmp-place-autocomplete::part(prediction-item-icon) {
			color: var(--ds-autocomplete-muted);
		}

		gmp-place-autocomplete::part(prediction-item-main-text) {
			color: var(--ds-autocomplete-foreground);
			font-weight: 600;
		}

		gmp-place-autocomplete::part(prediction-item-match) {
			color: hsl(var(--primary));
		}

		gmp-place-autocomplete::part(prediction-item-selected) {
			background: var(--ds-autocomplete-active);
		}

		gmp-place-autocomplete::part(prediction-item:hover) {
			background: var(--ds-autocomplete-hover);
		}

		gmp-place-autocomplete::part(prediction-item:focus-visible) {
			outline: 2px solid var(--_gmp-autocomplete-focus-ring-color);
			outline-offset: 2px;
		}

		gmp-place-autocomplete::part(prediction-item-icon),
		gmp-place-autocomplete::part(prediction-item-main-text) {
			transition: color 0.2s ease, background 0.2s ease;
		}
	`;
}
