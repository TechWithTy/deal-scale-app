"use client";

import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { resolveSupademoIdForPath } from "@/lib/config/supademo";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

/**
 * FloatingHelpSupademo
 * Animated floating help button that triggers a Supademo demo.
 * Uses Tailwind utilities only (no external CSS).
 */
export default function FloatingHelpSupademo({
	demoId = "cmhjlwt7i0jk4u1hm0scmf39w",
	label = "Help & Demo",
	hiddenOnMobile = false,
	avoidChat = true,
	cacheDays = 7,
	position = "br",
	offset = 24,
	mode = "modal",
	theme = "default",
	defaultVisible = false,
}: {
	demoId?: string;
	label?: string;
	hiddenOnMobile?: boolean;
	avoidChat?: boolean;
	cacheDays?: number;
	/**
	 * Position of the button: 'br' (bottom-right), 'bl', 'tr', 'tl'
	 */
	position?: "br" | "bl" | "tr" | "tl";
	/**
	 * Base offset in pixels from edges
	 */
	offset?: number;
	/**
	 * How to open help: 'modal' (in-app) or 'fullscreen' (Supademo default).
	 */
	mode?: "modal" | "fullscreen";
	/**
	 * Visual theme: default | mood | weather | pipeline
	 */
	theme?: "default" | "mood" | "weather" | "pipeline";
	/** If false, the FAB is hidden until an event is fired to show it. */
	defaultVisible?: boolean;
}) {
	// Theme styles (enumerated classes to satisfy Tailwind scan)
	const themeStyles = (() => {
		switch (theme) {
			case "mood":
				return {
					border: "border-fuchsia-400",
					text: "text-fuchsia-300",
					bg: "bg-gradient-to-br from-fuchsia-900/40 to-indigo-900/40",
					ring: "ring-fuchsia-400/50",
					pingBg: "bg-fuchsia-400/30",
					glowBg: "bg-fuchsia-400/20",
					chipRing: "ring-fuchsia-400/30",
				};
			case "weather":
				return {
					border: "border-sky-400",
					text: "text-sky-300",
					bg: "bg-gradient-to-br from-sky-900/40 to-cyan-900/40",
					ring: "ring-sky-400/50",
					pingBg: "bg-sky-400/30",
					glowBg: "bg-sky-400/20",
					chipRing: "ring-sky-400/30",
				};
			case "pipeline":
				return {
					border: "border-emerald-400",
					text: "text-emerald-300",
					bg: "bg-gradient-to-br from-emerald-900/40 to-lime-900/40",
					ring: "ring-emerald-400/50",
					pingBg: "bg-emerald-400/30",
					glowBg: "bg-emerald-400/20",
					chipRing: "ring-emerald-400/30",
				};
			default:
				return {
					border: "border-primary",
					text: "text-primary",
					bg: "bg-background",
					ring: "ring-primary/50",
					pingBg: "bg-primary/30",
					glowBg: "bg-primary/20",
					chipRing: "ring-primary/30",
				};
		}
	})();
	// Defer mount slightly to avoid layout shift on page load
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 300);
		return () => clearTimeout(t);
	}, []);

	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Determine final demo id from route map if not explicitly provided
	const routeResolvedId = useMemo(() => {
		const hit = resolveSupademoIdForPath(pathname || "/");
		return hit?.id ?? null;
	}, [pathname]);

	const finalDemoId = demoId || routeResolvedId || "cmhjlwt7i0jk4u1hm0scmf39w";

	// Local dismissal cache
	const cacheKey = `supademo_dismissed_${finalDemoId}`;
	const forceHelp = searchParams?.get("help") === "1";
	const [dismissed, setDismissed] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		if (!defaultVisible) return true; // hidden by default unless opted-in
		try {
			const raw = window.localStorage.getItem(cacheKey);
			if (!raw) return false;
			const data = JSON.parse(raw) as { ts: number } | null;
			if (!data?.ts) return false;
			const ageDays = (Date.now() - data.ts) / (1000 * 60 * 60 * 24);
			return ageDays < cacheDays;
		} catch {
			return false;
		}
	});

	useEffect(() => {
		if (forceHelp) setDismissed(false);
	}, [forceHelp]);

	// Detect Zoho SalesIQ or other common chat widgets and adjust offset
	const [chatOffset, setChatOffset] = useState(0);
	useEffect(() => {
		if (!avoidChat) return;
		if (typeof window === "undefined") return;
		const detect = () => {
			const zoho = document.getElementById("zsiqwidget");
			const intercom = document.querySelector("iframe[src*='intercom.io']");
			const crisp = (window as unknown as { $crisp?: unknown }).$crisp;
			const found = Boolean(zoho || intercom || crisp);
			const next = found ? 80 : 0;
			// Avoid unnecessary re-renders
			setChatOffset((prev) => (prev === next ? prev : next));
		};
		detect();
		const t = window.setInterval(detect, 1200);
		return () => window.clearInterval(t);
	}, [avoidChat]);

	// Local modal fallback (does not depend on external SDK)
	const [isHelpOpen, setIsHelpOpen] = useState(false);

	// Event bridge so static page icon can reveal the FAB
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (typeof window === "undefined") return;
		const show = () => {
			try {
				window.localStorage.removeItem(cacheKey);
			} catch {}
			setDismissed(false);
			setPos((prev) => prev ?? computeDefaultPos());
		};
		const openModal = () => {
			show();
			setIsHelpOpen(true);
		};
		const hide = () => {
			try {
				window.localStorage.setItem(
					cacheKey,
					JSON.stringify({ ts: Date.now() }),
				);
			} catch {}
			setDismissed(true);
		};
		window.addEventListener("dealScale:helpFab:show", show);
		window.addEventListener("dealScale:helpFab:hide", hide);
		window.addEventListener("dealScale:helpFab:openModal", openModal);
		return () => {
			window.removeEventListener("dealScale:helpFab:show", show);
			window.removeEventListener("dealScale:helpFab:hide", hide);
			window.removeEventListener("dealScale:helpFab:openModal", openModal);
		};
	}, []);

	// Draggable state (persisted)
	type Pos = { x: number; y: number };
	const posKey = "supademo_fab_pos_v1";
	const [pos, setPos] = useState<Pos | null>(null);
	const dragMovedRef = useRef(false);
	const fabSize = 56; // core button size
	const haloPad = 10; // extra room for halo/close button
	useEffect(() => {
		if (typeof window === "undefined") return;
		const w = window.innerWidth;
		const h = window.innerHeight;
		// Try load last position
		try {
			const raw = window.localStorage.getItem(posKey);
			if (raw) {
				const p = JSON.parse(raw) as Pos;
				// Ensure still on-screen
				if (p.x >= 0 && p.x <= w - 48 && p.y >= 0 && p.y <= h - 48) {
					setPos(p);
					return;
				}
			}
		} catch {}
		// Default near bottom-right (account for chat + halo)
		const defaultX = Math.max(8, w - (offset + chatOffset + fabSize + haloPad));
		const defaultY = Math.max(8, h - (offset + fabSize + haloPad));
		setPos({ x: defaultX, y: defaultY });
	}, [chatOffset, offset]);

	// Utility: compute default bottom-right position
	const computeDefaultPos = (): Pos => {
		const w = typeof window !== "undefined" ? window.innerWidth : 0;
		const h = typeof window !== "undefined" ? window.innerHeight : 0;
		return {
			x: Math.max(8, w - (offset + chatOffset + fabSize + haloPad)),
			y: Math.max(8, h - (offset + fabSize + haloPad)),
		};
	};

	if (!mounted) return null;

	// If dismissed, render nothing; the static page icon triggers show via event
	if (dismissed) return null;

	if (!pos) return null;

	// Snap to nearest corner when dragging stops
	const snapToNearestCorner = (x: number, y: number): Pos => {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const rightX = Math.max(8, w - (offset + chatOffset + fabSize + haloPad));
		const leftX = offset;
		const bottomY = Math.max(8, h - (offset + fabSize + haloPad));
		const topY = offset;
		const corners: Pos[] = [
			{ x: rightX, y: bottomY },
			{ x: leftX, y: bottomY },
			{ x: rightX, y: topY },
			{ x: leftX, y: topY },
		];
		let best = corners[0];
		let bestD = Number.POSITIVE_INFINITY;
		for (const c of corners) {
			const d = (c.x - x) * (c.x - x) + (c.y - y) * (c.y - y);
			if (d < bestD) {
				best = c;
				bestD = d;
			}
		}
		return best;
	};

	return (
		<>
			{/* Fixed, full-viewport container so dragging isn't affected by scroll */}
			<div className="pointer-events-none fixed inset-0 z-50">
				<Rnd
					bounds="parent"
					size={{ width: fabSize, height: fabSize }}
					position={{ x: pos.x, y: pos.y }}
					onDragStart={() => {
						dragMovedRef.current = false;
					}}
					onDrag={(_, data) => {
						// Mark as a real drag only if there is visible movement
						if (Math.abs(data.deltaX) > 3 || Math.abs(data.deltaY) > 3) {
							dragMovedRef.current = true;
						}
					}}
					onDragStop={(_, data) => {
						const snapped = snapToNearestCorner(data.x, data.y);
						const next = { x: snapped.x, y: snapped.y };
						setPos(next);
						try {
							window.localStorage.setItem(posKey, JSON.stringify(next));
						} catch {}
					}}
					enableResizing={false}
					className={[
						"pointer-events-auto", // re-enable pointer events for the FAB itself
						hiddenOnMobile ? "hidden md:block" : "",
					].join(" ")}
				>
					{/* Ping background */}
					<span
						className="-inset-2 absolute animate-ping rounded-full bg-primary/30"
						aria-hidden
					/>

					{/* Button */}
					<button
						className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary bg-background text-primary shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
						aria-label={label}
						title={label}
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							if (dragMovedRef.current) return;
							if (mode === "fullscreen") {
								// Trigger Supademo global handler if present, otherwise fallback to new tab
								const anyWin = window as unknown as {
									Supademo?: { open?: (id: string) => void };
								};
								if (anyWin?.Supademo?.open) {
									anyWin.Supademo.open(finalDemoId);
								} else {
									window.open(
										`https://app.supademo.com/embed/${finalDemoId}?embed_v=2&utm_source=embed`,
										"_blank",
										"noopener,noreferrer",
									);
								}
								return;
							}
							// Default: open in-app modal and suppress any global Supademo lightbox
							try {
								interface SupademoGlobal {
									open?: (id: string) => void;
								}
								const w = window as unknown as {
									Supademo?: SupademoGlobal;
									__SupademoBackup__?: SupademoGlobal;
								};
								if (w && typeof w.Supademo !== "undefined") {
									w.__SupademoBackup__ = w.Supademo;
									w.Supademo = { open: (_id: string) => undefined };
								}
							} catch {}
							setIsHelpOpen(true);
						}}
					>
						{/* Glow ring */}
						<span
							className="-inset-1 absolute rounded-full bg-primary/20 blur-sm"
							aria-hidden
						/>
						{/* Icon */}
						<span className="relative select-none font-bold text-lg">?</span>
					</button>

					{/* Dismiss control */}
					<button
						className="absolute top-[-0.5rem] right-[-0.5rem] h-5 w-5 rounded-full bg-primary text-background text-xs leading-none shadow ring-1 ring-primary/60 hover:scale-105"
						aria-label="Dismiss help"
						type="button"
						onClick={() => {
							try {
								window.localStorage.setItem(
									cacheKey,
									JSON.stringify({ ts: Date.now() }),
								);
							} catch {}
							setDismissed(true);
						}}
					>
						×
					</button>
				</Rnd>
			</div>
			{mode === "modal" && (
				<WalkThroughModal
					isOpen={isHelpOpen}
					onClose={() => {
						setIsHelpOpen(false);
						// Restore Supademo if we suppressed it
						try {
							interface SupademoGlobal {
								open?: (id: string) => void;
							}
							const w = window as unknown as {
								Supademo?: SupademoGlobal;
								__SupademoBackup__?: SupademoGlobal;
							};
							if (w && typeof w.__SupademoBackup__ !== "undefined") {
								w.Supademo = w.__SupademoBackup__;
								w.__SupademoBackup__ = undefined;
							}
						} catch {}
					}}
					videoUrl={`https://app.supademo.com/embed/${finalDemoId}?embed_v=2&utm_source=embed`}
					title="Welcome To Deal Scale"
					subtitle="Get help getting started with your lead generation platform."
				/>
			)}
		</>
	);
}
