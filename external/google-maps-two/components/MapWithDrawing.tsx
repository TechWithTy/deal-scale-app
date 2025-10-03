"use client";
import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBoundsFromShape, generatePinsWithinBounds } from "../utils/bounds";
import {
	AirQualityMount,
	type GmpAirQualityMeterElement,
} from "./map/AirQualityMount";
import { DrawingControls } from "./map/DrawingControls";
import { HoverOverlay } from "./map/HoverOverlay";

type PhotoLikeObject = {
	url?: string;
	getURI?: (options: { maxHeight?: number; maxWidth?: number }) => string;
	getUrl?: (options: { maxWidth?: number; maxHeight?: number }) => string;
};

type PhotoLike = string | google.maps.places.PlacePhoto | PhotoLikeObject;

const hasGetUrl = (
	value: PhotoLike,
): value is {
	getUrl: (options: { maxWidth?: number; maxHeight?: number }) => string;
} => typeof value === "object" && value !== null && "getUrl" in value;

const hasGetUri = (
	value: PhotoLike,
): value is {
	getURI: (options: { maxHeight?: number; maxWidth?: number }) => string;
} => typeof value === "object" && value !== null && "getURI" in value;

const hasPhotoUrlProperty = (
	value: PhotoLike,
): value is {
	url: string;
} =>
	typeof value === "object" &&
	value !== null &&
	typeof (value as PhotoLikeObject).url === "string";

type AddressValidationRequest = {
	address: {
		addressLines: string[];
		regionCode?: string;
		languageCode?: string;
	};
};

interface AddressValidationVerdict {
	addressComplete?: boolean;
	hasInferredComponents?: boolean;
	hasReplacedComponents?: boolean;
	hasUnconfirmedComponents?: boolean;
}

interface AddressValidationGeocode {
	location?: google.maps.LatLngLiteral;
	plusCode?: {
		globalCode?: string;
		compoundCode?: string;
	};
}

interface AddressValidationPayload {
	address?: {
		formattedAddress?: string;
		postalAddress?: {
			regionCode?: string;
			addressLines?: string[];
			administrativeArea?: string;
			locality?: string;
			postalCode?: string;
		};
	};
	geocode?: AddressValidationGeocode;
	verdict?: AddressValidationVerdict;
	responseId?: string;
	[key: string]: unknown;
}

type AddressValidationLibrary = {
	AddressValidation: {
		fetchAddressValidation: (
			request: AddressValidationRequest,
		) => Promise<AddressValidationPayload>;
	};
};

type AddressValidationImportResult = {
	AddressValidation?: AddressValidationLibrary["AddressValidation"];
};

type PlacesLibraryWithPlace = google.maps.PlacesLibrary & {
	Place?: typeof google.maps.places.Place;
};

type PlacesImportResult = {
	Place?: typeof google.maps.places.Place;
};

type PlaceClass = typeof google.maps.places.Place;

type PlaceFetchOptions = ConstructorParameters<PlaceClass>[0];

const importAddressValidation = async (): Promise<
	AddressValidationLibrary["AddressValidation"] | null
> => {
	if (typeof google === "undefined" || !google.maps) return null;
	try {
		const gm = google.maps as GoogleMapsWithImport;
		const module = (await gm.importLibrary(
			"addressValidation",
		)) as AddressValidationImportResult;
		return module.AddressValidation ?? null;
	} catch {
		return null;
	}
};

const importPlaceConstructor = async (): Promise<PlaceClass | null> => {
	if (typeof google === "undefined" || !google.maps) return null;
	try {
		const gm = google.maps as GoogleMapsWithImport;
		const module = (await gm.importLibrary("places")) as PlacesImportResult;
		return module.Place ?? null;
	} catch {
		return null;
	}
};

type HoverDetails = {
	name?: string;
	formattedAddress?: string;
	url?: string;
	website?: string;
	phone?: string;
	rating?: number;
	userRatingsTotal?: number;
	openNow?: boolean;
	placeId?: string;
	googleMapsUri?: string;
	priceLevel?: number;
	businessStatus?: google.maps.places.BusinessStatus | string;
	hoursToday?: string;
	editorialSummary?: string;
	photos?: PhotoLike[];
	reviews?: google.maps.places.PlaceReview[];
	country?: string;
	addressType?: string;
	neighborhood?: string;
	city?: string;
	county?: string;
	state?: string;
	postalCode?: string;
};

type CoreLibrary = {
	ColorScheme?: typeof google.maps.ColorScheme;
};

type GoogleMapsWithImport = typeof google.maps & {
	importLibrary(name: "core"): Promise<CoreLibrary>;
	importLibrary(name: "addressValidation"): Promise<AddressValidationLibrary>;
	importLibrary(name: "places"): Promise<PlacesLibraryWithPlace>;
	importLibrary(name: string): Promise<unknown>;
};

type LegacyPlaceResult = google.maps.places.PlaceResult & {
	price_level?: number;
	business_status?: google.maps.places.BusinessStatus | string;
	photos?: google.maps.places.PlacePhoto[];
	reviews?: google.maps.places.PlaceReview[];
};

type PoiClickEvent = google.maps.MapMouseEvent & {
	placeId?: string;
	stop?: () => void;
};

const isPoiClickEvent = (
	event: google.maps.MapMouseEvent,
): event is PoiClickEvent =>
	typeof (event as PoiClickEvent).placeId === "string";

const getCurrentWeekdayDescription = (
	descriptions?: readonly string[] | null,
): string | undefined => {
	if (!Array.isArray(descriptions) || descriptions.length === 0)
		return undefined;
	const today = new Date().getDay();
	const normalizedIndex = today === 0 ? 6 : today - 1;
	return descriptions[normalizedIndex];
};

export type MapWithDrawingProps = {
	apiKey: string;
	mapId?: string;
	libraries?: ("drawing" | "marker" | "places" | "geometry")[];
	center: google.maps.LatLngLiteral;
	onCenterChange: (c: google.maps.LatLngLiteral) => void;
	results: google.maps.LatLngLiteral[];
	onResultsChange: (pins: google.maps.LatLngLiteral[]) => void;
	defaultZoom?: number;
	containerStyle?: { width: string; height: string };
	centerChangeZoom?: number;
	showAirQualityMeter?: boolean;
	// Refinement options
	pinSnapToGrid?: boolean;
	pinGridSizeDeg?: number; // e.g., 0.001 degrees ~ 100m
	// Address info window on hover
	showAddressHoverInfo?: boolean;
	// Deprecated: kept for backward compatibility
	showAddressInfoWindow?: boolean;
	// Address validation (Preview API)
	enableAddressValidation?: boolean;
	validationRegionCode?: string; // default US
	validationLanguageCode?: string; // default en
	// Pre-render validation for pins
	validatePinsBeforeRender?: boolean; // default true
	onPinValidated?: (payload: {
		pin: google.maps.LatLngLiteral;
		validation: AddressValidationPayload | null;
		formattedAddress: string;
	}) => void;
	// Map color scheme: light, dark, or follow system/app theme
	mapColorScheme?: "light" | "dark" | "system";
	// Optional external selection: when provided, fetch details and open popover
	selectedPlace?: {
		placeId?: string;
		location?: google.maps.LatLngLiteral;
	} | null;
	// Actions from popover
	onViewPlace?: (payload: {
		placeId?: string;
		position: google.maps.LatLngLiteral;
		name?: string;
		address?: string;
		googleMapsUri?: string;
		website?: string;
	}) => void;
	onAddToList?: (payload: {
		placeId?: string;
		position: google.maps.LatLngLiteral;
		name?: string;
		address?: string;
		googleMapsUri?: string;
		website?: string;
	}) => void;
	// When true, assume the Google Maps script is already loaded by a parent <LoadScript>
	// and skip injecting another script here.
	assumeLoaded?: boolean;
};

// Use a stable constant to avoid reloading LoadScript due to new array identity on each render
const DEFAULT_LIBRARIES: ("drawing" | "marker" | "places" | "geometry")[] = [
	"drawing",
	"marker",
	"places",
	"geometry",
];

const defaultContainer = { width: "100%", height: "500px" } as const;

const PLACE_FIELDS = [
	"displayName",
	"formattedAddress",
	"location",
	"rating",
	"userRatingCount",
	"currentOpeningHours",
	"internationalPhoneNumber",
	"websiteUri",
	"id",
	"googleMapsUri",
	"priceLevel",
	"businessStatus",
	"editorialSummary",
	"photos",
	"reviews",
] as const;

const LEGACY_PLACE_FIELDS = [
	"name",
	"formatted_address",
	"geometry",
	"url",
	"website",
	"international_phone_number",
	"opening_hours",
	"rating",
	"user_ratings_total",
	"place_id",
	"price_level",
	"business_status",
	"photos",
	"reviews",
] as const;

export function MapWithDrawing(props: MapWithDrawingProps) {
	const {
		apiKey,
		mapId,
		libraries = DEFAULT_LIBRARIES,
		center,
		onCenterChange,
		results,
		onResultsChange,
		defaultZoom = 12,
		containerStyle = defaultContainer,
		centerChangeZoom,
		showAirQualityMeter = true,
		pinSnapToGrid = false,
		pinGridSizeDeg = 0.001,
		showAddressHoverInfo,
		showAddressInfoWindow,
		enableAddressValidation = false,
		validationRegionCode = "US",
		validationLanguageCode = "en",
		validatePinsBeforeRender = true,
		onPinValidated,
		mapColorScheme = "system",
		selectedPlace,
		onViewPlace,
		onAddToList,
		assumeLoaded,
	} = props;

	// Compute final flag with backward compatibility
	const addressHover =
		typeof showAddressHoverInfo === "boolean"
			? showAddressHoverInfo
			: (showAddressInfoWindow ?? true);

	const [drawingMode, setDrawingMode] =
		useState<google.maps.drawing.OverlayType | null>(null);
	const [shapeDrawn, setShapeDrawn] = useState(false);
	const [boundaryApplied, setBoundaryApplied] = useState(false);

	const shapeRef = useRef<
		google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | null
	>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);
	const simMarkerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
	const isUserDraggingRef = useRef(false);
	// Air quality meter element host and ref
	const meterHostRef = useRef<HTMLDivElement | null>(null);
	const meterElRef = useRef<GmpAirQualityMeterElement | null>(null);
	// Hover InfoWindow state
	const [hoverPosition, setHoverPosition] =
		useState<google.maps.LatLngLiteral | null>(null);
	const [hoverAddress, setHoverAddress] = useState<string>("");
	const [hoverDetails, setHoverDetails] = useState<HoverDetails | null>(null);
	const geocodeCache = useRef<Map<string, string>>(new Map());
	const placesRef = useRef<google.maps.places.PlacesService | null>(null);
	const geocodeReqId = useRef(0);
	const [validating, setValidating] = useState(false);
	const [validation, setValidation] = useState<AddressValidationPayload | null>(
		null,
	);
	const [reviewsExpanded, setReviewsExpanded] = useState(false);
	const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
	// Suppress hover popover right after a click to avoid double popover
	const suppressHoverRef = useRef(false);
	// Color scheme readiness and enum
	const [colorSchemeEnum, setColorSchemeEnum] = useState<
		google.maps.ColorScheme | undefined
	>(undefined);
	const [googleReady, setGoogleReady] = useState(false);
	const [mapInit, setMapInit] = useState(false);
	// Defensive fallback: in some environments, GoogleMap onLoad/tilesloaded may be delayed or skipped.
	// Ensure the shim doesn't linger by force-hiding it shortly after mount when the script is assumed ready.
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (mapInit) return;
		const t = setTimeout(() => setMapInit(true), 1800);
		return () => clearTimeout(t);
	}, [mapInit, assumeLoaded, googleReady]);
	// If a parent already loaded the script, mark googleReady when available
	useEffect(() => {
		console.log("MapWithDrawing: assumeLoaded =", assumeLoaded);
		console.log("MapWithDrawing: window.google exists =", typeof window !== "undefined" && !!window.google);
		console.log("MapWithDrawing: window.google.maps exists =", typeof window !== "undefined" && !!window.google?.maps);
		console.log("MapWithDrawing: window.google.maps.Map exists =", typeof window !== "undefined" && !!window.google?.maps?.Map);
		console.log("MapWithDrawing: window.google.maps.importLibrary exists =", typeof window !== "undefined" && !!window.google?.maps?.importLibrary);

		if (!assumeLoaded) return;
		if (typeof window === "undefined") return;
		const w = window as unknown as { google?: typeof google };
		// Check for both modern importLibrary and legacy Map constructor
		if (w.google?.maps?.Map && w.google?.maps?.importLibrary && typeof w.google.maps.importLibrary === "function") {
			console.log("MapWithDrawing: Setting googleReady to true");
			setGoogleReady(true);
		}
	}, [assumeLoaded]);
	// Theme token HSL strings from CSS variables (no external util): e.g., "210 40% 98%"
	const [themeHsl, setThemeHsl] = useState<{
		primary: string;
		background: string;
	}>({ primary: "", background: "" });

	// Helper to safely extract a photo URL from various SDK shapes
	const getPhotoUrl = useCallback(
		(photo: PhotoLike | null | undefined, size = 320): string | null => {
			try {
				if (!photo) return null;
				if (typeof photo === "string") return photo;
				if (hasGetUri(photo)) {
					return photo.getURI({ maxHeight: size, maxWidth: size });
				}
				if (hasGetUrl(photo)) {
					return photo.getUrl({ maxWidth: size, maxHeight: size });
				}
				if (hasPhotoUrlProperty(photo)) {
					return photo.url;
				}
			} catch {}
			return null;
		},
		[],
	);

	const clearShape = useCallback(() => {
		if (shapeRef.current) {
			shapeRef.current.setMap(null);
			shapeRef.current = null;
		}
	}, []);

	// Load ColorScheme enum and resolve which scheme to use before map init
	useEffect(() => {
		if (!googleReady) return;
		let mounted = true;
		(async () => {
			try {
				const gm = google.maps as GoogleMapsWithImport;
				const coreLibrary = await gm.importLibrary("core");
				const colorScheme =
					coreLibrary.ColorScheme ?? google.maps.ColorScheme ?? undefined;
				if (!mounted || !colorScheme) return;
				if (mapColorScheme === "light") {
					setColorSchemeEnum(colorScheme.LIGHT);
					return;
				}
				if (mapColorScheme === "dark") {
					setColorSchemeEnum(colorScheme.DARK);
					return;
				}
				// system: force dark initially if app or system prefers dark; otherwise follow system
				const prefersAppDark =
					typeof document !== "undefined" &&
					document.documentElement.classList.contains("dark");
				const mql =
					typeof window !== "undefined"
						? window.matchMedia("(prefers-color-scheme: dark)")
						: undefined;
				const prefersSystemDark = !!mql?.matches;
				setColorSchemeEnum(
					prefersAppDark || prefersSystemDark
						? colorScheme.DARK
						: colorScheme.FOLLOW_SYSTEM,
				);
			} catch {
				// Fallback: no enum -> undefined (map will use default light)
				setColorSchemeEnum(undefined);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [googleReady, mapColorScheme]);

	// Read CSS variables for tokens (HSL triplets) so we can feed Google Maps colors
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const root = document.documentElement;
			const styles = getComputedStyle(root);
			const primary = styles.getPropertyValue("--primary").trim();
			const background = styles.getPropertyValue("--background").trim();
			setThemeHsl({ primary, background });
		} catch {
			// no-op
		}
	}, [googleReady, mapColorScheme]);

	// Track theme changes and remount map when scheme should change
	const [mapKey, setMapKey] = useState(0);
	useEffect(() => {
		if (!googleReady) return;
		let disposed = false;
		let observer: MutationObserver | null = null;
		let colorScheme: typeof google.maps.ColorScheme | undefined;
		// Setup listeners only for system mode
		if (mapColorScheme !== "system") return;
		(async () => {
			try {
				const gm = google.maps as GoogleMapsWithImport;
				const coreLibrary = await gm.importLibrary("core");
				colorScheme = coreLibrary.ColorScheme ?? google.maps.ColorScheme;
			} catch {
				colorScheme = undefined;
			}
			if (disposed) return;
			const mql = window.matchMedia("(prefers-color-scheme: dark)");
			const evalAndSet = () => {
				const prefersAppDark =
					document.documentElement.classList.contains("dark");
				if (!colorScheme) return;
				const next =
					prefersAppDark || mql.matches
						? colorScheme.DARK
						: colorScheme.FOLLOW_SYSTEM;
				setColorSchemeEnum((prev) => {
					if (prev !== next) {
						setMapKey((k) => k + 1); // force remount of GoogleMap
					}
					return next;
				});
			};
			const mqlHandler = () => evalAndSet();
			mql.addEventListener?.("change", mqlHandler);
			// Observe html class changes
			observer = new MutationObserver(evalAndSet);
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["class"],
			});
			// Initial check
			evalAndSet();
			// Also refresh CSS variable-derived colors on theme class changes
			const refreshCssVars = () => {
				try {
					const styles = getComputedStyle(document.documentElement);
					const primary = styles.getPropertyValue("--primary").trim();
					const background = styles.getPropertyValue("--background").trim();
					setThemeHsl((prev) =>
						prev.primary !== primary || prev.background !== background
							? { primary, background }
							: prev,
					);
				} catch {
					// ignore
				}
			};
			refreshCssVars();
			const mo = new MutationObserver(refreshCssVars);
			mo.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["class"],
			});
			observer = mo;
			// Cleanup
			return () => {
				mql.removeEventListener?.("change", mqlHandler);
			};
		})();
		return () => {
			disposed = true;
			if (observer) {
				observer.disconnect();
			}
		};
	}, [googleReady, mapColorScheme]);

	// Get validation result without touching component UI state
	const fetchAddressValidation = useCallback(
		async (address: string) => {
			if (!enableAddressValidation || !address) return null;
			try {
				const addressValidation = await importAddressValidation();
				if (!addressValidation) return null;
				return await addressValidation.fetchAddressValidation({
					address: {
						addressLines: [address],
						regionCode: validationRegionCode,
						languageCode: validationLanguageCode,
					},
				});
			} catch {
				return null;
			}
		},
		[enableAddressValidation, validationRegionCode, validationLanguageCode],
	);

	// Reverse geocode but return the formatted address without touching UI state
	const reverseGeocodeOnce = useCallback(
		async (pos: google.maps.LatLngLiteral): Promise<string> => {
			const key = `${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
			const cached = geocodeCache.current.get(key);
			if (cached) return cached;
			return new Promise<string>((resolve) => {
				try {
					const geocoder = new google.maps.Geocoder();
					geocoder.geocode({ location: pos }, (results, status) => {
						const addr =
							status === "OK" && results && results[0]
								? (results[0].formatted_address ?? "")
								: "";
						geocodeCache.current.set(key, addr);
						resolve(addr);
					});
				} catch {
					resolve("");
				}
			});
		},
		[],
	);

	const onOverlayComplete = useCallback(
		(e: google.maps.drawing.OverlayCompleteEvent) => {
			clearShape();
			shapeRef.current = e.overlay as
				| google.maps.Polygon
				| google.maps.Rectangle
				| google.maps.Circle;
			setDrawingMode(null);
			setShapeDrawn(true);
		},
		[clearShape],
	);

	const handleCancelDrawing = useCallback(() => {
		clearShape();
		setDrawingMode(null);
		setShapeDrawn(false);
		setBoundaryApplied(false);
		onResultsChange([]);
		for (const m of simMarkerRefs.current) m.map = null;
		simMarkerRefs.current = [];
	}, [clearShape, onResultsChange]);

	const handleApplyDrawing = useCallback(() => {
		if (!shapeRef.current || !mapRef.current) return;
		const bounds = getBoundsFromShape(shapeRef.current);
		if (bounds) mapRef.current.fitBounds(bounds);
		if (bounds) {
			const pins = generatePinsWithinBounds(bounds, shapeRef.current, 30);
			onResultsChange(pins);
			setBoundaryApplied(true);
		}
	}, [onResultsChange]);

	const handleRemoveBoundaries = useCallback(() => {
		handleCancelDrawing();
	}, [handleCancelDrawing]);

	// Render simulated pins as AdvancedMarkers (draggable; dblclick to delete)
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		// Clear previous sim markers
		for (const marker of simMarkerRefs.current) {
			marker.map = null;
		}
		simMarkerRefs.current = [];
		if (results?.length) {
			const buildMarker = (p: google.maps.LatLngLiteral, index: number) => {
				const marker = new google.maps.marker.AdvancedMarkerElement({
					map,
					position: p,
					gmpDraggable: true,
					zIndex: 10,
				});
				marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
					const pos = e.latLng?.toJSON();
					if (!pos) return;
					const next = results.slice();
					let newPos = pos;
					if (pinSnapToGrid && pinGridSizeDeg > 0) {
						const snap = (value: number, step: number) =>
							Math.round(value / step) * step;
						newPos = {
							lat: snap(pos.lat, pinGridSizeDeg),
							lng: snap(pos.lng, pinGridSizeDeg),
						};
					}
					next[index] = newPos;
					onResultsChange(next);
					(async () => {
						const addr = await reverseGeocodeOnce(newPos);
						const val = await fetchAddressValidation(addr);
						onPinValidated?.({
							pin: newPos,
							validation: val,
							formattedAddress: addr,
						});
					})();
				});
				const onEnter = () => {
					if (!addressHover) return;
					if (suppressHoverRef.current) return;
					setHoverAddress("");
					setHoverDetails(null);
					setValidation(null);
					setHoverPosition(p);
					reverseGeocode(p);
				};
				const onLeave = () => {
					setHoverPosition(null);
					setHoverAddress("");
					setHoverDetails(null);
					setValidation(null);
				};
				const advancedMarkerHandler = marker.addListener.bind(marker);
				advancedMarkerHandler(
					"gmp-mouseover",
					onEnter as Parameters<typeof marker.addListener>[1],
				);
				advancedMarkerHandler("mouseover", onEnter);
				advancedMarkerHandler(
					"gmp-mouseout",
					onLeave as Parameters<typeof marker.addListener>[1],
				);
				advancedMarkerHandler("mouseout", onLeave);
				return marker;
			};

			if (validatePinsBeforeRender) {
				(async () => {
					const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
					for (let i = 0; i < results.length; i++) {
						const pin = results[i];
						const addr = await reverseGeocodeOnce(pin);
						const val = await fetchAddressValidation(addr);
						onPinValidated?.({
							pin,
							validation: val,
							formattedAddress: addr,
						});
						const createdMarker = buildMarker(pin, i);
						newMarkers.push(createdMarker);
					}
					simMarkerRefs.current = newMarkers;
				})();
			} else {
				simMarkerRefs.current = results.map((pin, index) =>
					buildMarker(pin, index),
				);
			}
		}
		return () => {
			for (const marker of simMarkerRefs.current) {
				marker.map = null;
			}
		};
		// Note: reverseGeocode is intentionally omitted to avoid TDZ during initial render since it's defined later.
	}, [
		results,
		addressHover,
		onResultsChange,
		pinSnapToGrid,
		pinGridSizeDeg,
		reverseGeocodeOnce,
		fetchAddressValidation,
		validatePinsBeforeRender,
		onPinValidated,
	]);

	// Initialize / update AdvancedMarker for primary pin
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !center) return;
		if (!markerRef.current) {
			markerRef.current = new google.maps.marker.AdvancedMarkerElement({
				map,
				position: center,
				gmpDraggable: true,
			});
			markerRef.current.addListener(
				"dragend",
				(e: google.maps.MapMouseEvent) => {
					const p = e.latLng?.toJSON();
					if (p) onCenterChange(p);
				},
			);
			const onEnter = () => {
				if (!addressHover) return;
				if (suppressHoverRef.current) return;
				setHoverAddress("");
				setHoverDetails(null);
				setValidation(null);
				setHoverPosition(center);
				reverseGeocode(center);
			};
			const onLeave = () => {
				setHoverPosition(null);
				setHoverAddress("");
				setHoverDetails(null);
				setValidation(null);
			};
			const addMarkerListener = markerRef.current.addListener.bind(
				markerRef.current,
			);
			addMarkerListener(
				"gmp-mouseover",
				onEnter as Parameters<typeof markerRef.current.addListener>[1],
			);
			addMarkerListener("mouseover", onEnter);
			addMarkerListener(
				"gmp-mouseout",
				onLeave as Parameters<typeof markerRef.current.addListener>[1],
			);
			addMarkerListener("mouseout", onLeave);
		} else {
			markerRef.current.position = center;
			if (!markerRef.current.map) markerRef.current.map = map;
		}
		map.panTo(center);
		if (typeof centerChangeZoom === "number") {
			map.setZoom(centerChangeZoom);
		}
		if (meterElRef.current) {
			meterElRef.current.setAttribute(
				"location",
				`${center.lat},${center.lng}`,
			);
		}
	}, [center, onCenterChange]);

	// Helper: reverse geocode with caching
	const reverseGeocode = useCallback((pos: google.maps.LatLngLiteral) => {
		const key = `${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
		const cached = geocodeCache.current.get(key);
		if (cached !== undefined) {
			setHoverAddress(cached);
			// Keep previous details if any; don't overwrite on cache hit
			return;
		}
		const reqId = ++geocodeReqId.current;
		try {
			const geocoder = new google.maps.Geocoder();
			geocoder.geocode({ location: pos }, (results, status) => {
				if (reqId !== geocodeReqId.current) return; // stale response
				const primary =
					status === "OK" && results && results[0] ? results[0] : null;
				const addr = primary?.formatted_address ?? "";
				geocodeCache.current.set(key, addr);
				setHoverAddress(addr);
				if (primary) {
					const get = (type: string, short = false) =>
						primary.address_components?.find((c) => c.types.includes(type))?.[
							short ? "short_name" : "long_name"
						];
					setHoverDetails((prev) => ({
						...(prev || {}),
						formattedAddress: addr || undefined,
						neighborhood:
							get("neighborhood") ||
							get("sublocality") ||
							get("sublocality_level_1") ||
							undefined,
						city: get("locality") || get("postal_town") || undefined,
						county: get("administrative_area_level_2") || undefined,
						state:
							get("administrative_area_level_1", true) ||
							get("administrative_area_level_1") ||
							undefined,
						postalCode: get("postal_code") || undefined,
						country: get("country", true) || undefined,
						addressType: primary.types?.[0] || undefined,
						// ensure we don't show business-only fields for residential-only addresses
						placeId: prev?.placeId ? prev.placeId : undefined,
					}));
				}
			});
		} catch {
			if (reqId === geocodeReqId.current) setHoverAddress("");
		}
	}, []);

	// Address Validation (optional, Preview API)
	const validateAddressIfEnabled = useCallback(
		async (address: string) => {
			if (!enableAddressValidation || !address) return;
			setValidating(true);
			setValidation(null);
			try {
				const addressValidation = await importAddressValidation();
				if (!addressValidation) return;
				const result = await addressValidation.fetchAddressValidation({
					address: {
						addressLines: [address],
						regionCode: validationRegionCode,
						languageCode: validationLanguageCode,
					},
				});
				setValidation(result);
			} catch {
				// noop
			} finally {
				setValidating(false);
			}
		},
		[enableAddressValidation, validationRegionCode, validationLanguageCode],
	);

	const mapContent = (
		<div
			className="bg-background"
			style={{
				position: "relative",
				width: "100%",
				height: containerStyle.height,
			}}
		>
			<GoogleMap
				key={`map-${mapKey}-${colorSchemeEnum ?? "default"}`}
				mapContainerStyle={containerStyle}
				center={center}
				zoom={defaultZoom}
				onTilesLoaded={() => setMapInit(true)}
				onIdle={() => setMapInit(true)}
				options={{
					mapTypeId: "roadmap",
					disableDefaultUI: true,
					clickableIcons: true,
					gestureHandling: "greedy",
					backgroundColor: themeHsl.background
						? `hsl(${themeHsl.background})`
						: undefined,
					...(colorSchemeEnum ? { colorScheme: colorSchemeEnum } : {}),
					mapId: mapId,
				}}
				onLoad={(map) => {
					mapRef.current = map;
					setGoogleReady(true);
					setMapInit(true);
					const markLoaded = () => setMapInit(true);
					map.addListener("tilesloaded", markLoaded);
					map.addListener("idle", markLoaded);
				}}
			>
				{/* Render DrawingManager to enable drawing tools */}
				<DrawingManager
					drawingMode={drawingMode}
					onOverlayComplete={onOverlayComplete}
					options={{
						drawingControl: false, // We use our custom controls below
					}}
				/>
			</GoogleMap>
			{/* Render custom controls for drawing */}
			<DrawingControls
				drawingMode={drawingMode}
				setDrawingMode={setDrawingMode}
				shapeDrawn={shapeDrawn}
				boundaryApplied={boundaryApplied}
				onApplyDrawing={handleApplyDrawing}
				onCancelDrawing={handleCancelDrawing}
				onRemoveBoundaries={handleRemoveBoundaries}
			/>

			{/* Render the overlay for hover information only when a position is set */}
			{hoverPosition && (
				<HoverOverlay
					position={hoverPosition}
					address={hoverAddress}
					details={hoverDetails}
					validating={validating}
					validation={validation}
					reviewsExpanded={reviewsExpanded}
					setReviewsExpanded={setReviewsExpanded}
					getPhotoUrl={getPhotoUrl}
					setLightboxUrl={setLightboxUrl}
					onViewPlace={onViewPlace}
					onAddToList={onAddToList}
				/>
			)}
		</div>
	);

	if (assumeLoaded) {
		return mapContent;
	}

	return (
		<LoadScript
			googleMapsApiKey={apiKey}
			libraries={libraries}
			onLoad={() => setGoogleReady(true)}
			loadingElement={<div>Loading Google Maps...</div>}
			onError={(error) => {
				console.error("Google Maps failed to load:", error);
				setGoogleReady(false);
			}}
		>
			{mapContent}
		</LoadScript>
	);
}
