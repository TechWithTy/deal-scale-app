import type { Metadata } from "next";
import ThemeProvider from "@/components/layout/ThemeToggle/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// Helper function to get base URL
function getBaseUrl() {
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return (
		process.env.NEXT_PUBLIC_APP_URL ||
		`http://localhost:${process.env.PORT ?? 3000}`
	);
}

// Set metadata for auth pages
export const metadata: Metadata = {
	title: "Authentication",
	description: "Authentication forms built using the components.",
	metadataBase: new URL(getBaseUrl()),
	openGraph: {
		title: "Authentication",
		description: "Authentication forms built using the components.",
		url: "/auth",
		siteName: "LeadIgnite",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Authentication",
		description: "Authentication forms built using the components.",
	},
};

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="relative flex min-h-screen flex-col">
						<div className="flex-1">{children}</div>
					</div>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
