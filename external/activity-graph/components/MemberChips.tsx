"use client";

import React from "react";

type MemberChipsProps = {
	members: string[];
	selected: string[];
	onToggle: (name: string) => void;
	colorByKey?: (name: string, idx: number) => string;
};

export default function MemberChips({
	members,
	selected,
	onToggle,
	colorByKey,
}: MemberChipsProps) {
	return (
		<div
			className="flex gap-2 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			role="group"
			aria-label="Filter by team member"
		>
			{members.map((name, idx) => {
				const active = selected.includes(name);
				const color = colorByKey?.(name, idx);
				return (
					<button
						key={name}
						type="button"
						onClick={() => onToggle(name)}
						className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors ${
							active
								? "border-primary bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground hover:bg-accent"
						}`}
						aria-pressed={active}
					>
						<span
							className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium"
							style={{ background: color, color: "hsl(var(--background))" }}
							aria-hidden
						>
							{name.slice(0, 1).toUpperCase()}
						</span>
						{name}
					</button>
				);
			})}
		</div>
	);
}
