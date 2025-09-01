"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type {
	CommandItem,
	CommandPaletteContextValue,
} from "../../utils/types";
import { CommandPaletteContext } from "./CommandPaletteProvider";

type ProviderProps = {
	children: ReactNode;
	aiSuggestEndpoint?: string;
	pomFlowUrl?: string;
	keyboard?: boolean;
	variant?: "dialog" | "floating";
	initialQuery?: string;
	// Auto-open the palette when text is selected within a container
	openOnSelect?: boolean;
	// CSS selector for the container within which selection triggers auto-open
	selectContainer?: string;
};

export function StandaloneCommandPaletteProvider({
	children,
	aiSuggestEndpoint: aiEndpointProp,
	pomFlowUrl,
	keyboard: keyboardProp = true,
	variant: variantProp = "dialog",
	initialQuery: initialQueryProp = "",
	openOnSelect: openOnSelectProp = false,
	selectContainer: selectContainerProp,
}: ProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [dynamicCommands, setDynamicCommands] = useState<CommandItem[]>([]);
	const [initialQuery, setInitialQuery] = useState(initialQueryProp ?? "");
	const [variant, setVariant] = useState<"dialog" | "floating">(
		variantProp ?? "dialog",
	);
	const [aiSuggestEndpoint, setAiSuggestEndpoint] = useState(
		aiEndpointProp ?? "/api/ai/command-suggest",
	);
	const [keyboard, setKeyboard] = useState<boolean>(keyboardProp);
	const [openOnSelect, setOpenOnSelect] = useState<boolean>(!!openOnSelectProp);
	const [selectContainer, setSelectContainer] = useState<string | undefined>(
		selectContainerProp,
	);
	const [openedBySelection, setOpenedBySelection] = useState<boolean>(false);

	const pathname =
		typeof window !== "undefined" ? window.location.pathname : "/";

	// In standalone mode, default to no base/scoped commands; consumers can register via window.DealActionBar.register
	const base: CommandItem[] = [];
	const scoped: CommandItem[] = [];

	const commands = useMemo(() => {
		return [...base, ...scoped, ...dynamicCommands];
	}, [base, scoped, dynamicCommands]);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			if (!keyboard) return;
			const isMac = navigator.platform.toUpperCase().includes("MAC");
			const mod = isMac ? e.metaKey : e.ctrlKey;
			if (mod && (e.key === "k" || e.key === "K")) {
				e.preventDefault();
				setIsOpen((v) => !v);
			}
			if (!mod && e.key === "/") {
				e.preventDefault();
				setInitialQuery("");
				setIsOpen(true);
			}
		},
		[keyboard],
	);

	useEffect(() => {
		window.addEventListener("keydown", onKeydown);
		return () => window.removeEventListener("keydown", onKeydown);
	}, [onKeydown]);

	const registerDynamicCommands = useCallback((items: CommandItem[]) => {
		setDynamicCommands(items);
	}, []);

	// Auto-open on text selection inside the specified container
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!openOnSelect) return;
		const rootEl: HTMLElement | null = selectContainer
			? (document.querySelector(selectContainer) as HTMLElement | null)
			: document.body;
		if (!rootEl) return;

		const nodeToEl = (n: Node | null): HTMLElement | null => {
			if (!n) return null;
			return n instanceof HTMLElement ? n : ((n as any).parentElement ?? null);
		};

		const tryOpenFromSelection = () => {
			const sel = window.getSelection();
			if (!sel || sel.isCollapsed) return;
			const text = sel.toString().trim();
			if (!text) return;
			const a = nodeToEl(sel.anchorNode);
			const f = nodeToEl(sel.focusNode);
			if ((a && !rootEl.contains(a)) || (f && !rootEl.contains(f))) return;
			setInitialQuery(text);
			setIsOpen(true);
			setOpenedBySelection(true);
		};

		const onMouseUp = () => {
			// Wait a tick for selection to finalize
			setTimeout(tryOpenFromSelection, 0);
		};
		const onKeyUp = () => tryOpenFromSelection();

		const maybeCloseIfCleared = () => {
			if (!openedBySelection) return;
			const sel = window.getSelection();
			const text = sel?.toString().trim() ?? "";
			const a = nodeToEl(sel?.anchorNode ?? null);
			const f = nodeToEl(sel?.focusNode ?? null);
			const inside = a && rootEl.contains(a) && f && rootEl.contains(f);
			if (!sel || sel.isCollapsed || !text || !inside) {
				setIsOpen(false);
				setOpenedBySelection(false);
			}
		};

		document.addEventListener("mouseup", onMouseUp);
		document.addEventListener("keyup", onKeyUp);
		document.addEventListener("selectionchange", maybeCloseIfCleared);
		return () => {
			document.removeEventListener("mouseup", onMouseUp);
			document.removeEventListener("keyup", onKeyUp);
			document.removeEventListener("selectionchange", maybeCloseIfCleared);
		};
	}, [openOnSelect, selectContainer, openedBySelection]);

	// If user manually closes the dialog, stop tracking selection-open state
	useEffect(() => {
		if (!isOpen && openedBySelection) setOpenedBySelection(false);
	}, [isOpen, openedBySelection]);

	const value: CommandPaletteContextValue = useMemo(
		() => ({
			isOpen,
			setOpen: setIsOpen,
			commands,
			setCommands: setDynamicCommands,
			registerDynamicCommands,
			initialQuery,
			setInitialQuery,
			variant,
			setVariant,
			aiSuggestEndpoint,
			pomFlowUrl,
			keyboard,
			pathname,
			navigate: (path: string) => {
				try {
					window.location.assign(path);
				} catch {
					window.location.href = path;
				}
			},
		}),
		[
			isOpen,
			commands,
			initialQuery,
			variant,
			aiSuggestEndpoint,
			pomFlowUrl,
			keyboard,
			pathname,
		],
	);

	// Expose a minimal global controller
	useEffect(() => {
		if (typeof window === "undefined") return;
		const api = {
			open: () => setIsOpen(true),
			close: () => setIsOpen(false),
			toggle: () => setIsOpen((v) => !v),
			register: (items: CommandItem[]) => registerDynamicCommands(items),
			setVariant: (v: "dialog" | "floating") => setVariant(v),
			setInitialQuery: (q: string) => setInitialQuery(q),
			setEndpoint: (ep: string) =>
				setAiSuggestEndpoint(ep || "/api/ai/command-suggest"),
			setKeyboard: (k: boolean) => setKeyboard(!!k),
			setOpenOnSelect: (enabled: boolean) => setOpenOnSelect(!!enabled),
			setSelectContainer: (selector?: string) =>
				setSelectContainer(selector || undefined),
		} as const;
		window.DealActionBar = { ...window.DealActionBar, ...api } as NonNullable<
			Window["DealActionBar"]
		>;
	}, [registerDynamicCommands]);

	return (
		<CommandPaletteContext.Provider value={value}>
			{children}
		</CommandPaletteContext.Provider>
	);
}
