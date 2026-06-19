"use client";

import "@uploadthing/react/styles.css";
import SessionSync from "@/components/auth/SessionSync";
import CommandPaletteAppCommands from "@/components/layout/CommandPaletteAppCommands";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import Providers from "@/components/layout/providers";
import { QuickStartDebug } from "@/components/quickstart/QuickStartDebug";
import { AppTourProvider } from "@/components/tour/AppTourProvider";
import FloatingHelpSupademo from "@/components/ui/FloatingHelpSupademo";
import FloatingMusicWidget from "@/components/ui/FloatingMusicWidget";
import { CommandPaletteProvider } from "external/action-bar";
import type { Session } from "next-auth";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React, { type ReactNode } from "react";

const CommandPaletteProviderRoot =
	CommandPaletteProvider as unknown as React.ComponentType<{
		children?: ReactNode;
	}>;
const ProvidersRoot = Providers as unknown as React.ComponentType<{
	session: Session | null;
	children?: ReactNode;
}>;
const AppTourProviderRoot = AppTourProvider as unknown as React.ComponentType<{
	children?: ReactNode;
}>;
const NuqsAdapterRoot = NuqsAdapter as unknown as React.ComponentType<{
	children?: ReactNode;
}>;

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
	const shouldLoadSupademo = process.env.NODE_ENV === "production";
	void React;
	return (
		<CommandPaletteProviderRoot>
			<CommandPaletteAppCommands />
			<NuqsAdapterRoot>
				<ProvidersRoot session={session}>
					<AppTourProviderRoot>
						<OfflineBanner />
						{shouldLoadSupademo ? <SupademoClient /> : null}
						<FloatingMusicWidget />
						{children}
						<SessionSync />
						<QuickStartDebug />
						{/* Hidden by default; shown when Quick Start help icon dispatches show event */}
						{shouldLoadSupademo ? (
							<FloatingHelpSupademo defaultVisible={false} />
						) : null}
					</AppTourProviderRoot>
				</ProvidersRoot>
				<ActionBarRoot />
			</NuqsAdapterRoot>
		</CommandPaletteProviderRoot>
	);
}

export default AuthenticatedAppShell;
