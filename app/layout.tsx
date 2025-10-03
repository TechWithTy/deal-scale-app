import Providers from "@/components/layout/providers";
import { CommandPaletteProvider } from "external/action-bar";
import "@uploadthing/react/styles.css";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import "./globals.css";
import { auth } from "@/auth";
import SessionSync from "@/components/auth/SessionSync";
import NonCriticalStyles from "@/components/layout/NonCriticalStyles";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["latin"] });

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

export const metadata: Metadata = {
	title: "Deal Scale | Real Estate Lead Generation",
	description:
		"Accelerate your real estate business with Deal Scale. Leverage proven strategies and powerful tools to attract, engage, and convert more qualified real estate leads into clients.",
};

export default async function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await auth();
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Supademo SDK */}
				<Script src="/api/supademo/script" strategy="lazyOnload" />
			</head>
			<body className={inter.className} suppressHydrationWarning={true}>
				<NonCriticalStyles />
				{/* Move to Providers Next Command Nuqs */}
				<NextTopLoader showSpinner={false} />
				<CommandPaletteProvider>
					<NuqsAdapter>
						<Providers session={session}>
							<SupademoClient />
							{children}
							<SessionSync />
						</Providers>
						{/* Global command palette dialog (Cmd/Ctrl+K) */}
						<ActionBarRoot />
					</NuqsAdapter>
				</CommandPaletteProvider>
				<div id="sidebar-portal" />
			</body>
		</html>
	);
}
