"use client";
import { SessionProvider, type SessionProviderProps } from "next-auth/react";
import type React from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
export default function Providers({
	session,
	children,
}: {
	session: SessionProviderProps["session"];
	children: React.ReactNode;
}) {
	const enableClarity = process.env.NEXT_PUBLIC_ENABLE_CLARITY === "true";
	const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
	return (
		<>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<SessionProvider session={session}>{children}</SessionProvider>
				{/* Global toast container */}
				<Toaster />
				{/* Microsoft Clarity (gated by env) */}
				{enableClarity && CLARITY_ID ? (
					<Script id="ms-clarity" strategy="afterInteractive">{`
			          (function(c,l,a,r,i,t,y){
			            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
			            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
			            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
			          })(window, document, "clarity", "script", "${CLARITY_ID}");
			        `}</Script>
				) : null}
			</ThemeProvider>
		</>
	);
}
