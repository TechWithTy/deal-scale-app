"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import React, { type ComponentType, useEffect, useMemo, useState } from "react";
import {
	AlertCircle,
	Bot,
	CheckCircle2,
	Paintbrush,
	Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type {
	LaunchPhaseKey,
	LaunchStatus,
} from "@/hooks/useLaunchProgressMachine";
import { cn } from "@/lib/_utils";

const Lottie = dynamic(
	() => import("lottie-react").then((mod) => mod.default),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-32 w-32 items-center justify-center">
				<div className="h-16 w-16 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
			</div>
		),
	},
);

export type LaunchStepId = LaunchPhaseKey | "done";

export interface LaunchStep {
	id: LaunchStepId;
	label: string;
	description?: string;
}

const DEFAULT_STEPS: LaunchStep[] = [
	{
		id: "configuring",
		label: "Configuring workflows",
		description: "Syncing selections and preparing automation",
	},
	{
		id: "branding",
		label: "Branding dashboard",
		description: "Applying visuals, CRM integrations, and preferences",
	},
	{
		id: "training",
		label: "Training AI assistant",
		description: "Teaching lead cadences and intent routing",
	},
	{
		id: "done",
		label: "Workspace ready",
		description: "All systems green — redirecting you now",
	},
];

const STEP_ICONS: Record<
	LaunchStepId,
	ComponentType<{ className?: string }>
> = {
	configuring: Sparkles,
	branding: Paintbrush,
	training: Bot,
	done: CheckCircle2,
};

interface LaunchOverlayProps {
	open: boolean;
	status: LaunchStatus;
	onClose?: () => void;
	steps?: LaunchStep[];
	errorMessage?: string;
}

const getStepState = (status: LaunchStatus, steps: LaunchStep[]) => {
	if (status === "idle") {
		return {
			activeIndex: -1,
			isComplete: false,
			isError: false,
		};
	}

	if (status === "error") {
		return {
			activeIndex: steps.length - 1,
			isComplete: false,
			isError: true,
		};
	}

	if (status === "done") {
		return {
			activeIndex: steps.length - 1,
			isComplete: true,
			isError: false,
		};
	}

	const activeIndex = steps.findIndex((step) => step.id === status);

	return {
		activeIndex,
		isComplete: false,
		isError: false,
	};
};

const ProgressSteps = ({
	currentStatus,
	steps,
}: {
	currentStatus: LaunchStatus;
	steps: LaunchStep[];
}) => {
	const { activeIndex, isComplete, isError } = useMemo(
		() => getStepState(currentStatus, steps),
		[currentStatus, steps],
	);

	return (
		<ul className="flex flex-col gap-3">
			{steps.map((step, index) => {
				const Icon = STEP_ICONS[step.id] ?? Sparkles;
				const isActive = index === activeIndex && !isComplete && !isError;
				const isDone =
					index < activeIndex || (isComplete && index === steps.length - 1);
				const baseClass =
					"flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition";

				return (
					<li
						key={step.id}
						className={cn(baseClass, {
							"border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.45)]":
								isActive,
							"border-emerald-400/50 bg-emerald-500/10": isDone,
						})}
					>
						<span
							className={cn(
								"mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white",
								isActive && "bg-cyan-500/30 text-cyan-100",
								isDone && "bg-emerald-500/40 text-emerald-100",
							)}
						>
							<Icon className="h-4 w-4" />
						</span>
						<span className="space-y-1">
							<p className="text-sm font-medium text-white">{step.label}</p>
							{step.description ? (
								<p className="text-xs text-neutral-300">{step.description}</p>
							) : null}
						</span>
					</li>
				);
			})}
		</ul>
	);
};

const LaunchOverlay = ({
	open,
	status,
	onClose,
	steps = DEFAULT_STEPS,
	errorMessage = "Something went wrong while building your workspace. Please try again.",
}: LaunchOverlayProps) => {
	const [mounted, setMounted] = useState(false);
	const [animationData, setAnimationData] = useState<object | null>(null);
	const prefersReducedMotion = usePrefersReducedMotion();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open || prefersReducedMotion) {
			return;
		}

		let isActive = true;

		import("@/public/lottie/CampaignPing.json")
			.then((module) => {
				if (!isActive) return;
				const animation = module.default ?? module;
				setAnimationData(animation);
			})
			.catch((error) => {
				console.warn("[LaunchOverlay] Failed to load Lottie animation", error);
			});

		return () => {
			isActive = false;
		};
	}, [open, prefersReducedMotion]);

	useEffect(() => {
		if (!open) {
			setAnimationData(null);
		}
	}, [open]);

	const isError = status === "error";
	const isDone = status === "done";

	if (!mounted) {
		return null;
	}

	return createPortal(
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-md"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.25 }}
					role="dialog"
					aria-modal="true"
				>
					<div className="relative mx-4 w-full max-w-lg">
						<div className="absolute inset-0 rounded-[26px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-500 opacity-60 blur-lg" />
						<Card className="relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/90 p-8 text-white shadow-2xl">
							<div className="flex flex-col items-center gap-6">
								{prefersReducedMotion ? (
									<div className="flex h-32 w-32 items-center justify-center">
										<div className="h-16 w-16 animate-pulse rounded-full border-2 border-white/30" />
									</div>
								) : animationData ? (
									<Lottie
										animationData={animationData}
										className="h-48 w-48"
										loop={!isDone && !isError}
										autoplay
									/>
								) : (
									<div className="flex h-32 w-32 items-center justify-center">
										<div className="h-16 w-16 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
									</div>
								)}

								<div className="text-center">
									<h2 className="text-2xl font-semibold">
										{isError
											? "We hit a snag"
											: isDone
												? "Your AI Workspace is Ready 🚀"
												: "Creating your AI workspace…"}
									</h2>
									<p className="mt-2 text-sm text-neutral-300">
										{isError
											? errorMessage
											: "Hang tight while we wire up automations, apply your branding, and train your assistant."}
									</p>
								</div>

								<ProgressSteps currentStatus={status} steps={steps} />

								{isDone ? (
									<p className="text-sm text-emerald-300">
										Redirecting to your workspace…
									</p>
								) : null}

								{isError ? (
									<button
										type="button"
										onClick={onClose}
										className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
									>
										<AlertCircle className="h-4 w-4" />
										Close overlay
									</button>
								) : null}
							</div>
						</Card>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>,
		document.body,
	);
};

export default LaunchOverlay;
