import NonCriticalStyles from "@/components/layout/NonCriticalStyles";
import Providers from "@/components/layout/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import React, { type ReactNode } from "react";
import "./globals.css";
import { auth } from "@/auth";
import Script from "next/script";

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
}): Promise<React.ReactElement> {
	const session = await auth();
	const isAuthenticated = Boolean(session);
	const AuthenticatedAppShell = isAuthenticated
		? (await import("@/components/layout/AuthenticatedAppShell")).default
		: null;
	void React;

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{isAuthenticated ? (
					<Script
						id="supademo-script"
						src="/api/supademo/script"
						strategy="lazyOnload"
					/>
				) : null}
			</head>
			<body className={inter.className} suppressHydrationWarning={true}>
				<NonCriticalStyles />
				<NextTopLoader showSpinner={false} />
				{isAuthenticated && AuthenticatedAppShell ? (
					<AuthenticatedAppShell session={session}>
						{children}
					</AuthenticatedAppShell>
				) : (
					<Providers session={session}>{children}</Providers>
				)}
				<div id="sidebar-portal" />
			</body>
		</html>
	);
}
