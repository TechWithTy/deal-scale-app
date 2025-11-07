"use client";

import React, { FC, useMemo, useCallback, ReactNode } from "react";

import { cn } from "@/lib/utils/index";
import { Pointer } from "@/components/ui/pointer";
import { Button } from "@/components/ui/button";

import type { QuickStartCTAButton } from "@/lib/config/quickstart/ctas";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";

const ctaButtonSchema = z.object({
	label: z.string().min(1).max(50),
	ariaLabel: z.string().optional(),
	emphasis: z.enum(["solid", "outline", "ghost"]).default("solid"),
	description: z.string().min(1).max(100).optional(),
	badge: z.string().max(24).optional(),
});

type PersonaCTADisplayMode = "primary" | "secondary" | "both";

interface PersonaCTAProps {
	readonly primary: QuickStartCTAButton;
	readonly secondary?: QuickStartCTAButton;
	readonly microcopy?: string;
	readonly orientation?: "vertical" | "horizontal";
	readonly displayMode?: PersonaCTADisplayMode;
	readonly onPrimaryClick?: () => void;
	readonly onSecondaryClick?: () => void;
	readonly className?: string;
}

const buttonVariantForEmphasis = (
	emphasis: QuickStartCTAButton["emphasis"],
): "default" | "secondary" | "ghost" => {
	if (emphasis === "outline") {
		return "secondary";
	}

	if (emphasis === "ghost") {
		return "ghost";
	}

	return "default";
};

const PersonaCTA: FC<PersonaCTAProps> = ({
	primary,
	secondary,
	microcopy,
	displayMode = "primary",
	onPrimaryClick,
	onSecondaryClick,
	className,
	orientation = "vertical",
}) => {
	const shouldRenderPrimary = displayMode !== "secondary";
	const shouldRenderSecondary =
		displayMode !== "primary" && secondary !== undefined;
	const isHorizontal = orientation === "horizontal";
	const stackClasses = isHorizontal
		? "flex-col md:flex-row md:items-center md:justify-center"
		: "flex-col";
	const contentAlignment = isHorizontal
		? "items-start text-left md:items-center md:text-center"
		: "items-center text-center";
	const secondaryCopy = useMemo(() => secondary, [secondary]);

	const renderMicrocopy = useCallback((copy?: string): ReactNode[] | null => {
		if (!copy) {
			return null;
		}
		const elements: ReactNode[] = [];
		let lastIndex = 0;
		const linkRegex = /<link\s+href="([^"]+)">(.*?)<\/link>/gi;
		let match: RegExpExecArray | null;
		while ((match = linkRegex.exec(copy)) !== null) {
			const [fullMatch, href, text] = match;
			if (match.index > lastIndex) {
				elements.push(copy.slice(lastIndex, match.index));
			}
			elements.push(
				<span
					key={`cta-link-${match.index}`}
					className="relative inline-flex items-center"
				>
					<a
						href={href}
						className="relative inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary no-underline transition hover:bg-primary/15"
					>
						{text}
					</a>
					<Pointer
						className="text-primary"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 0.9, scale: 1 }}
						exit={{ opacity: 0, scale: 0 }}
						transition={{ type: "spring", stiffness: 160, damping: 20 }}
					/>
				</span>,
			);
			lastIndex = match.index + fullMatch.length;
		}
		if (lastIndex < copy.length) {
			elements.push(copy.slice(lastIndex));
		}
		return elements;
	}, []);

	const microcopyContent = useMemo(
		() => renderMicrocopy(microcopy),
		[microcopy, renderMicrocopy],
	);

	return (
		<div className={cn("flex flex-col items-center gap-6", className)}>
			<div
				className={cn(
					"flex w-full max-w-3xl items-stretch justify-center gap-4",
					stackClasses,
				)}
			>
				{shouldRenderPrimary && (
					<div className="relative flex-1 min-w-[240px]">
						<Button
							variant={buttonVariantForEmphasis(primary.emphasis)}
							onClick={onPrimaryClick}
							aria-label={primary.ariaLabel ?? primary.label}
							className={cn(
								"group relative flex h-full w-full flex-col justify-center gap-1 overflow-hidden rounded-3xl border-none px-6 py-5 text-primary-foreground shadow-[0_28px_60px_-20px_rgba(16,185,129,0.55)] transition",
								"bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400",
								isHorizontal ? "sm:px-9 sm:py-6" : "",
								shouldRenderSecondary ? "ring-2 ring-emerald-200" : "",
								contentAlignment,
							)}
						>
							{primary.badge ? (
								<span className="inline-flex items-center justify-center rounded-full bg-white/20 px-3 py-[4px] text-[10px] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_6px_20px_rgba(255,255,255,0.45)]">
									{primary.badge}
								</span>
							) : null}
							<span className="text-lg font-semibold md:text-xl">
								{primary.label}
							</span>
							{primary.description ? (
								<span className="text-sm text-emerald-50/90">
									{primary.description}
								</span>
							) : null}
							<span className="absolute inset-0 -z-10 opacity-0 transition group-hover:opacity-100">
								<span className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
							</span>
						</Button>
					</div>
				)}
				{shouldRenderSecondary && secondaryCopy && (
					<div className="relative flex-1 min-w-[240px]">
						<Button
							variant={buttonVariantForEmphasis(secondaryCopy.emphasis)}
							onClick={onSecondaryClick}
							aria-label={secondaryCopy.ariaLabel ?? secondaryCopy.label}
							className={cn(
								"relative flex h-full w-full flex-col justify-center gap-1 rounded-3xl border border-primary/25 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-5 text-primary shadow-[0_12px_30px_-16px_rgba(37,99,235,0.3)] transition hover:border-primary/35",
								isHorizontal ? "sm:px-8 sm:py-5" : "",
								"backdrop-blur-md",
								contentAlignment,
							)}
						>
							{secondaryCopy.badge ? (
								<span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-3 py-[4px] text-[10px] font-semibold uppercase tracking-[0.25em] text-primary shadow-[0_4px_12px_rgba(31,141,255,0.3)]">
									{secondaryCopy.badge}
								</span>
							) : null}
							<span className="text-base font-semibold md:text-lg text-primary/90">
								{secondaryCopy.label}
							</span>
							{secondaryCopy.description ? (
								<span className="text-sm text-primary/75">
									{secondaryCopy.description}
								</span>
							) : null}
						</Button>
						<Pointer
							className="text-primary/90"
							transition={{
								type: "spring",
								stiffness: 120,
								damping: 14,
							}}
						/>
					</div>
				)}
			</div>
			{microcopyContent ? (
				<AnimatePresence mode="wait">
					<motion.p
						key={microcopy}
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.2 }}
						className="max-w-xl text-balance text-center text-sm text-muted-foreground"
					>
						{microcopyContent}
					</motion.p>
				</AnimatePresence>
			) : null}
		</div>
	);
};

export default PersonaCTA;
