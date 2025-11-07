"use client";

import { useState } from "react";
import { formatCreditsDisplay, updateCredits } from "./creditUtils";
import type { Credits } from "./creditUtils";

export interface CreditsProps {
	credits: Credits;
	onChange: (field: "allotted" | "used" | "resetInDays", value: number) => void;
	title: string;
}

export function CreditsComponent({ credits, onChange, title }: CreditsProps) {
	return (
		<div className="mt-4 grid grid-cols-2 gap-3">
			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium">{title} Allotted</span>
				<input
					type="number"
					min={0}
					value={credits.allotted}
					onChange={(e) => onChange("allotted", Number(e.target.value))}
					className="rounded-md border bg-background px-2 py-1"
				/>
			</label>
			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium">{title} Used</span>
				<input
					type="number"
					min={0}
					value={credits.used}
					onChange={(e) => onChange("used", Number(e.target.value))}
					className="rounded-md border bg-background px-2 py-1"
				/>
			</label>
			<div className="col-span-2 mt-2 text-sm">
				<span className="font-medium">{title} Credits:</span>
				<span className="ml-2 text-muted-foreground">
					{formatCreditsDisplay(credits.used, credits.allotted)}
				</span>
			</div>
		</div>
	);
}
