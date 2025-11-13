"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
	LoginRevealScreen,
	useDemoRevealSeen,
	isDemoUser,
} from "./LoginRevealScreen";
import { resolveDemoLogoUrl } from "@/lib/demo/normalizeDemoPayload";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";

interface DemoRevealWrapperProps {
	children: React.ReactNode;
}

/**
 * Client component wrapper that conditionally shows the demo reveal screen
 * before rendering the dashboard content for demo users.
 */
export function DemoRevealWrapper({ children }: DemoRevealWrapperProps) {
	const { data: session, status } = useSession();
	const [hasSeen, markAsSeen] = useDemoRevealSeen();
	const [showReveal, setShowReveal] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const userProfile = useUserProfileStore((state) => state.userProfile);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isMounted || status !== "authenticated") {
			return;
		}

		const demo = isDemoUser(session);
		if (demo && !hasSeen) {
			setShowReveal(true);
		} else {
			setShowReveal(false);
		}
	}, [isMounted, status, session, hasSeen]);

	const handleContinue = () => {
		markAsSeen();
		setShowReveal(false);
	};

	if (!isMounted || status !== "authenticated") {
		return <>{children}</>;
	}

	const demoConfig = session?.user?.demoConfig;
	const companyName =
		demoConfig?.companyName ??
		userProfile?.companyInfo?.companyName ??
		"Your Company";
	const logoUrl = resolveDemoLogoUrl({
		demoConfig,
		fallback: userProfile?.companyInfo?.companyLogo,
	});

	if (showReveal && demoConfig) {
		return (
			<>
				<LoginRevealScreen
					companyName={companyName}
					logoUrl={logoUrl}
					demoConfig={demoConfig}
					onContinue={handleContinue}
					autoRedirectDelay={3000}
				/>
				{/* Render children but keep them visually hidden until reveal completes */}
				<div className={showReveal ? "hidden" : ""}>{children}</div>
			</>
		);
	}

	return <>{children}</>;
}
