"use client";

import type { FC } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleDollarSign } from "lucide-react";
import WheelContainer from "../../wheel-component/componnets/WheelContainer";
import WheelControls from "../../wheel-component/componnets/WheelControls";
import WheelCountdown from "../../wheel-component/componnets/WheelCountdown";
import WheelAutoSpin from "../../wheel-component/componnets/WheelAutoSpin";
import SimpleWheel, {
	type SimpleWheelHandle,
} from "../../wheel-component/componnets/SimpleWheel";
import type { Cadence, PersistenceHooks, Prize, SpinResult } from "../../types";

function formatCountdown(ms: number) {
	if (ms <= 0) return "0s";
	const s = Math.ceil(ms / 1000);
	const m = Math.floor(s / 60);
	const r = s % 60;
	return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export interface PrizeWheelProps {
	cadence: Cadence;
	prizes: Prize[];
	onWin: (payload: SpinResult) => void;
	userId: string;
	storageKeyBase?: string;
	disabled?: boolean;
	showCountdown?: boolean;
	autoSpin?: boolean;
	showResultModal?: boolean;
	showWheelPopup?: boolean;
	persistence?: Partial<PersistenceHooks>;
	theme?: {
		accentColor?: string;
		textColor?: string;
		size?: number;
		spinUpMs?: number;
		spinDownMs?: number;
	};
	ariaLabel?: string;
	allowAdminOverride?: boolean;
	className?: string;
}

export const PrizeWheelCore: FC<PrizeWheelProps> = ({
	cadence,
	prizes,
	onWin,
	userId,
	storageKeyBase = "prize-wheel",
	disabled = false,
	showCountdown = true,
	autoSpin = false,
	showResultModal = false,
	showWheelPopup = false,
	persistence,
	theme,
	ariaLabel = "Spin the prize wheel",
	allowAdminOverride = false,
	className,
}) => {
	const [lastSpinAt, setLastSpinAt] = useState<string | null>(null);
	const [now, setNow] = useState(() => Date.now());
	const [busy, setBusy] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalResult, setModalResult] = useState<SpinResult | null>(null);
	const storageKey = `${storageKeyBase}:${userId}:${cadence}`;
	const timerRef = useRef<number | null>(null);
	const wheelRef = useRef<SimpleWheelHandle | null>(null);
	const modalWheelRef = useRef<SimpleWheelHandle | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (persistence?.getLastSpinAt) {
				const ts = await persistence.getLastSpinAt(userId, cadence);
				if (!cancelled) setLastSpinAt(ts);
			} else if (typeof window !== "undefined") {
				const raw = window.localStorage.getItem(storageKey);
				if (raw) {
					try {
						const parsed = JSON.parse(raw) as SpinResult;
						setLastSpinAt(parsed.at);
					} catch {}
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [persistence, userId, cadence, storageKey]);

	useEffect(() => {
		const id = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, []);

	useEffect(() => {
		return () => {
			if (timerRef.current != null) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, []);

	const isLocked = useMemo(() => {
		if (!lastSpinAt) return false;
		const last = new Date(lastSpinAt).getTime();
		const next =
			cadence === "daily" ? last + 24 * 3600 * 1000 : last + 3600 * 1000;
		return Date.now() < next;
	}, [lastSpinAt, cadence]);

	const nextEligibleAt = useMemo(() => {
		if (!lastSpinAt) return 0;
		const last = new Date(lastSpinAt).getTime();
		return cadence === "daily" ? last + 24 * 3600 * 1000 : last + 3600 * 1000;
	}, [lastSpinAt, cadence]);

	const segmentPrizes = useMemo(
		() => prizes.flatMap((p) => Array(Math.max(1, p.weight ?? 1)).fill(p)),
		[prizes],
	);
	const segments = useMemo(
		() => segmentPrizes.map((p) => p.label),
		[segmentPrizes],
	);
	const segmentIcons = useMemo(
		() => segmentPrizes.map((p) => p.icon),
		[segmentPrizes],
	);
	// Use emoji icons from prize.icon, don't override with iconNodes unless prize has no icon
	const iconSize = Math.max(16, Math.floor((theme?.size ?? 200) * 0.12));
	const segmentIconNodes = useMemo(() => {
		// Generate stable keys based on prize id and occurrence count to avoid array index keys
		const counts = new Map<string, number>();
		return segmentPrizes.map((p) => {
			const c = counts.get(p.id) ?? 0;
			counts.set(p.id, c + 1);
			
			// If prize has an emoji icon, return null so SimpleWheel uses the icon string instead
			// (emoji renders better as SVG text than as a React node)
			if (p.icon) {
				return null;
			}
			
			// Fallback to generic icon only if no emoji icon
			return (
				<CircleDollarSign
					key={`${p.id}-${c}`}
					size={iconSize}
					strokeWidth={2}
				/>
			);
		});
	}, [segmentPrizes, iconSize]);
	const anyIcons = useMemo(
		() => segmentIconNodes.some(Boolean) || segmentIcons.some(Boolean),
		[segmentIconNodes, segmentIcons],
	);
	const segmentColors = useMemo(
		() =>
			segmentPrizes.map(
				(p, i) =>
					p.color ??
					(i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"),
			),
		[segmentPrizes],
	);

	const triggerSpin = useCallback(() => {
		if (disabled || isLocked || busy || segments.length === 0) return;
		setBusy(true);
		const total = 100 + 800;
		const id = window.setTimeout(() => setBusy(false), total + 1200);
		timerRef.current = id;
		if (showWheelPopup) {
			setModalOpen(true);
			window.setTimeout(() => {
				modalWheelRef.current?.spin();
			}, 50);
		} else {
			wheelRef.current?.spin();
		}
	}, [disabled, isLocked, busy, segments.length, showWheelPopup]);

	const handleFinished = useCallback(
		async (label: string) => {
			try {
				const found = prizes.find((p) => p.label === label) || prizes[0];
				const result: SpinResult = {
					prizeId: found.id,
					label: found.label,
					at: new Date().toISOString(),
				};
				setLastSpinAt(result.at);
				if (persistence?.setSpinResult) {
					await persistence.setSpinResult(userId, cadence, result);
				} else if (typeof window !== "undefined") {
					window.localStorage.setItem(storageKey, JSON.stringify(result));
				}
				if (showResultModal && !showWheelPopup) {
					setModalResult(result);
					setModalOpen(true);
				}
				if (showWheelPopup) {
					// Keep the popup open; show the result and let the user close it.
					setModalResult(result);
				}
				onWin(result);
			} finally {
				setBusy(false);
			}
		},
		[
			persistence,
			userId,
			cadence,
			prizes,
			storageKey,
			onWin,
			showResultModal,
			showWheelPopup,
		],
	);

	const countdown =
		showCountdown && isLocked ? formatCountdown(nextEligibleAt - now) : null;

	useEffect(() => {
		if (!busy) return;
		const total = 100 + 800;
		const id = window.setTimeout(() => setBusy(false), total + 1500);
		return () => window.clearTimeout(id);
	}, [busy]);

	const controlsDisabled = useMemo(
		() => disabled || isLocked || busy || segments.length === 0,
		[disabled, isLocked, busy, segments.length],
	);
	const disabledReason = useMemo(() => {
		if (disabled) return "disabled prop is true";
		if (isLocked) return "locked by cadence";
		if (busy) return "wheel busy";
		if (segments.length === 0) return "no segments (check prizes/weights)";
		return null;
	}, [disabled, isLocked, busy, segments.length]);

	return (
		<div className={`flex flex-col items-center gap-3 ${className || ""}`}>
			<WheelCountdown
				message={isLocked && countdown ? `Available in ${countdown}` : null}
			/>
			<WheelContainer ariaLabel={ariaLabel} dim={disabled || isLocked || busy}>
				<SimpleWheel
					ref={wheelRef}
					segments={segments}
					segColors={segmentColors}
					segmentIcons={segmentIcons}
					segmentIconNodes={segmentIconNodes}
					onFinished={handleFinished}
					buttonText={"SPIN"}
					size={theme?.size || 200}
					upDuration={theme?.spinUpMs ?? 200}
					downDuration={theme?.spinDownMs ?? 1100}
					iconSizePx={iconSize}
					textVisible={!anyIcons}
					hideList={anyIcons}
				/>
			</WheelContainer>
			<WheelControls
				onSpin={triggerSpin}
				onReset={
					allowAdminOverride
						? () => {
								setLastSpinAt(null);
								setBusy(false);
								if (typeof window !== "undefined")
									window.localStorage.removeItem(storageKey);
							}
						: undefined
				}
				disabled={controlsDisabled}
			/>
			{controlsDisabled && disabledReason ? (
				<p className="text-muted-foreground text-xs">
					Spin disabled: {disabledReason}
				</p>
			) : null}
			<WheelAutoSpin
				enabled={autoSpin}
				locked={isLocked}
				busy={busy}
				onReadyToSpin={triggerSpin}
			/>

			{(showWheelPopup || showResultModal) && modalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setModalOpen(false)}
						onKeyDown={(e) => e.key === "Enter" && setModalOpen(false)}
						role="button"
						tabIndex={0}
					/>
					<div className="relative z-10 rounded-lg border border-border bg-card p-4 shadow-xl">
						{showWheelPopup ? (
							<div className="flex flex-col items-center gap-3">
								<SimpleWheel
									ref={modalWheelRef}
									segments={segments}
									segColors={segmentColors}
									segmentIcons={segmentIcons}
									segmentIconNodes={segmentIconNodes}
									onFinished={handleFinished}
									primaryColor={theme?.accentColor}
									contrastColor={theme?.textColor}
									size={(theme?.size ?? 220) + 40}
									upDuration={theme?.spinUpMs ?? 200}
									downDuration={theme?.spinDownMs ?? 1100}
									iconSizePx={iconSize}
									textVisible={!anyIcons}
									hideList={anyIcons}
								/>
								{modalResult ? (
									<div className="mt-1 text-center text-sm">
										<span>You won: </span>
										<strong>{modalResult.label}</strong>
									</div>
								) : null}
								<div className="flex w-full justify-end">
									<button
										type="button"
										className="rounded border border-border bg-card px-3 py-1 text-card-foreground"
										onClick={() => setModalOpen(false)}
									>
										Close
									</button>
								</div>
							</div>
						) : (
							<div className="w-[340px]">
								<h3 className="mb-2 font-semibold text-lg">You won!</h3>
								<p className="mb-4 text-muted-foreground text-sm">
									{modalResult ? (
										<span>
											Prize: <strong>{modalResult.label}</strong>
											<br />
											Time: {new Date(modalResult.at).toLocaleString()}
										</span>
									) : (
										"Spin completed."
									)}
								</p>
								<div className="flex justify-end gap-2">
									<button
										type="button"
										className="rounded border border-border bg-card px-3 py-1 text-card-foreground"
										onClick={() => setModalOpen(false)}
									>
										Close
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
};

export default PrizeWheelCore;
