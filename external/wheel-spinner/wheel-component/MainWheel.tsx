"use client";

import PrizeWheel from "../PrizeWheel";
import type { Prize } from "../types";

const prizes: Prize[] = [
	{ id: "p1", label: "1 Credit", color: "#EE4040", weight: 1 },
	{ id: "p5", label: "5 Credits", color: "#34A24F", weight: 5 },
	{ id: "p50", label: "50 Credits", color: "#3DA5E0", weight: 2 },
];

export default function MainWheel() {
	return (
		<div className="flex w-full items-center justify-center py-6">
			<PrizeWheel
				userId="demo-user"
				cadence="daily"
				prizes={prizes}
				onWin={(r) => console.log("WIN:", r)}
				allowAdminOverride
				autoSpin={false}
				showWheelPopup
			/>
		</div>
	);
}
