"use client";

import type { FC, MouseEventHandler } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	onSpin: MouseEventHandler<HTMLButtonElement>;
	onReset?: MouseEventHandler<HTMLButtonElement>;
	disabled?: boolean;
};

const WheelControls: FC<Props> = ({ onSpin, onReset, disabled }) => (
	<div className="flex items-center gap-2">
		<Button
			type="button"
			variant="ghost"
			className="border-0 shadow-none"
			onClick={onSpin}
			disabled={!!disabled}
		>
			Spin Now
		</Button>
		{onReset ? (
			<Button type="button" variant="secondary" onClick={onReset}>
				Reset
			</Button>
		) : null}
	</div>
);

export default WheelControls;
