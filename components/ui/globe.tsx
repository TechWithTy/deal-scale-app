"use client";

import React, { useEffect, useRef } from "react";
import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils/index";

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG: COBEOptions = {
	width: 800,
	height: 800,
	onRender: () => {},
	devicePixelRatio: 2,
	phi: 0,
	theta: 0.3,
	dark: 0,
	diffuse: 0.4,
	mapSamples: 16000,
	mapBrightness: 1.2,
	baseColor: [1, 1, 1],
	markerColor: [251 / 255, 100 / 255, 21 / 255],
	glowColor: [1, 1, 1],
	markers: [
		{ location: [14.5995, 120.9842], size: 0.03 },
		{ location: [19.076, 72.8777], size: 0.1 },
		{ location: [23.8103, 90.4125], size: 0.05 },
		{ location: [30.0444, 31.2357], size: 0.07 },
		{ location: [39.9042, 116.4074], size: 0.08 },
		{ location: [-23.5505, -46.6333], size: 0.1 },
		{ location: [19.4326, -99.1332], size: 0.1 },
		{ location: [40.7128, -74.006], size: 0.1 },
		{ location: [34.6937, 135.5022], size: 0.05 },
		{ location: [41.0082, 28.9784], size: 0.06 },
	],
};

export function Globe({
	className,
	config = GLOBE_CONFIG,
	style,
}: {
	className?: string;
	config?: COBEOptions;
	style?: React.CSSProperties;
}) {
	let phi = 0;
	let width = 0;
	let pixelRatio = 2;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pointerInteracting = useRef<number | null>(null);
	const pointerInteractionMovement = useRef(0);

	const r = useMotionValue(0);
	const rs = useSpring(r, {
		mass: 1,
		damping: 30,
		stiffness: 100,
	});

	const baseMarkersRef = useRef(
		(config.markers ?? []).map((marker) => ({ ...marker })),
	);
	const animationStartRef = useRef<number>(Date.now());

	const updatePointerInteraction = (value: number | null) => {
		pointerInteracting.current = value;
		if (canvasRef.current) {
			canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
		}
	};

	const updateMovement = (clientX: number) => {
		if (pointerInteracting.current !== null) {
			const delta = clientX - pointerInteracting.current;
			pointerInteractionMovement.current = delta;
			r.set(r.get() + delta / MOVEMENT_DAMPING);
		}
	};

	useEffect(() => {
		const resolveDimensions = () => {
			if (!canvasRef.current) return;
			const elementWidth = canvasRef.current.offsetWidth;
			pixelRatio = Math.min(
				window.devicePixelRatio ?? 1,
				config.devicePixelRatio ?? 2.5,
			);
			width = Math.max(elementWidth * pixelRatio, 320);
			canvasRef.current.width = width;
			canvasRef.current.height = width;
		};

		window.addEventListener("resize", resolveDimensions);
		resolveDimensions();

		const globe = createGlobe(canvasRef.current!, {
			...config,
			devicePixelRatio: pixelRatio,
			width,
			height: width,
			onRender: (state) => {
				if (!pointerInteracting.current) phi += 0.005;
				state.phi = phi + rs.get();
				state.width = width;
				state.height = width;
				const elapsedSeconds = (Date.now() - animationStartRef.current) / 1000;
				state.markers = baseMarkersRef.current.map((marker, index) => {
					const wave =
						Math.sin(elapsedSeconds * (0.7 + index * 0.18)) * 0.5 + 0.5;
					const twinkle =
						Math.sin(elapsedSeconds * (1 + index * 0.12) + index) * 0.5 + 0.5;
					const intensity = wave * twinkle;
					const visibility = intensity > 0.15 ? intensity : 0;
					return {
						...marker,
						size: marker.size * (0.5 + visibility * 1.3),
					};
				});
			},
		});

		setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0);
		return () => {
			globe.destroy();
			window.removeEventListener("resize", resolveDimensions);
		};
	}, [rs, config]);

	return (
		<div
			className={cn(
				"absolute inset-0 mx-auto aspect-square w-full max-w-[600px]",
				className,
			)}
			style={style}
		>
			<canvas
				className={cn(
					"size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
				)}
				ref={canvasRef}
				onPointerDown={(e) => {
					pointerInteracting.current = e.clientX;
					updatePointerInteraction(e.clientX);
				}}
				onPointerUp={() => updatePointerInteraction(null)}
				onPointerOut={() => updatePointerInteraction(null)}
				onMouseMove={(e) => updateMovement(e.clientX)}
				onTouchMove={(e) =>
					e.touches[0] && updateMovement(e.touches[0].clientX)
				}
			/>
		</div>
	);
}
