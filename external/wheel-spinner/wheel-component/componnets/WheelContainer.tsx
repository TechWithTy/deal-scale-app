"use client";

import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
	ariaLabel?: string;
	dim?: boolean;
};

export default function WheelContainer({ children, ariaLabel, dim }: Props) {
	return (
		<div
			aria-label={ariaLabel}
			style={{ position: "relative", opacity: dim ? 0.85 : 1 }}
		>
			{dim ? (
				<div style={{ position: "absolute", inset: 0, zIndex: 2 }} />
			) : null}
			{children}
		</div>
	);
}
