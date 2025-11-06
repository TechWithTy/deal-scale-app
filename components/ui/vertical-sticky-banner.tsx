"use client";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/_utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
	useEffect,
	type SVGProps,
	useState,
	Children,
	isValidElement,
} from "react";
import type React from "react";

type BannerVariant = "error" | "success" | "feature" | "sale" | "default";

export const variantStyles = {
	error: {
		bg: "bg-destructive/10",
		border: "border-destructive/50",
		iconBg: "bg-destructive",
		iconColor: "text-destructive-foreground",
		text: "text-destructive",
		title: "text-destructive font-semibold",
	},
	success: {
		bg: "bg-green-500/10",
		border: "border-green-500/50",
		iconBg: "bg-green-500",
		iconColor: "text-white",
		text: "text-green-700 dark:text-green-400",
		title: "text-green-700 dark:text-green-400 font-semibold",
	},
	feature: {
		bg: "bg-primary/10",
		border: "border-primary/50",
		iconBg: "bg-primary",
		iconColor: "text-primary-foreground",
		text: "text-primary",
		title: "text-primary font-semibold",
	},
	sale: {
		bg: "bg-orange-500/10",
		border: "border-orange-500/50",
		iconBg: "bg-orange-500",
		iconColor: "text-white",
		text: "text-orange-700 dark:text-orange-400",
		title: "text-orange-700 dark:text-orange-400 font-semibold",
	},
	default: {
		bg: "bg-card",
		border: "border-primary/30",
		iconBg: "bg-primary",
		iconColor: "text-primary-foreground",
		text: "text-muted-foreground",
		title: "text-foreground font-semibold",
	},
};

export const VerticalStickyBanner = ({
	className,
	children,
	isSidebarMinimized = false,
	variant = "default",
	tooltipText,
	link,
	subtitleLink,
	cacheKey,
}: {
	className?: string;
	children: React.ReactNode;
	isSidebarMinimized?: boolean;
	variant?: BannerVariant;
	tooltipText?: string;
	link?: string;
	subtitleLink?: string;
	cacheKey?: string;
}) => {
	const storageKey = cacheKey ?? `vertical-sticky-banner-${variant}`;

	const [open, setOpen] = useState<boolean>(() => {
		if (typeof window === "undefined") return true;
		try {
			const stored = window.localStorage.getItem(storageKey);
			if (!stored) return true;
			return JSON.parse(stored) !== false;
		} catch {
			return true;
		}
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(storageKey, JSON.stringify(open));
		} catch {
			// Ignore localStorage errors
		}
	}, [open, storageKey]);

	const styles = variantStyles[variant];

	const getVariantIcon = () => {
		const iconSize = isSidebarMinimized ? "size-3" : "size-4";
		switch (variant) {
			case "error":
				return <ErrorIcon className={cn(iconSize, styles.iconColor)} />;
			case "success":
				return <SuccessIcon className={cn(iconSize, styles.iconColor)} />;
			case "feature":
				return <FeatureIcon className={cn(iconSize, styles.iconColor)} />;
			case "sale":
				return <SaleIcon className={cn(iconSize, styles.iconColor)} />;
			default:
				return <InfoIcon className={cn(iconSize, styles.iconColor)} />;
		}
	};

	return (
		<>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						className={cn(
							"sticky top-0 z-50 flex h-[100dvh] flex-col items-center justify-start self-start rounded-r-lg border-l py-3 shadow-lg",
							styles.bg,
							styles.border,
							className,
						)}
						style={{
							right: isSidebarMinimized ? "-32px" : "-56px",
							width: isSidebarMinimized ? 32 : 56,
						}}
						initial={{
							opacity: 0,
							x: 100,
						}}
						animate={{
							opacity: 1,
							x: 0,
						}}
						exit={{
							opacity: 0,
							x: 100,
						}}
						transition={{
							duration: 0.5,
							ease: "easeInOut",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<motion.button
							initial={{
								scale: 0,
							}}
							animate={{
								scale: 1,
							}}
							className="absolute top-1 right-1 z-10 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors hover:bg-background/50"
							onClick={(e) => {
								e.stopPropagation();
								setOpen(false);
							}}
							aria-label="Close banner"
						>
							<CloseIcon
								className="h-3 w-3 text-muted-foreground"
								aria-label="Close"
							>
								<title>Close</title>
							</CloseIcon>
						</motion.button>

						<div className="flex w-full flex-1 flex-col items-center gap-2 px-1 pt-8">
							{isSidebarMinimized ? (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											{link ? (
												<Link
													href={link}
													className={cn(
														"flex size-6 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110",
														styles.iconBg,
													)}
													onClick={(e) => e.stopPropagation()}
												>
													{getVariantIcon()}
												</Link>
											) : (
												<button
													type="button"
													className={cn(
														"flex size-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110",
														styles.iconBg,
													)}
													onClick={(e) => {
														e.stopPropagation();
													}}
												>
													{getVariantIcon()}
												</button>
											)}
										</TooltipTrigger>
										<TooltipContent side="right" sideOffset={8}>
											{tooltipText || "New Feature Available!"}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<>
									{link ? (
										<Link
											href={link}
											className={cn(
												"flex size-8 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110",
												styles.iconBg,
											)}
											onClick={(e) => e.stopPropagation()}
										>
											{getVariantIcon()}
										</Link>
									) : (
										<div
											className={cn(
												"flex size-8 flex-shrink-0 items-center justify-center rounded-full",
												styles.iconBg,
											)}
										>
											{getVariantIcon()}
										</div>
									)}
									<div className="flex w-full flex-col items-center gap-1 px-1">
										<div className="flex flex-col items-center justify-center text-center">
											{Children.map(children, (child, index) => {
												// If it's the last child (subtitle) and subtitleLink is provided, wrap it in a Link
												if (
													subtitleLink &&
													index === Children.count(children) - 1 &&
													isValidElement(child)
												) {
													return (
														<Link
															href={subtitleLink}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => {
																e.stopPropagation();
															}}
															className="cursor-pointer text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
														>
															{child}
														</Link>
													);
												}
												return child;
											})}
										</div>
									</div>
								</>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			{!open && (
				<motion.button
					initial={{
						opacity: 0,
					}}
					animate={{
						opacity: 1,
					}}
					transition={{
						duration: 0.5,
						ease: "easeInOut",
					}}
					style={{
						right: isSidebarMinimized ? "-24px" : "-32px",
						width: isSidebarMinimized ? 24 : 32,
					}}
					className={cn(
						"sticky top-20 z-50 flex h-16 items-center justify-center self-start rounded-r-lg border-l shadow-lg hover:bg-accent",
						styles.bg,
						styles.border,
					)}
					onClick={(e) => {
						e.stopPropagation();
						setOpen(true);
					}}
					aria-label="Open banner"
				>
					<svg
						className={cn(
							"rotate-90 text-muted-foreground",
							isSidebarMinimized ? "size-3" : "size-4",
						)}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-label="Information"
					>
						<title>Information</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</motion.button>
			)}
		</>
	);
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Close"
			{...props}
		>
			<title>Close</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M18 6l-12 12" />
			<path d="M6 6l12 12" />
		</svg>
	);
};

const InfoIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Information"
			{...props}
		>
			<title>Information</title>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</svg>
	);
};

const ErrorIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Error"
			{...props}
		>
			<title>Error</title>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 8v4" />
			<path d="M12 16h.01" />
		</svg>
	);
};

const SuccessIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Success"
			{...props}
		>
			<title>Success</title>
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22 4 12 14.01 9 11.01" />
		</svg>
	);
};

const FeatureIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Feature"
			{...props}
		>
			<title>Feature</title>
			<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	);
};

const SaleIcon = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Sale"
			{...props}
		>
			<title>Sale</title>
			<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
};

export type { BannerVariant };
