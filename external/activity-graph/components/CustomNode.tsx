"use client";

import type { ChartConfigLocal, NodePayload } from "../types";

type CustomNodeProps = {
	cx?: number;
	cy?: number;
	dataKey: string;
	config: ChartConfigLocal;
	payload?: NodePayload;
	onHover?: (data: NodePayload | null) => void;
};

export default function CustomNode({
	cx,
	cy,
	dataKey,
	config,
	payload,
	onHover,
}: CustomNodeProps) {
	const nodeConfig = config[dataKey];
	if (!cx || !cy) return null;
	const color = nodeConfig?.color ?? "hsl(var(--primary))";

	return (
		<circle
			cx={cx}
			cy={cy}
			r={5}
			fill={color}
			stroke="hsl(var(--background))"
			strokeWidth={2}
			onMouseEnter={() => onHover?.(payload ?? null)}
			onMouseLeave={() => onHover?.(null)}
			className="hover:r-7 cursor-pointer transition-all"
		/>
	);
}
