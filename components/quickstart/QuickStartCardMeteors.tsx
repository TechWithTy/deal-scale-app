"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/_utils";

type MeteorIntensity = "high" | "normal";

type MeteorVisual = {
	style: CSSProperties;
	tailWidth: number;
};

interface QuickStartCardMeteorsProps {
	readonly intensity: MeteorIntensity;
	readonly seed: number;
}

const createSeededRandom = (seed: number) => {
	let value = Math.floor(seed * 1_000_000) % 2_147_483_647;
	if (value <= 0) {
		value += 2_147_483_646;
	}

	return () => {
		value = (value * 16_807) % 2_147_483_647;
		return (value - 1) / 2_147_483_646;
	};
};

const randomBetween = (randomFn: () => number, min: number, max: number) =>
	min + randomFn() * (max - min);

export const QuickStartCardMeteors = ({
	intensity,
	seed,
}: QuickStartCardMeteorsProps) => {
	const overlayRef = useRef<HTMLDivElement>(null);
	const [meteors, setMeteors] = useState<MeteorVisual[]>([]);

	const config = useMemo(() => {
		const random = createSeededRandom(seed);
		const baseCount = intensity === "high" ? 12 : 6;
		const number =
			baseCount + Math.floor(random() * (intensity === "high" ? 4 : 3));
		const angle = randomBetween(random, 200, 240);
		const minDelay = randomBetween(random, 0.05, 0.3);
		const maxDelay = randomBetween(random, 0.6, 1.2);
		const minDuration =
			intensity === "high"
				? randomBetween(random, 1.8, 2.2)
				: randomBetween(random, 2.6, 3.2);
		const maxDuration =
			intensity === "high"
				? randomBetween(random, 4.2, 5.4)
				: randomBetween(random, 5.5, 7.5);

		return {
			number,
			angle,
			minDelay,
			maxDelay,
			minDuration,
			maxDuration,
			random,
		};
	}, [intensity, seed]);

	useEffect(() => {
		const overlayNode = overlayRef.current;
		if (!overlayNode) {
			return;
		}

		const generateMeteors = () => {
			const { clientWidth, clientHeight } = overlayNode;
			const visuals: MeteorVisual[] = Array.from({ length: config.number }).map(
				() => {
					const leftPx = randomBetween(config.random, 0, clientWidth);
					const startOffset =
						randomBetween(config.random, -0.2, -0.05) * clientHeight;
					const delay = randomBetween(
						config.random,
						config.minDelay,
						config.maxDelay,
					);
					const duration = randomBetween(
						config.random,
						config.minDuration,
						config.maxDuration,
					);
					const tailWidth = randomBetween(
						config.random,
						36,
						intensity === "high" ? 92 : 68,
					);
					const travelDistance = randomBetween(
						config.random,
						intensity === "high" ? 520 : 420,
						intensity === "high" ? 880 : 720,
					);

					return {
						style: {
							left: `${leftPx}px`,
							top: `${startOffset}px`,
							"--meteor-angle": `${config.angle}deg`,
							"--meteor-distance": `-${travelDistance}px`,
							animationDelay: `${delay}s`,
							animationDuration: `${duration}s`,
						} as CSSProperties,
						tailWidth,
					};
				},
			);

			setMeteors(visuals);
		};

		generateMeteors();
		const resizeHandler = () => generateMeteors();
		window.addEventListener("resize", resizeHandler);
		return () => window.removeEventListener("resize", resizeHandler);
	}, [config]);

	return (
		<div
			ref={overlayRef}
			className="pointer-events-none absolute inset-0 overflow-hidden"
			aria-hidden="true"
		>
			{meteors.map(({ style, tailWidth }, index) => (
				<span
					key={`quickstart-meteor-${index}`}
					style={style}
					className={cn(
						"animate-meteor pointer-events-none absolute h-0.5 w-0.5 rounded-full bg-primary/70",
						"shadow-[0_0_0_1px_rgba(255,255,255,0.25)]",
					)}
				>
					<div
						className="pointer-events-none absolute top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
						style={{ width: `${tailWidth}px` }}
					/>
				</span>
			))}
		</div>
	);
};
