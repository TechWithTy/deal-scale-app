"use client";

import "@uploadthing/react/styles.css";
import SessionSync from "@/components/auth/SessionSync";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import Providers from "@/components/layout/providers";
import { QuickStartDebug } from "@/components/quickstart/QuickStartDebug";
import CommandPaletteAppCommands from "@/components/layout/CommandPaletteAppCommands";
import FloatingHelpSupademo from "@/components/ui/FloatingHelpSupademo";
import FloatingMusicWidget from "@/components/ui/FloatingMusicWidget";
import { CommandPaletteProvider } from "external/action-bar";
import type { Session } from "next-auth";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React, { type ReactNode } from "react";

const SupademoClient = dynamic(
	() => import("@/components/integrations/SupademoClient"),
	{
		ssr: false,
		loading: () => null,
	},
);

const ActionBarRoot = dynamic(
	() => import("external/action-bar").then((mod) => mod.ActionBarRoot),
	{
		ssr: false,
		loading: () => null,
	},
);

interface AuthenticatedAppShellProps {
	session: Session | null;
	children: ReactNode;
}

export function AuthenticatedAppShell({
	session,
	children,
}: AuthenticatedAppShellProps): React.ReactElement {
	void React;
	return (
		<CommandPaletteProvider>
			<CommandPaletteAppCommands />
			<NuqsAdapter>
				<Providers session={session}>
					<OfflineBanner />
					<SupademoClient />
					<FloatingMusicWidget />
					{children}
					<SessionSync />
					<QuickStartDebug />
					{/* Hidden by default; shown when Quick Start help icon dispatches show event */}
					<FloatingHelpSupademo defaultVisible={false} />
				</Providers>
				<ActionBarRoot />
			</NuqsAdapter>
		</CommandPaletteProvider>
	);
}

export default AuthenticatedAppShell;
