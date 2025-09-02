"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
	CommandItem,
	CommandPaletteContextValue,
} from "../../utils/types";
import { baseGlobalCommands, pageScopedCommands } from "../../utils/commands";

export const CommandPaletteContext =
	createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
	const ctx = useContext(CommandPaletteContext);
	if (!ctx)
		throw new Error(
			"useCommandPalette must be used within CommandPaletteProvider",
		);
	return ctx;
}

type ProviderProps = {
	children: ReactNode;
	aiSuggestEndpoint?: string;
	pomFlowUrl?: string;
	keyboard?: boolean;
	variant?: "dialog" | "floating";
	initialQuery?: string;
	openOnSelect?: boolean;
	selectContainer?: string;
};

export function CommandPaletteProvider({
	children,
	aiSuggestEndpoint: aiEndpointProp,
	pomFlowUrl,
	keyboard: keyboardProp = true,
	variant: variantProp = "dialog",
	initialQuery: initialQueryProp = "",
}: ProviderProps) {
	const router = useRouter();
	const pathname = usePathname();
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
	const [openOnSelect, setOpenOnSelect] = useState<boolean>(false);
	const [selectContainer, setSelectContainer] = useState<string | undefined>(
		undefined,
	);
	const [openedBySelection, setOpenedBySelection] = useState<boolean>(false);
	const [externalUrlAttachments, setExternalUrlAttachments] = useState<
		string[]
	>([]);

	const base = useMemo(() => baseGlobalCommands(router), [router]);
	const scoped = useMemo(
		() => pageScopedCommands(pathname ?? "", router),
		[pathname, router],
	);

	const commands = useMemo(() => {
		// Merge base + scoped + any externally registered dynamic commands.
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
			// '/' opens palette globally and does not seed '/' into the input
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

	useEffect(() => {
		if (!isOpen && openedBySelection) setOpenedBySelection(false);
	}, [isOpen, openedBySelection]);

	const value = useMemo(
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
			pathname: pathname ?? "/",
			navigate: (path: string) => router.push(path),
			externalUrlAttachments,
			setExternalUrlAttachments,
		}),
		[
			isOpen,
			commands,
			registerDynamicCommands,
			initialQuery,
			variant,
			aiSuggestEndpoint,
			pomFlowUrl,
			keyboard,
			pathname,
			router,
			externalUrlAttachments,
		],
	);

	// Expose a minimal global controller for script/extension toggling
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
			setExternalUrls: (urls: string[]) =>
				setExternalUrlAttachments(urls ?? []),
		} as const;
		// attach once
		(window as any).DealActionBar = {
			...(window as any).DealActionBar,
			...api,
		};
	}, [registerDynamicCommands]);

	return (
		<CommandPaletteContext.Provider value={value}>
			{children}
		</CommandPaletteContext.Provider>
	);
}
