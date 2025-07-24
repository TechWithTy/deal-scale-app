import Providers from "@/components/layout/providers";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Lead Ignite | Real Estate Lead Generation",
	description:
		"Accelerate your real estate business with Lead Ignite. Leverage proven strategies and powerful tools to attract, engage, and convert more qualified real estate leads into clients.",
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
				<Providers session={session}>{children}</Providers>
			</body>
		</html>
	);
}
