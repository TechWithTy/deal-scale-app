"use client";
import PostHogProviderBridge from "@/components/analytics/PostHogProviderBridge";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider, type SessionProviderProps } from "next-auth/react";
import Script from "next/script";
import React, { type ReactNode } from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
export default function Providers({
	session,
	children,
}: {
	session: SessionProviderProps["session"];
	children: ReactNode;
}) {
	const enableClarity = process.env.NEXT_PUBLIC_ENABLE_CLARITY === "true";
	const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
	return (
		<>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<SessionProvider session={session}>
					<PostHogProviderBridge>{children}</PostHogProviderBridge>
				</SessionProvider>
				{/* Global toast container */}
				<Toaster />
				{/* Microsoft Clarity (gated by env) */}
				{enableClarity && CLARITY_ID ? (
					<Script id="ms-clarity" strategy="lazyOnload">{`
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
