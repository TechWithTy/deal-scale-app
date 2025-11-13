"use client";

import type React from "react";
import { useEffect, useId, useMemo, useState } from "react";

import type { LucideIcon } from "lucide-react";
import { LifeBuoy, Radio } from "lucide-react";

import { cn } from "@/lib/_utils";
import { openFocusWidget } from "@/lib/ui/helpActions";
import { useCommandPalette } from "external/action-bar/components/providers/CommandPaletteProvider";

type ShortcutKey =
	| { type: "icon"; name: "command" | "shift"; label: string }
	| { type: "text"; label: string };

interface ShortcutMeta {
	aria: string;
	description: string;
	keys: ShortcutKey[];
}

interface SidebarAction {
	key: "assist" | "focus";
	label: string;
	description: string;
	icon: LucideIcon;
	onSelect: (options?: { autoStartVoice?: boolean }) => void;
	supportsShortcut: boolean;
	shortcut?: ShortcutMeta;
}

function ShortcutGlyph({
	name,
}: { name: "command" | "shift" }): React.ReactElement {
	if (name === "command") {
		return (
			<svg
				aria-hidden
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="stroke-current"
			>
				<path
					d="M9 9v6h6V9m-6 0H7a3 3 0 1 1 2-5.196m0 5.196h6m0 0h2a3 3 0 1 0-2-5.196M9 15H7a3 3 0 1 0 2 5.196M15 9h2a3 3 0 1 1-2 5.196M9 15h6m0 0h2a3 3 0 1 1-2 5.196M9 15H7a3 3 0 1 1 2 5.196"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		);
	}

	return (
		<svg
			aria-hidden
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="stroke-current"
		>
			<path
				d="M12 4l7 7h-4v9h-6v-9H5l7-7z"
				fill="currentColor"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
}

function ShortcutBadge({
	isCollapsed,
	keys,
}: {
	isCollapsed: boolean;
	keys: ShortcutKey[];
}): React.ReactElement {
	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-muted-foreground",
				isCollapsed ? "mt-1" : "ml-auto",
			)}
		>
			{keys.map((key, index) => (
				<span
					key={`${key.label}-${index.toString()}`}
					className="inline-flex items-center gap-1"
				>
					<kbd className="flex h-4 min-w-[1.25rem] items-center justify-center rounded-sm bg-card px-1 text-[10px] font-semibold leading-none shadow-sm">
						{key.type === "icon" ? (
							<ShortcutGlyph name={key.name} />
						) : (
							key.label
						)}
					</kbd>
					{index < keys.length - 1 ? (
						<span className="-mx-0.5 text-[9px] font-semibold leading-none text-muted-foreground">
							+
						</span>
					) : null}
				</span>
			))}
		</span>
	);
}

interface SidebarHelpActionsProps {
	isCollapsed?: boolean;
}

export default function SidebarHelpActions({
	isCollapsed = false,
}: SidebarHelpActionsProps): React.ReactElement {
	const { setOpen, setInitialQuery } = useCommandPalette();
	const descriptionId = useId();
	const [assistShortcut, setAssistShortcut] = useState<ShortcutMeta>({
		aria: "Meta+K Meta+Shift+D",
		description: "⌘+K (⌘+⇧+D backup)",
		keys: [
			{ type: "icon", name: "command", label: "⌘" },
			{ type: "text", label: "K" },
		],
	});
	const [focusShortcut, setFocusShortcut] = useState<ShortcutMeta>({
		aria: "Meta+Shift+V",
		description: "⌘+⇧+V",
		keys: [
			{ type: "icon", name: "command", label: "⌘" },
			{ type: "icon", name: "shift", label: "⇧" },
			{ type: "text", label: "V" },
		],
	});

	useEffect(() => {
		if (typeof navigator === "undefined") return;
		const platform =
			// @ts-expect-error Support Chromium UA data
			navigator.userAgentData?.platform ?? navigator.platform ?? "";
		const isApple = /mac|iphone|ipad|ipod/i.test(platform);
		setAssistShortcut(
			isApple
				? {
						aria: "Meta+K Meta+Shift+D",
						description: "⌘+K (⌘+⇧+D backup)",
						keys: [
							{ type: "icon", name: "command", label: "⌘" },
							{ type: "text", label: "K" },
						],
					}
				: {
						aria: "Control+K Control+Shift+D",
						description: "Ctrl+K (Ctrl+Shift+D backup)",
						keys: [
							{ type: "text", label: "Ctrl" },
							{ type: "text", label: "K" },
						],
					},
		);
		setFocusShortcut(
			isApple
				? {
						aria: "Meta+Shift+V",
						description: "⌘+⇧+V",
						keys: [
							{ type: "icon", name: "command", label: "⌘" },
							{ type: "icon", name: "shift", label: "⇧" },
							{ type: "text", label: "V" },
						],
					}
				: {
						aria: "Control+Shift+V",
						description: "Ctrl+Shift+V",
						keys: [
							{ type: "text", label: "Ctrl" },
							{ type: "text", label: "Shift" },
							{ type: "text", label: "V" },
						],
					},
		);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleKeydown = (event: KeyboardEvent) => {
			const platform =
				// @ts-expect-error Support Chromium UA data
				navigator.userAgentData?.platform ?? navigator.platform ?? "";
			const isApple = /mac|iphone|ipad|ipod/i.test(platform);
			const modPressed = isApple ? event.metaKey : event.ctrlKey;
			if (
				modPressed &&
				event.shiftKey &&
				(event.key === "v" || event.key === "V")
			) {
				event.preventDefault();
				openFocusWidget({ autoStartVoice: true });
			}
		};

		window.addEventListener("keydown", handleKeydown);
		return () => {
			window.removeEventListener("keydown", handleKeydown);
		};
	}, []);

	const actions = useMemo(
		(): SidebarAction[] => [
			{
				key: "assist",
				label: "Assist",
				description: `Use ${assistShortcut.description} to open the Assist command palette.`,
				icon: LifeBuoy,
				onSelect: () => {
					setInitialQuery("");
					setOpen(true);
				},
				supportsShortcut: true,
				shortcut: assistShortcut,
			},
			{
				key: "focus",
				label: "Focus",
				description:
					"Open the Focus widget to control music mode or switch to Voice mode.",
				icon: Radio,
				onSelect: ({ autoStartVoice } = {}) => {
					openFocusWidget({ autoStartVoice });
				},
				supportsShortcut: false,
				shortcut: focusShortcut,
			},
		],
		[assistShortcut, focusShortcut, setInitialQuery, setOpen],
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
				const shortcutBadge =
					action.supportsShortcut && action.shortcut ? (
						<ShortcutBadge
							isCollapsed={isCollapsed}
							keys={action.shortcut.keys}
						/>
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
							const autoStartVoice =
								action.key === "focus" && event.detail === 0;
							action.onSelect({ autoStartVoice });
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
