"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { applyBrandTokens, extractBrandColors } from "@/lib/utils/brandTokens";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/_utils";
import { captureDemoEvent } from "@/lib/analytics/demo";
import type { DemoConfig } from "@/types/user";

const Lottie = dynamic(
	() => import("lottie-react").then((mod) => mod.default),
	{
		ssr: false,
		loading: () => null,
	},
);

interface LoginRevealScreenProps {
	companyName?: string;
	logoUrl?: string;
	demoConfig?: DemoConfig;
	onContinue: () => void;
	autoRedirectDelay?: number; // milliseconds, 0 to disable
}

const DEMO_REVEAL_SEEN_KEY = "demoRevealSeen";

export function LoginRevealScreen({
	companyName = "Your Company",
	logoUrl,
	demoConfig,
	onContinue,
	autoRedirectDelay = 3000,
}: LoginRevealScreenProps) {
	const prefersReducedMotion = usePrefersReducedMotion();
	const [isVisible, setIsVisible] = useState(true);
	const [showButton, setShowButton] = useState(false);

	// Apply brand tokens on mount and fire analytics
	useEffect(() => {
		const colors = extractBrandColors(demoConfig);
		applyBrandTokens(colors);

		// Fire analytics event
		captureDemoEvent("demo_reveal_viewed", {
			company: companyName,
			persona: demoConfig?.clientType,
			hasLogo: Boolean(logoUrl),
		});

		return () => {
			// Optionally clear on unmount, or leave them for the dashboard
			// clearBrandTokens();
		};
	}, [demoConfig, companyName, logoUrl]);

	// Auto-redirect after delay
	useEffect(() => {
		if (autoRedirectDelay > 0) {
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(() => {
					onContinue();
				}, 400); // Wait for fade-out animation
			}, autoRedirectDelay);

			return () => clearTimeout(timer);
		}
	}, [autoRedirectDelay, onContinue]);

	// Show button after initial animations
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowButton(true);
		}, 2600);

		return () => clearTimeout(timer);
	}, []);

	const handleContinue = () => {
		setIsVisible(false);
		setTimeout(() => {
			onContinue();
		}, 400);
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.4 }}
					className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-gradient text-white overflow-hidden"
				>
					{/* Animated Gradient Glow */}
					{!prefersReducedMotion && (
						<motion.div
							className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"
							animate={{ scale: [1, 1.1, 1] }}
							transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
						/>
					)}

					{/* Optional Lottie Background Animation */}
					{!prefersReducedMotion && (
						<div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
							{/* Placeholder for Lottie - can be added when animation file is available */}
							{/* <Lottie
								animationData={aiGlowAnimation}
								loop
								className="w-full h-full"
							/> */}
						</div>
					)}

					<div className="relative z-10 flex flex-col items-center px-4 text-center">
						{/* Logo */}
						{logoUrl && (
							<motion.img
								src={logoUrl}
								alt={`${companyName} logo`}
								className="h-16 w-auto mb-6 drop-shadow-xl max-w-[200px] object-contain"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5, duration: 0.6 }}
							/>
						)}

						{/* Intro Text */}
						<motion.h1
							className="text-2xl sm:text-3xl font-semibold mb-8 max-w-2xl"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.1, duration: 0.6 }}
						>
							We've styled your workspace for{" "}
							<span className="text-brand-accent">{companyName}</span>
						</motion.h1>

						{/* Theme Preview Card */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 1.8, duration: 0.5 }}
							className="w-full max-w-sm"
						>
							<Card className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
								<div className="space-y-4">
									{/* Mock dashboard tiles */}
									<div className="h-6 w-3/4 bg-brand-primary/40 rounded-lg" />
									<div className="h-6 w-2/3 bg-brand-accent/30 rounded-lg" />
									<div className="h-10 w-full bg-brand-primary rounded-lg shadow-inner" />

									{/* AI Assistant Preview */}
									<div className="mt-4 flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-brand-accent/50 ring-2 ring-brand-accent/50 flex items-center justify-center">
											<span className="text-lg">🤖</span>
										</div>
										<p className="text-sm text-white/80 text-left">
											Your AI Assistant is ready to help you scale 📈
										</p>
									</div>
								</div>
							</Card>
						</motion.div>

						{/* Continue Button */}
						<AnimatePresence>
							{showButton && (
								<motion.div
									className="mt-10"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5 }}
								>
									<Button
										size="lg"
										className={cn(
											"px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-accent",
											"text-white rounded-xl shadow-lg hover:opacity-90",
											"transition-all duration-300",
											!prefersReducedMotion && "animate-pulse",
										)}
										onClick={handleContinue}
									>
										Enter Workspace →
									</Button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

/**
 * Hook to check if demo reveal has been seen (stored in localStorage)
 */
export function useDemoRevealSeen(): [boolean, () => void] {
	const [hasSeen, setHasSeen] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const seen = localStorage.getItem(DEMO_REVEAL_SEEN_KEY) === "true";
		setHasSeen(seen);
	}, []);

	const markAsSeen = () => {
		if (typeof window === "undefined") return;
		localStorage.setItem(DEMO_REVEAL_SEEN_KEY, "true");
		setHasSeen(true);
	};

	return [hasSeen, markAsSeen];
}

/**
 * Utility to check if user is a demo user based on session
 */
export function isDemoUser(
	session: { user?: { demoConfig?: DemoConfig } } | null,
): boolean {
	return Boolean(session?.user?.demoConfig);
}
