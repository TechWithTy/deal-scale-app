"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";

export default function ThemeProvider({
	children,
	...props
}: ThemeProviderProps) {
	// Sanitize legacy key that may contain whitespace values from a previous bug
	useEffect(() => {
		try {
			const legacy = window.localStorage.getItem("theme");
			if (legacy && /\s/.test(legacy)) {
				window.localStorage.removeItem("theme");
			}
		} catch {
			// ignore storage errors
		}
	}, []);

	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			storageKey="ds-theme"
			{...props}
		>
			{children}
		</NextThemesProvider>
	);
}
