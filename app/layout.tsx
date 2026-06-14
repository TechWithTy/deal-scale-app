import AuthenticatedAppShell from "@/components/layout/AuthenticatedAppShell";
import NonCriticalStyles from "@/components/layout/NonCriticalStyles";
import Providers from "@/components/layout/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React, { type ReactNode } from "react";
import "./globals.css";
import { auth } from "@/auth";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

const organizationJsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "Deal Scale",
	url: "https://dealscale.app",
	logo: "https://dealscale.app/logo/Deal_Scale_Logo.png",
	description:
		"AI-powered real estate lead generation and CRM platform for investors, wholesalers, agents, and lenders.",
	contactPoint: {
		"@type": "ContactPoint",
		contactType: "Customer Support",
		email: "support@dealscale.app",
		availableLanguage: ["English"],
	},
	sameAs: [
		"https://twitter.com/dealscale",
		"https://linkedin.com/company/dealscale",
		"https://facebook.com/dealscale",
	],
	address: {
		"@type": "PostalAddress",
		addressCountry: "US",
	},
	offers: {
		"@type": "AggregateOffer",
		priceCurrency: "USD",
		availability: "https://schema.org/InStock",
	},
} as const;

const developmentChunkRecoveryScript = `
(() => {
	const host = window.location.hostname;
	const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";
	if (!isLocalhost) return;

	const cleanupKey = "deal-scale.dev-cache-cleanup.v1";
	const reloadKey = "deal-scale.chunk-reload-at";
	const chunkFailurePattern = /ChunkLoadError|Loading chunk|_next\\/static\\/chunks|app\\/layout\\.js/i;

	const patchKey = "__dealScaleSafeRemoveChild";
	if (!Node.prototype[patchKey]) {
		const removeChild = Node.prototype.removeChild;
		const insertBefore = Node.prototype.insertBefore;
		Object.defineProperty(Node.prototype, patchKey, { value: true });
		Node.prototype.removeChild = function safeRemoveChild(child) {
			if (child && child.parentNode !== this) return child;
			return removeChild.call(this, child);
		};
		Node.prototype.insertBefore = function safeInsertBefore(child, before) {
			if (before && before.parentNode !== this) {
				return insertBefore.call(this, child, null);
			}
			return insertBefore.call(this, child, before);
		};
	}

	const reloadOnce = () => {
		const now = Date.now();
		const lastReload = Number(sessionStorage.getItem(reloadKey) || "0");
		if (now - lastReload < 15000) return;
		sessionStorage.setItem(reloadKey, String(now));
		window.location.reload();
	};

	const getMessage = (value) => {
		if (!value) return "";
		if (typeof value === "string") return value;
		if (value.message) return String(value.message);
		if (value.reason) return getMessage(value.reason);
		return String(value);
	};

	const recoverFromChunkFailure = (value) => {
		if (chunkFailurePattern.test(getMessage(value))) reloadOnce();
	};

	window.addEventListener("error", (event) => {
		recoverFromChunkFailure(event.error || event.message || event.filename);
	});

	window.addEventListener("unhandledrejection", (event) => {
		recoverFromChunkFailure(event.reason);
	});

	const clearDevCaches = async () => {
		if (sessionStorage.getItem(cleanupKey) === "1") return;
		sessionStorage.setItem(cleanupKey, "1");

		let cleared = false;
		if ("serviceWorker" in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations();
			cleared = registrations.length > 0 || cleared;
			await Promise.all(registrations.map((registration) => registration.unregister()));
		}

		if ("caches" in window) {
			const keys = await caches.keys();
			cleared = keys.length > 0 || cleared;
			await Promise.all(keys.map((key) => caches.delete(key)));
		}

		if (cleared) reloadOnce();
	};

	clearDevCaches().catch(() => {});
})();
`;

export const metadata: Metadata = {
	title: "Deal Scale | Real Estate Lead Generation & AI-Powered CRM",
	description:
		"Accelerate your real estate business with Deal Scale. Leverage AI-powered automation, proven strategies, and powerful tools to attract, engage, and convert qualified leads.",
	keywords: [
		"real estate leads",
		"lead generation",
		"real estate CRM",
		"AI automation",
		"property investment",
		"wholesale real estate",
		"real estate marketing",
	],
	authors: [{ name: "Deal Scale Team" }],
	creator: "Deal Scale",
	publisher: "Deal Scale",
	metadataBase: new URL("https://dealscale.app"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://dealscale.app",
		title: "Deal Scale | AI-Powered Real Estate Lead Generation",
		description:
			"Transform your real estate business with AI-powered lead generation, automated campaigns, and intelligent CRM tools designed for investors, wholesalers, and agents.",
		siteName: "Deal Scale",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Deal Scale - Real Estate Lead Generation Platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Deal Scale | AI-Powered Real Estate Lead Generation",
		description:
			"Transform your real estate business with AI-powered lead generation and automated campaigns.",
		images: ["/twitter-image.jpg"],
		creator: "@dealscale",
		site: "@dealscale",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		// TODO: Add verification codes when available
		google: "google-site-verification-code",
		yandex: "yandex-verification-code",
	},
};

export default async function RootLayout({
	children,
}: {
	children: ReactNode;
}): Promise<React.ReactElement> {
	const session = await auth();
	const isAuthenticated = Boolean(session);
	const shouldLoadSupademo =
		isAuthenticated && process.env.NODE_ENV === "production";
	void React;

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* PWA Manifest */}
				<link rel="manifest" href="/manifest.json" />
				<meta name="theme-color" content="#ea580c" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Deal Scale" />
				<link rel="apple-touch-icon" href="/logo/Deal_Scale_Logo.png" />

				{/* DNS Prefetch for external services */}
				<link rel="dns-prefetch" href="https://picsum.photos" />
				<link rel="dns-prefetch" href="https://loremflickr.com" />
				<link rel="dns-prefetch" href="https://placehold.co" />
				<link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
				<link rel="dns-prefetch" href="https://maps.googleapis.com" />
				<link rel="dns-prefetch" href="https://www.realtor.com" />
				<link rel="dns-prefetch" href="https://ap.rdcpix.com" />
				{/* Preconnect for critical resources */}
				<link rel="preconnect" href="https://picsum.photos" />
				<link rel="preconnect" href="https://maps.googleapis.com" />
				{/* JSON-LD Structured Data for SEO */}
				<Script id="organization-jsonld" type="application/ld+json">
					{JSON.stringify(organizationJsonLd)}
				</Script>
				{process.env.NODE_ENV === "development" ? (
					<Script id="dev-chunk-recovery" strategy="beforeInteractive">
						{developmentChunkRecoveryScript}
					</Script>
				) : null}
				{shouldLoadSupademo ? (
					<Script
						id="supademo-script"
						src="/api/supademo/script"
						strategy="lazyOnload"
					/>
				) : null}
			</head>
			<body className={inter.className} suppressHydrationWarning={true}>
				<NonCriticalStyles />
				{isAuthenticated ? (
					<AuthenticatedAppShell session={session}>
						{children}
					</AuthenticatedAppShell>
				) : (
					<Providers session={session}>{children}</Providers>
				)}
				<div id="sidebar-portal" />
				<div id="floating-ui-root" />
			</body>
		</html>
	);
}
