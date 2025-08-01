"use client";
import { SessionProvider, type SessionProviderProps } from "next-auth/react";
import type React from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
export default function Providers({
	session,
	children,
}: {
	session: SessionProviderProps["session"];
	children: React.ReactNode;
}) {
	return (
		<>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<SessionProvider session={session}>{children}</SessionProvider>
			</ThemeProvider>
		</>
	);
}
