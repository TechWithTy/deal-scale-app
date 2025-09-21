"use client";

import type { FC } from "react";

type Props = { message?: string | null };

const WheelCountdown: FC<Props> = ({ message }) => (
	<div aria-live="polite" className="text-muted-foreground text-sm">
		{message || ""}
	</div>
);

export default WheelCountdown;
