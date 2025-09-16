"use client";
import { GoogleMap, InfoWindow, LoadScript } from "@react-google-maps/api";
import Lottie from "lottie-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface LottieAnimationData {
	[key: string]: unknown;
}

type PropertyMapProps = {
	latitude: number;
	longitude: number;
	address: string;
	details: string;
};

const mapContainerStyle = {
	width: "100%",
	height: "400px",
	borderRadius: "15px",
	overflow: "hidden",
	position: "relative" as const,
};

const PropertyMap: React.FC<PropertyMapProps> = ({
	latitude,
	longitude,
	address,
	details,
}) => {
	const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(
		null,
	);
	const [homeAnimation, setHomeAnimation] =
		useState<LottieAnimationData | null>(null);
	const [isStreetView, setIsStreetView] = useState(false);
	const [mapTypeId, setMapTypeId] = useState<"satellite" | "roadmap">(
		"satellite",
	);
	const [panoId, setPanoId] = useState<string | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);

	const center = useMemo(
		() => ({ lat: latitude, lng: longitude }),
		[latitude, longitude],
	);

	useEffect(() => {
		fetch("/lottie/HousePing.json")
			.then((response) => response.json())
			.then((data: LottieAnimationData) => setHomeAnimation(data));
	}, []);

	const onLoad = useCallback(
		(map: google.maps.Map) => {
			mapRef.current = map;
			const streetViewService = new google.maps.StreetViewService();

			// First attempt with a tight radius
			streetViewService.getPanorama(
				{ location: center, radius: 50 },
				(data, status) => {
					if (
						status === google.maps.StreetViewStatus.OK &&
						data?.location?.pano
					) {
						console.log("Street View found at 50m radius.");
						setPanoId(data.location.pano);
					} else {
						console.log(
							"Street View not found at 50m, trying a wider search (1000m)...",
						);
						// Second attempt with a wider radius
						streetViewService.getPanorama(
							{
								location: center,
								radius: 1000,
								source: google.maps.StreetViewSource.OUTDOOR,
							},
							(data, status) => {
								if (
									status === google.maps.StreetViewStatus.OK &&
									data?.location?.pano
								) {
									console.log("Street View found at 1000m radius.");
									setPanoId(data.location.pano);
								} else {
									console.error(
										"Street View panorama not found even within a 1000m radius.",
									);
								}
							},
						);
					}
				},
			);
		},
		[center],
	);

	useEffect(() => {
		if (!mapRef.current) return;

		// Clean up previous marker
		if (markerRef.current) {
			markerRef.current.map = null;
		}

		// Create new AdvancedMarkerElement if not in street view
		if (!isStreetView) {
			const newMarker = new google.maps.marker.AdvancedMarkerElement({
				map: mapRef.current,
				position: center,
			});

			newMarker.addListener("click", () => {
				setSelected(center);
			});

			markerRef.current = newMarker;
		} else {
			markerRef.current = null;
		}

		// Cleanup function to run when component unmounts or dependencies change
		return () => {
			if (markerRef.current) {
				markerRef.current.map = null;
			}
		};
	}, [center, isStreetView]);

	const mapOptions = {
		mapId: process.env.NEXT_PUBLIC_GMAPS_MAP_ID,
		mapTypeId,
		disableDefaultUI: true,
		zoomControl: true,
		mapTypeControl: false,
		streetViewControl: false, // Correctly disable the default control
		fullscreenControl: true,
	};

	const handleStreetViewToggle = () => {
		if (!mapRef.current || !panoId) return;

		const panorama = mapRef.current.getStreetView();
		const nextIsStreetView = !isStreetView;

		if (nextIsStreetView) {
			panorama.setPano(panoId);
			panorama.setVisible(true);
		} else {
			panorama.setVisible(false);
		}

		setIsStreetView(nextIsStreetView);
	};

	return (
		<LoadScript
			googleMapsApiKey={process.env.NEXT_PUBLIC_GMAPS_KEY ?? ""}
			libraries={["marker", "streetView"]}
		>
			<div style={mapContainerStyle}>
				<GoogleMap
					mapContainerStyle={{ width: "100%", height: "100%" }}
					center={center}
					zoom={18}
					options={mapOptions}
					onLoad={onLoad}
				>
					{!isStreetView && selected && (
						<InfoWindow
							position={selected}
							onCloseClick={() => setSelected(null)}
						>
							<div className="flex items-center text-foreground">
								{homeAnimation && (
									<Lottie
										animationData={homeAnimation}
										style={{ height: 30, width: 30, marginRight: 10 }}
									/>
								)}
								<div style={{ flex: 1 }}>
									<h2
										className="font-bold"
										style={{ fontSize: "1rem", margin: 0 }}
									>
										{address}
									</h2>
									<p style={{ fontSize: "0.875rem", margin: 0 }}>{details}</p>
								</div>
							</div>
						</InfoWindow>
					)}
				</GoogleMap>

				{/* Custom Controls */}
				<div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
					<button
						type="button"
						onClick={handleStreetViewToggle}
						className="rounded-lg bg-card/80 px-3 py-2 text-sm font-semibold text-card-foreground shadow-md hover:bg-card/100 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={!panoId}
					>
						{isStreetView ? "Exit Street View" : "Street View"}
					</button>
					<button
						type="button"
						onClick={() =>
							setMapTypeId(mapTypeId === "satellite" ? "roadmap" : "satellite")
						}
						className="rounded-lg bg-card/80 px-3 py-2 text-sm font-semibold text-card-foreground shadow-md hover:bg-card/100"
					>
						{mapTypeId === "satellite" ? "Map View" : "Satellite View"}
					</button>
				</div>
			</div>
		</LoadScript>
	);
};

export default PropertyMap;
