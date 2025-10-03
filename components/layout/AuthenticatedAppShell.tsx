import SessionSync from "@/components/auth/SessionSync";
import Providers from "@/components/layout/providers";
import { CommandPaletteProvider } from "external/action-bar";
import "@uploadthing/react/styles.css";
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
			<NuqsAdapter>
				<Providers session={session}>
					<SupademoClient />
					{children}
					<SessionSync />
				</Providers>
				<ActionBarRoot />
			</NuqsAdapter>
		</CommandPaletteProvider>
	);
}

export default AuthenticatedAppShell;
