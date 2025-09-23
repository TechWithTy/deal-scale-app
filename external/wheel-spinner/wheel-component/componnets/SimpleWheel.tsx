"use client";

import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	type ReactNode,
} from "react";

type Props = {
	segments: string[];
	segColors?: string[];
	segmentIcons?: (string | undefined)[];
	segmentIconNodes?: (ReactNode | undefined)[]; // optional SVG/React icons (e.g., Lucide)
	iconSizePx?: number; // optional size hint for centering icon nodes
	onFinished: (label: string) => void;
	primaryColor?: string;
	contrastColor?: string;
	buttonText?: string;
	size?: number;
	upDuration?: number;
	downDuration?: number;
	fontFamily?: string;
	hideList?: boolean;
	textVisible?: boolean; // render label text on slices
};

export type SimpleWheelHandle = { spin: () => void };

const SimpleWheel = forwardRef<SimpleWheelHandle, Props>(function SimpleWheel(
	{
		segments,
		segColors,
		segmentIcons,
		segmentIconNodes,
		iconSizePx,
		onFinished,
		buttonText = "SPIN",
		size = 200,
		upDuration = 150,
		downDuration = 500,
		hideList = false,
		textVisible = true,
	}: Props,
	ref,
) {
	const spinning = useRef(false);
	const wheelAngle = useRef(0);
	const pickedIndexRef = useRef<number | null>(null);
	const wheelEl = useRef<HTMLDivElement | null>(null);

	const colors = useRef<string[]>(
		segColors && segColors.length === segments.length
			? segColors
			: segments.map((_s, i) => (i % 2 === 0 ? "#6d28d9" : "#8b5cf6")),
	);

	const applyRotation = useCallback((deg: number, durationMs: number) => {
		const el = wheelEl.current;
		if (!el) return;
		el.style.transition = `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
		el.style.transform = `rotate(${deg}deg)`;
	}, []);

	const segmentKeys = useMemo(() => {
		const counts = new Map<string, number>();
		return segments.map((label) => {
			const keyLabel = label ?? "segment";
			const c = counts.get(keyLabel) ?? 0;
			counts.set(keyLabel, c + 1);
			return `${keyLabel}-${c}`;
		});
	}, [segments]);

	const handleSpin = useCallback(() => {
		if (spinning.current || segments.length === 0) return;
		spinning.current = true;
		const total = Math.max(1, segments.length);
		const slice = 360 / total;

		const pick = Math.floor(Math.random() * total);
		pickedIndexRef.current = pick;
		const targetCenter = pick * slice + slice / 2;
		// Rotate so that targetCenter ends at top (0deg pointer). Add extra spins for flair.
		const spins = 5; // full rotations
		const target = spins * 360 + (360 - targetCenter);
		const duration = upDuration + downDuration;
		wheelAngle.current = target;
		applyRotation(target, duration);
		window.setTimeout(() => {
			const label = segments[pick];
			onFinished(label);
			spinning.current = false;
		}, duration);
	}, [segments, onFinished, upDuration, downDuration, applyRotation]);

	useImperativeHandle(ref, () => ({ spin: handleSpin }), [handleSpin]);

	// Build simple SVG wheel
	const r = size / 2;
	const cx = r;
	const cy = r;
	const total = Math.max(1, segments.length);
	const slice = 360 / total;

	function polarToCartesian(
		centerX: number,
		centerY: number,
		radius: number,
		angleInDegrees: number,
	) {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	}

	function describeArc(
		x: number,
		y: number,
		radius: number,
		startAngle: number,
		endAngle: number,
	) {
		const start = polarToCartesian(x, y, radius, endAngle);
		const end = polarToCartesian(x, y, radius, startAngle);
		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
		const d = [
			"M",
			x,
			y,
			"L",
			start.x,
			start.y,
			"A",
			radius,
			radius,
			0,
			largeArcFlag,
			0,
			end.x,
			end.y,
			"Z",
		].join(" ");
		return d;
	}

	// Compute label/icon anchor points
	function labelPosition(angleDeg: number, radiusRatio = 0.56) {
		const pt = polarToCartesian(cx, cy, r * radiusRatio, angleDeg);
		return pt;
	}

	// Estimate-fit label within available arc length. Uses average glyph width heuristic.
	function fitLabelToSlice(text: string, fontPx: number, radiusRatio = 0.56) {
		if (!text) return "";
		const arcLength = 2 * Math.PI * (r * radiusRatio) * (slice / 360); // px
		const padding = Math.max(6, r * 0.04); // px left+right
		const available = Math.max(0, arcLength - padding);
		// Average glyph width heuristic: ~0.58em of font size
		const avgChar = fontPx * 0.58;
		const maxChars = Math.max(1, Math.floor(available / avgChar));
		if (text.length <= maxChars) return text;
		if (maxChars <= 1) return "…";
		return `${text.slice(0, Math.max(1, maxChars - 1))}…`;
	}

	return (
		<div style={{ width: size, textAlign: "center", fontSize: 12 }}>
			{!hideList ? (
				<div className="mb-2">
					{segments.slice(0, 8).map((s, i) => (
						<span
							key={segmentKeys[i]}
							className="inline-block px-1 text-xs opacity-80"
						>
							{s}
						</span>
					))}
					{segments.length > 8 ? <span className="text-xs"> …</span> : null}
				</div>
			) : null}

			<div className="relative mx-auto" style={{ width: size, height: size }}>
				{/* Pointer */}
				<div
					className="-translate-x-1/2 -top-4 absolute left-1/2"
					style={{ zIndex: 2 }}
					aria-hidden
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 18 18"
						aria-labelledby="wheel-pointer-title"
					>
						<title id="wheel-pointer-title">Wheel Pointer</title>
						<path d="M9 0 L18 18 L0 18 Z" fill="#ef4444" />
					</svg>
				</div>

				{/* Wheel */}
				<div
					ref={wheelEl}
					className="overflow-hidden rounded-full"
					style={{ width: size, height: size }}
				>
					<svg
						width={size}
						height={size}
						viewBox={`0 0 ${size} ${size}`}
						aria-labelledby={"wheel-title"}
					>
						<title id="wheel-title">Prize Wheel</title>
						{Array.from({ length: total }).map((_, i) => {
							const start = i * slice;
							const end = start + slice;
							const d = describeArc(cx, cy, r, start, end);
							const fill =
								colors.current[i % colors.current.length] ?? colors.current[0];
							return (
								<path
									key={`slice-${segmentKeys[i]}`}
									d={d}
									fill={fill}
									stroke="#111827"
									strokeWidth={1}
								/>
							);
						})}
						{segments.map((label, i) => {
							const mid = i * slice + slice / 2;
							const { x, y } = labelPosition(mid);
							const node = segmentIconNodes?.[i];
							const icon = segmentIcons?.[i];
							const labelFont = Math.max(9, r * 0.1);
							const showText = textVisible && !node && !icon;
							const fitted = showText ? fitLabelToSlice(label, labelFont) : "";
							return (
								<g key={`lbl-${segmentKeys[i]}`}>
									{node ? (
										// Center the icon node by offsetting half of its size. Default to 24px if not provided.
										<g
											transform={`translate(${x - (iconSizePx ?? 24) / 2}, ${y - (iconSizePx ?? 24) / 2})`}
										>
											{node}
										</g>
									) : icon ? (
										<text
											x={x}
											y={y - 4}
											textAnchor="middle"
											dominantBaseline="central"
											fontSize={Math.max(10, r * 0.12)}
										>
											{icon}
										</text>
									) : null}
									{showText && fitted ? (
										<text
											x={x}
											y={y + 7}
											textAnchor="middle"
											dominantBaseline="central"
											fontSize={labelFont}
											fill="#111"
											style={{ paintOrder: "stroke" }}
										>
											{fitted}
										</text>
									) : null}
								</g>
							);
						})}
						{/* Center circle */}
						<circle
							cx={cx}
							cy={cy}
							r={Math.max(18, r * 0.18)}
							fill="#111827"
							stroke="#1f2937"
							strokeWidth={2}
						/>
					</svg>
				</div>

				{/* Center button (transparent overlay, keep a11y) */}
				<button
					type="button"
					className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-16 w-16 rounded-full bg-transparent text-transparent focus:outline-none"
					onClick={handleSpin}
					aria-label={buttonText}
					disabled={spinning.current || segments.length === 0}
				>
					<span className="sr-only">{buttonText}</span>
				</button>
				{/* Visible label over center (no rect background) */}
				<div
					className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 font-semibold text-[10px] text-white tracking-wide"
					aria-hidden
				>
					{buttonText}
				</div>
			</div>
		</div>
	);
});

export default SimpleWheel;
