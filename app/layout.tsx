import Providers from "@/components/layout/providers";
import { CommandPaletteProvider, ActionBarRoot } from "@/external/action-bar";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { auth } from "@/auth";
import SessionSync from "@/components/auth/SessionSync";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Deal Scale | Real Estate Lead Generation",
	description:
		"Accelerate your real estate business with Deal Scale. Leverage proven strategies and powerful tools to attract, engage, and convert more qualified real estate leads into clients.",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	return (
		<html lang="en">
			<body className={`${inter.className}  `} suppressHydrationWarning={true}>
				<NextTopLoader showSpinner={false} />
				<CommandPaletteProvider>
					<NuqsAdapter>
						<Providers session={session}>
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
