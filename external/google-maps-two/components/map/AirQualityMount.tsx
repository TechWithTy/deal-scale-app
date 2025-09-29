"use client";
import { useEffect, useRef } from "react";

export type GmpAirQualityMeterElement = HTMLElement & {
    setAttribute(name: "location", value: string): void;
};

export function AirQualityMount({
    center,
    onReady,
}: {
    center: google.maps.LatLngLiteral;
    onReady: (el: GmpAirQualityMeterElement) => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        // Always create the custom element tag; avoid experimental constructors
        const el = document.createElement("gmp-air-quality-meter") as GmpAirQualityMeterElement;
        el.setAttribute("location", `${center.lat},${center.lng}`);
        if (containerRef.current) containerRef.current.appendChild(el);
        onReady(el);
        return () => {
            try {
                if (containerRef.current && el && containerRef.current.contains(el)) {
                    containerRef.current.removeChild(el);
                }
            } catch {
                // noop
            }
        };
    }, [center.lat, center.lng, onReady]);
    return <div ref={containerRef} />;
}
