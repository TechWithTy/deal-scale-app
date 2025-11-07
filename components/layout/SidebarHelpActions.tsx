"use client";

import type React from "react";
import { useEffect, useId, useMemo, useState } from "react";

import { LifeBuoy, Radio } from "lucide-react";

import { cn } from "@/lib/_utils";
import { openFocusWidget } from "@/lib/ui/helpActions";
import { useCommandPalette } from "external/action-bar/components/providers/CommandPaletteProvider";

interface SidebarHelpActionsProps {
	isCollapsed?: boolean;
}

export default function SidebarHelpActions({
	isCollapsed = false,
}: SidebarHelpActionsProps): React.ReactElement {
	const { setOpen, setInitialQuery } = useCommandPalette();
	const descriptionId = useId();
	const [shortcut, setShortcut] = useState({
		display: "Ctrl+Shift+D",
		aria: "Control+Shift+D",
	});

	useEffect(() => {
		if (typeof navigator === "undefined") return;
		const isMac = /mac|iphone|ipad|ipod/i.test(navigator.platform);
		setShortcut(
			isMac
				? { display: "⌘⇧ D", aria: "Meta+Shift+D" }
				: { display: "Ctrl+Shift+D", aria: "Control+Shift+D" },
		);
	}, []);

	const actions = useMemo(
		() => [
			{
				key: "assist",
				label: "Assist",
				description: `Use ${shortcut.display.replace(" ", "")} to open the Assist command palette.`,
				icon: LifeBuoy,
				onSelect: () => {
					setInitialQuery("");
					setOpen(true);
				},
				supportsShortcut: true,
				shortcut,
			},
			{
				key: "focus",
				label: "Focus",
				description:
					"Open the Focus widget to control music mode or switch to Voice mode.",
				icon: Radio,
				onSelect: () => {
					openFocusWidget();
				},
				supportsShortcut: false,
			},
		],
		[setInitialQuery, setOpen, shortcut],
	);

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-2",
				isCollapsed ? "items-center" : "items-stretch",
			)}
		>
			{actions.map((action) => {
				const ActionIcon = action.icon;
				const shortcutBadge = action.supportsShortcut ? (
					<kbd
						aria-hidden
						className={cn(
							"rounded border border-border bg-muted px-1.5 py-0.5 font-semibold text-[10px] text-muted-foreground",
							isCollapsed ? "mt-1" : "ml-auto",
						)}
					>
						{action.shortcut?.display}
					</kbd>
				) : null;

				return (
					<button
						key={action.key}
						type="button"
						aria-label={action.label}
						aria-describedby={`${descriptionId}-${action.key}`}
						aria-keyshortcuts={action.shortcut?.aria}
						onClick={(event) => {
							event.stopPropagation();
							action.onSelect();
						}}
						className={cn(
							"sidebar-help-trigger flex w-full items-center rounded-md border border-border bg-card text-primary transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
							isCollapsed
								? "flex-col justify-center gap-1 px-2 py-2"
								: "justify-between gap-2 px-3 py-2",
						)}
					>
						<div
							className={cn(
								"flex w-full items-center",
								isCollapsed ? "flex-col gap-1" : "justify-between gap-2",
							)}
						>
							<div className="flex items-center gap-2">
								<ActionIcon className="h-4 w-4" aria-hidden />
								{!isCollapsed && (
									<span className="font-medium text-sm">{action.label}</span>
								)}
							</div>
							{shortcutBadge}
						</div>
						<span id={`${descriptionId}-${action.key}`} className="sr-only">
							{action.description}
						</span>
					</button>
				);
			})}
		</div>
	);
}
