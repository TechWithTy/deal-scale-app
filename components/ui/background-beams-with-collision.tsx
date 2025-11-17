"use client";

import { cn } from "@/lib/_utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";

type BackgroundBeamsWithCollisionProps =
	React.HTMLAttributes<HTMLDivElement> & {
		readonly children?: React.ReactNode;
	};

export const BackgroundBeamsWithCollision = ({
	children,
	className,
	...rest
}: BackgroundBeamsWithCollisionProps) => {
	const isBrowser = typeof window !== "undefined";
	const floorRef = useRef<HTMLDivElement>(null);
	const parentRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const colliderTargetsRef = useRef<HTMLElement[]>([]);
	const [isPaused, setIsPaused] = useState(false);

	const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;
		const parent = parentRef.current;
		if (!parent) {
			return;
		}

		const isBeam = target.dataset?.beam === "true";
		const isContent = !!contentRef.current?.contains(target);
		const isSelf = target === parent;

		if (isSelf && !isPaused) {
			setIsPaused(true);
			return;
		}

		if ((isBeam || isContent) && isPaused) {
			setIsPaused(false);
		}
	};

	const handleMouseLeave = () => {
		setIsPaused(false);
	};

	useEffect(() => {
		if (!isBrowser) return;
		if (!contentRef.current) {
			return;
		}

		const updateTargets = () => {
			colliderTargetsRef.current = Array.from(
				contentRef.current?.querySelectorAll<HTMLElement>(
					"[data-beam-collider='true']",
				) ?? [],
			);
		};

		updateTargets();

		const observer = new MutationObserver(updateTargets);
		observer.observe(contentRef.current, {
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	}, [children]);

	const getCollisionRects = useCallback((): DOMRect[] => {
		const rects: DOMRect[] = [];
		if (floorRef.current) {
			rects.push(floorRef.current.getBoundingClientRect());
		}
		for (const node of colliderTargetsRef.current) {
			rects.push(node.getBoundingClientRect());
		}
		return rects;
	}, []);

	const beams = [
		{
			initialX: 10,
			translateX: 10,
			duration: 7,
			repeatDelay: 3,
			delay: 2,
		},
		{
			initialX: 600,
			translateX: 600,
			duration: 3,
			repeatDelay: 3,
			delay: 4,
		},
		{
			initialX: 100,
			translateX: 100,
			duration: 7,
			repeatDelay: 7,
			className: "h-6",
		},
		{
			initialX: 400,
			translateX: 400,
			duration: 5,
			repeatDelay: 14,
			delay: 4,
		},
		{
			initialX: 800,
			translateX: 800,
			duration: 11,
			repeatDelay: 2,
			className: "h-20",
		},
		{
			initialX: 1000,
			translateX: 1000,
			duration: 4,
			repeatDelay: 2,
			className: "h-12",
		},
		{
			initialX: 1200,
			translateX: 1200,
			duration: 6,
			repeatDelay: 4,
			delay: 2,
			className: "h-6",
		},
	];

	if (!isBrowser) {
		return (
			<div
				className={cn(
					"relative flex w-full items-center justify-center overflow-hidden",
					className,
				)}
				{...rest}
			>
				<div className="relative z-10 w-full">{children}</div>
			</div>
		);
	}

	return (
		<div
			ref={parentRef}
			className={cn(
				"relative flex w-full items-center justify-center overflow-hidden",
				className,
			)}
			onMouseOver={handleMouseOver}
			onMouseLeave={handleMouseLeave}
			{...rest}
		>
			{/* Base layers: grid background + soft beams */}
			<GridBackground />
			<SoftBeams />

			{/* Beams layer */}
			{beams.map((beam) => (
				<CollisionMechanism
					key={`${beam.initialX}-beam-idx`}
					beamOptions={beam}
					getCollisionRects={getCollisionRects}
					parentRef={parentRef}
					isPaused={isPaused}
				/>
			))}

			{/* Content layer with higher z-index */}
			<div ref={contentRef} className="relative z-10 w-full">
				{children}
			</div>

			{/* Collision floor - theme adaptive with glow */}
			<div
				ref={floorRef}
				className="pointer-events-none absolute inset-x-0 bottom-0 w-full bg-gradient-to-t from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10"
				style={{
					boxShadow:
						"0 0 40px hsl(var(--primary) / 0.15), 0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05)",
				}}
			/>
		</div>
	);
};

const CollisionMechanism = React.forwardRef<
	HTMLDivElement,
	{
		getCollisionRects: () => DOMRect[];
		parentRef: React.RefObject<HTMLDivElement>;
		isPaused?: boolean;
		beamOptions?: {
			initialX?: number;
			translateX?: number;
			initialY?: number;
			translateY?: number;
			rotate?: number;
			className?: string;
			duration?: number;
			delay?: number;
			repeatDelay?: number;
		};
	}
>(
	(
		{ parentRef, getCollisionRects, beamOptions = {}, isPaused = false },
		ref,
	) => {
		const beamRef = useRef<HTMLDivElement>(null);
		const [collision, setCollision] = useState<{
			detected: boolean;
			coordinates: { x: number; y: number } | null;
		}>({
			detected: false,
			coordinates: null,
		});
		const [beamKey, setBeamKey] = useState(0);
		const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

		const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

		useEffect(() => {
			return () => {
				for (const id of timeoutsRef.current) {
					clearTimeout(id);
				}
				timeoutsRef.current = [];
			};
		}, []);

		useEffect(() => {
			// Guard against SSR/test environments
			if (typeof window === "undefined" || isPaused) return;

			const checkCollision = () => {
				// Guard against test environment teardown
				if (typeof window === "undefined") return;
				if (!beamRef.current || !parentRef.current || cycleCollisionDetected) {
					return;
				}

				const beamRect = beamRef.current.getBoundingClientRect();
				const parentRect = parentRef.current.getBoundingClientRect();
				const targetRects = getCollisionRects();

				for (const targetRect of targetRects) {
					const horizontallyOverlaps =
						beamRect.right >= targetRect.left &&
						beamRect.left <= targetRect.right;
					const verticallyOverlaps =
						beamRect.bottom >= targetRect.top &&
						beamRect.top <= targetRect.bottom;

					if (!horizontallyOverlaps || !verticallyOverlaps) {
						continue;
					}

					const beamCenterX = beamRect.left + beamRect.width / 2;
					const clampedX = Math.min(
						Math.max(beamCenterX, targetRect.left),
						targetRect.right,
					);
					const clampedY = Math.min(
						Math.max(beamRect.bottom, targetRect.top),
						targetRect.bottom,
					);

					// Guard setState calls against test environment teardown
					if (typeof window !== "undefined") {
						setCollision({
							detected: true,
							coordinates: {
								x: clampedX - parentRect.left,
								y: clampedY - parentRect.top,
							},
						});
						setCycleCollisionDetected(true);
					}
					break;
				}
			};

			const animationInterval = setInterval(checkCollision, 50);

			return () => clearInterval(animationInterval);
		}, [cycleCollisionDetected, getCollisionRects, isPaused, parentRef]);

		useEffect(() => {
			// Guard against SSR/test environments
			if (typeof window === "undefined") return;

			if (collision.detected && collision.coordinates) {
				const resetCollision = setTimeout(() => {
					// Guard setState calls against test environment teardown
					if (typeof window !== "undefined") {
						setCollision({ detected: false, coordinates: null });
						setCycleCollisionDetected(false);
					}
				}, 2000);

				const restartBeam = setTimeout(() => {
					// Guard setState calls against test environment teardown
					if (typeof window !== "undefined") {
						setBeamKey((prevKey) => prevKey + 1);
					}
				}, 2000);

				timeoutsRef.current.push(resetCollision, restartBeam);
			} else if (!collision.detected) {
				// Clear pending timeouts if collision is reset
				for (const id of timeoutsRef.current) {
					clearTimeout(id);
				}
				timeoutsRef.current = [];
			}

			return () => {
				// Cleanup all timeouts on unmount
				for (const id of timeoutsRef.current) {
					clearTimeout(id);
				}
				timeoutsRef.current = [];
			};
		}, [collision]);

		return (
			<>
				<motion.div
					key={beamKey}
					ref={beamRef}
					data-beam="true"
					animate={isPaused ? "paused" : "animate"}
					initial={{
						translateY: beamOptions.initialY || "-200px",
						translateX: beamOptions.initialX || "0px",
						rotate: beamOptions.rotate || 0,
					}}
					variants={{
						animate: {
							translateY: beamOptions.translateY || "1800px",
							translateX: beamOptions.translateX || "0px",
							rotate: beamOptions.rotate || 0,
						},
						paused: {
							// Stay at current position when paused
						},
					}}
					transition={{
						duration: beamOptions.duration || 8,
						repeat: isPaused ? 0 : Infinity,
						repeatType: "loop",
						ease: "linear",
						delay: beamOptions.delay || 0,
						repeatDelay: beamOptions.repeatDelay || 0,
					}}
					className={cn(
						"absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-primary via-primary/70 to-transparent dark:from-primary/80 dark:via-primary/50",
						beamOptions.className,
					)}
				/>
				<AnimatePresence>
					{collision.detected && collision.coordinates && (
						<Explosion
							key={`${collision.coordinates.x}-${collision.coordinates.y}`}
							className=""
							style={{
								left: `${collision.coordinates.x}px`,
								top: `${collision.coordinates.y}px`,
								transform: "translate(-50%, -50%)",
							}}
						/>
					)}
				</AnimatePresence>
			</>
		);
	},
);

CollisionMechanism.displayName = "CollisionMechanism";

const GridBackground = () => (
	<div className="pointer-events-none absolute inset-0 -z-20">
		<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.3),_transparent_45%)]" />
		<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.28),_transparent_55%)]" />
		<div className="absolute inset-0 opacity-[0.12]">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.35)_1px,_transparent_1px)] bg-[length:40px_100%]" />
			<div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.25)_1px,_transparent_1px)] bg-[length:100%_40px]" />
		</div>
	</div>
);

const SoftBeams = () => (
	<div className="pointer-events-none absolute inset-0 -z-10">
		<div className="absolute inset-0 blur-[120px] opacity-40">
			<div className="absolute -left-10 top-0 h-[40%] w-[35%] rounded-full bg-primary/30" />
			<div className="absolute bottom-10 right-0 h-[38%] w-[32%] rounded-full bg-sky-400/25" />
		</div>
		<div className="absolute inset-0 opacity-20">
			<motion.div
				animate={{ opacity: [0.2, 0.5, 0.2] }}
				transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
				className="absolute inset-x-0 top-[-10%] h-[45%] bg-gradient-to-b from-primary/25 via-primary/10 to-transparent blur-3xl"
			/>
			<motion.div
				animate={{ opacity: [0.1, 0.35, 0.1] }}
				transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
				className="absolute inset-y-0 right-[-15%] w-[30%] bg-gradient-to-l from-sky-400/25 via-sky-300/10 to-transparent blur-[110px]"
			/>
		</div>
	</div>
);

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
	const spans = Array.from({ length: 20 }, (_, index) => ({
		id: index,
		initialX: 0,
		initialY: 0,
		directionX: Math.floor(Math.random() * 80 - 40),
		directionY: Math.floor(Math.random() * -50 - 10),
	}));

	return (
		<div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 1.5, ease: "easeOut" }}
				className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-sm shadow-lg shadow-primary/50 dark:via-primary/90 dark:shadow-primary/30"
			/>
			{spans.map((span) => (
				<motion.span
					key={span.id}
					initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
					animate={{
						x: span.directionX,
						y: span.directionY,
						opacity: 0,
					}}
					transition={{
						duration: Math.random() * 1.5 + 0.5,
						ease: "easeOut",
					}}
					className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60 shadow-sm shadow-primary/50 dark:from-primary/90 dark:to-primary/50"
				/>
			))}
		</div>
	);
};
