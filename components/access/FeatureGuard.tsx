"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FeatureQuotaKey } from "@/constants/features";
import type {
	SubscriptionTier,
	TierInput,
} from "@/constants/subscription/tiers";
import {
	type FeatureGuardMode,
	useFeatureAccessGuard,
} from "@/hooks/useFeatureAccessGuard";
import { cn } from "@/lib/_utils";
import { useUserStore } from "@/lib/stores/userStore";
import type { PermissionAction, PermissionResource } from "@/types/user";
import type { MouseEvent, ReactNode } from "react";

export interface FeatureGuardProps {
	featureKey: string;
	children: ReactNode;
	fallback?: ReactNode;
	modeOverride?: FeatureGuardMode;
	overlayContent?:
		| ReactNode
		| ((info: {
				requiredTier: SubscriptionTier;
				userTier: SubscriptionTier;
		  }) => ReactNode);
	wrapperClassName?: string;
	fallbackMode?: FeatureGuardMode;
	fallbackTier?: TierInput;
	permissionOverride?: {
		resource: PermissionResource;
		action: PermissionAction;
	};
	quotaOverride?: FeatureQuotaKey;
	quotaAmount?: number;
	showPopover?: boolean; // New prop to control popover visibility
	popoverDelay?: number; // New prop for popover delay
	orientation?: "vertical" | "horizontal" | "auto"; // New prop for overlay orientation
	iconOnly?: boolean; // New prop for icon-only mode
	onBlockedClick?: (reason: "tier" | "permission" | "quota") => void; // New prop for blocked click handler
}

export function FeatureGuard({
	featureKey,
	children,
	fallback = null,
	modeOverride,
	overlayContent,
	wrapperClassName,
	fallbackMode,
	fallbackTier,
	permissionOverride,
	quotaOverride,
	quotaAmount = 1,
	showPopover = true,
	popoverDelay = 300,
	orientation = "auto",
	iconOnly = false,
	onBlockedClick,
}: FeatureGuardProps) {
	const guard = useFeatureAccessGuard(featureKey, {
		fallbackMode,
		fallbackTier,
	});
	const mode = modeOverride ?? guard.mode;
	const hasPermission = useUserStore((state) => state.hasPermission);
	const hasQuota = useUserStore((state) => state.hasQuota);

	const permissionRequirement =
		permissionOverride ?? guard.permissionRequirement;
	const permissionAllowed = permissionRequirement
		? hasPermission(
				permissionRequirement.resource,
				permissionRequirement.action,
			)
		: true;
	const quotaKey = quotaOverride ?? guard.quotaKey;
	const quotaAllowed = quotaKey ? hasQuota(quotaKey, quotaAmount) : true;

	const finalAllowed = guard.allowed && permissionAllowed && quotaAllowed;
	const denialReason = !guard.allowed
		? "tier"
		: !permissionAllowed
			? "permission"
			: !quotaAllowed
				? "quota"
				: null;
	const blockedPrimaryMessage =
		denialReason === "tier"
			? `Upgrade to ${guard.requiredTier}`
			: denialReason === "permission"
				? "Permission required"
				: denialReason === "quota"
					? "Quota exceeded"
					: "Feature unavailable";
	const blockedSecondaryMessage =
		denialReason === "tier"
			? `Current plan: ${guard.userTier}`
			: denialReason === "permission"
				? "Contact your administrator"
				: denialReason === "quota"
					? "Usage limit reached"
					: "This item is currently unavailable";

	// Handle blocked click actions
	const handleBlockedClick = (event?: MouseEvent<HTMLButtonElement>) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (finalAllowed) return;

		// Mock API call to send result to admin for permission requests
		const sendToAdmin = async (featureKey: string, reason: string) => {
			try {
				// In a real app, this would be an API call
				console.log(
					`Admin notification: User requested ${featureKey} access. Reason: ${reason}`,
				);
				// Mock successful API call
				return { success: true, message: "Request sent to admin" };
			} catch (error) {
				console.error("Failed to send admin notification:", error);
				return { success: false, message: "Failed to send request" };
			}
		};

		switch (denialReason) {
			case "tier":
				// Open pricing page in new tab
				window.open("https://dealscale.io/pricing", "_blank");
				break;
			case "quota":
				// Open products page in new tab
				window.open("https://dealscale.io/products/id", "_blank");
				break;
			case "permission":
				// Send to admin and show popover message
				sendToAdmin(featureKey, "Permission request");
				// The popover will show the contact admin message
				break;
		}

		// Call the callback with the reason
		if (denialReason && onBlockedClick) {
			onBlockedClick(denialReason);
		}
	};

	if (finalAllowed) {
		return <>{children}</>;
	}

	const isNavigationItem = Boolean(
		wrapperClassName?.includes("nav-item") ||
			wrapperClassName?.includes("nav ") ||
			wrapperClassName?.includes("sidebar"),
	);
	const isNavMinimized =
		isNavigationItem &&
		Boolean(wrapperClassName?.includes("nav-item--minimized"));
	const isNavExpanded = isNavigationItem && !isNavMinimized;
	const isNavMobile =
		isNavigationItem && Boolean(wrapperClassName?.includes("nav-item--mobile"));
	const allowPopover = showPopover && !isNavMobile;
	const shouldShowBadge = isNavExpanded && !isNavMobile;
	const computeIsSmallScreen = () =>
		typeof window !== "undefined" && window.innerWidth < 640;

	switch (mode) {
		case "hide":
			return <>{fallback}</>;
		case "none":
			return <>{children}</>;
		case "disable": {
			if (isNavigationItem) {
				if (isNavMinimized) {
					return (
						<div
							className={cn("relative", wrapperClassName)}
							aria-disabled="true"
							data-feature-guard="nav-disabled-minimized"
							data-feature-denial={denialReason ?? undefined}
						>
							<div className="pointer-events-none select-none opacity-60">
								{children}
							</div>
							<div
								className="pointer-events-auto absolute inset-0 flex items-center justify-center"
								onPointerDown={(event) => event.stopPropagation()}
								onClick={(event) => event.stopPropagation()}
								onKeyDown={(event) => event.stopPropagation()}
							>
								{allowPopover ? (
									<TooltipProvider>
										<Tooltip delayDuration={popoverDelay}>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-orange-300/60 bg-orange-100/80 text-orange-900 text-xs shadow-sm hover:bg-orange-200/80 focus:outline-none focus:ring-2 focus:ring-orange-300"
													onClick={handleBlockedClick}
													aria-label={blockedPrimaryMessage}
												>
													🔒
												</button>
											</TooltipTrigger>
											<TooltipContent
												side="right"
												className="max-w-[220px] p-2 text-sm"
											>
												<p className="font-semibold">{blockedPrimaryMessage}</p>
												<p className="text-muted-foreground text-xs">
													{blockedSecondaryMessage}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : (
									<span className="pointer-events-none text-xs">🔒</span>
								)}
							</div>
							{fallback}
						</div>
					);
				}

				return (
					<div
						className={cn("relative", wrapperClassName)}
						aria-disabled="true"
						data-feature-guard="nav-disabled"
						data-feature-denial={denialReason ?? undefined}
					>
						<div className="pointer-events-none select-none opacity-60">
							{children}
						</div>
						<div
							className="pointer-events-auto absolute inset-y-0 right-3 flex items-center gap-2"
							onPointerDown={(event) => event.stopPropagation()}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}
						>
							{allowPopover ? (
								<TooltipProvider>
									<Tooltip delayDuration={popoverDelay}>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-orange-300/60 bg-orange-100/80 text-orange-900 text-xs shadow-sm hover:bg-orange-200/80 focus:outline-none focus:ring-2 focus:ring-orange-300"
												onClick={handleBlockedClick}
												aria-label={blockedPrimaryMessage}
											>
												🔒
											</button>
										</TooltipTrigger>
										<TooltipContent
											side="top"
											align="center"
											className="max-w-[240px] p-2 text-sm"
										>
											<p className="font-semibold">{blockedPrimaryMessage}</p>
											<p className="text-muted-foreground text-xs">
												{blockedSecondaryMessage}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<button
									type="button"
									className="flex size-8 items-center justify-center rounded-full border border-orange-200 bg-orange-100/70 text-orange-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
									onClick={handleBlockedClick}
									aria-label={blockedPrimaryMessage}
								>
									🔒
								</button>
							)}
							{shouldShowBadge && (
								<span className="pointer-events-none rounded-full border border-orange-200/70 bg-orange-100/70 px-3 py-1 font-semibold text-[11px] text-orange-900">
									{blockedPrimaryMessage}
								</span>
							)}
						</div>
						{fallback}
					</div>
				);
			}

			return (
				<div
					className={cn(
						"pointer-events-none select-none opacity-60",
						wrapperClassName,
					)}
					aria-disabled="true"
					data-feature-guard="disabled"
				>
					{children}
					{fallback}
				</div>
			);
		}
		default: {
			const content =
				typeof overlayContent === "function"
					? overlayContent({
							requiredTier: guard.requiredTier,
							userTier: guard.userTier,
						})
					: overlayContent;
			const isSmallScreen = computeIsSmallScreen();

			if (isNavigationItem) {
				if (isNavMinimized) {
					return (
						<div
							className={cn("relative", wrapperClassName)}
							data-feature-guard="overlay-nav-minimized"
							data-feature-denial={denialReason ?? undefined}
						>
							<div
								aria-hidden="true"
								className="pointer-events-none select-none opacity-70"
							>
								{children}
							</div>
							<div
								className="pointer-events-auto absolute inset-0 flex items-center justify-center"
								onPointerDown={(event) => event.stopPropagation()}
								onClick={(event) => event.stopPropagation()}
								onKeyDown={(event) => event.stopPropagation()}
							>
								{allowPopover ? (
									<TooltipProvider>
										<Tooltip delayDuration={popoverDelay}>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-orange-300/60 bg-orange-100/85 text-orange-900 text-xs shadow-sm hover:bg-orange-200/85 focus:outline-none focus:ring-2 focus:ring-orange-300"
													onClick={handleBlockedClick}
													aria-label={blockedPrimaryMessage}
												>
													🔒
												</button>
											</TooltipTrigger>
											<TooltipContent
												side="right"
												className="max-w-[220px] p-2 text-sm"
											>
												<p className="font-semibold">{blockedPrimaryMessage}</p>
												<p className="text-muted-foreground text-xs">
													{blockedSecondaryMessage}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : (
									<span className="pointer-events-none text-xs">🔒</span>
								)}
							</div>
							{fallback}
						</div>
					);
				}

				return (
					<div
						className={cn("relative", wrapperClassName)}
						data-feature-guard="overlay-nav-expanded"
						data-feature-denial={denialReason ?? undefined}
					>
						<div
							aria-hidden="true"
							className="pointer-events-none select-none opacity-70"
						>
							{children}
						</div>
						<div
							className="pointer-events-auto absolute inset-y-0 right-3 flex items-center gap-2"
							onPointerDown={(event) => event.stopPropagation()}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}
						>
							{allowPopover ? (
								<TooltipProvider>
									<Tooltip delayDuration={popoverDelay}>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-orange-300/60 bg-orange-100/85 text-orange-900 text-xs shadow-sm hover:bg-orange-200/85 focus:outline-none focus:ring-2 focus:ring-orange-300"
												onClick={handleBlockedClick}
												aria-label={blockedPrimaryMessage}
											>
												🔒
											</button>
										</TooltipTrigger>
										<TooltipContent
											side="top"
											align="center"
											className="max-w-[240px] p-2 text-sm"
										>
											<p className="font-semibold">{blockedPrimaryMessage}</p>
											<p className="text-muted-foreground text-xs">
												{blockedSecondaryMessage}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<div className="pointer-events-none rounded-full border border-orange-200 bg-background/95 p-1 shadow-sm">
									<span className="text-xs">🔒</span>
								</div>
							)}
							<span className="pointer-events-none rounded-full border border-orange-200/80 bg-orange-100/80 px-3 py-1 font-semibold text-[11px] text-orange-900">
								{blockedPrimaryMessage}
							</span>
						</div>
						{fallback}
					</div>
				);
			}

			const effectiveOrientation =
				orientation === "auto" ? "vertical" : orientation;

			return (
				<div
					className={cn("relative", wrapperClassName)}
					data-feature-guard="overlay"
					data-feature-denial={denialReason ?? undefined}
				>
					<div aria-hidden="true" className="pointer-events-none">
						{children}
					</div>
					{effectiveOrientation === "horizontal" ? (
						// Horizontal overlay for horizontal button layouts
						<div
							className={`pointer-events-auto absolute inset-0 flex items-center justify-center ${
								isSmallScreen
									? "gap-2 bg-gradient-to-r from-background/70 via-background/50 to-background/70 p-2 backdrop-blur-[1px]"
									: "gap-3 bg-gradient-to-r from-background/60 via-background/40 to-background/60 p-3 backdrop-blur-[2px]"
							} border border-orange-200/50`}
						>
							{content ?? (
								<div
									className={`flex items-center gap-3 text-center ${
										isSmallScreen ? "gap-2" : "gap-3"
									}`}
								>
									{/* Horizontal lock icon with hover tooltip */}
									{allowPopover && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className={`flex cursor-pointer items-center justify-center rounded-full border border-orange-300/60 bg-orange-100/80 transition-all hover:scale-105 hover:bg-orange-200/80 focus:outline-none focus:ring-2 focus:ring-orange-300 ${
															isSmallScreen ? "h-8 w-8" : "h-10 w-10"
														}`}
														onClick={handleBlockedClick}
														aria-label={`Access blocked: ${blockedPrimaryMessage}`}
													>
														<span
															className={isSmallScreen ? "text-xs" : "text-sm"}
														>
															🔒
														</span>
													</button>
												</TooltipTrigger>
												<TooltipContent
													side="top"
													className={`p-3 ${
														isSmallScreen ? "max-w-[200px] p-2" : "max-w-xs p-3"
													}`}
													sideOffset={isSmallScreen ? 6 : 8}
												>
													<div className="space-y-1 text-center">
														{denialReason === "tier" ? (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Upgrade Required
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Tier needed"
																		: `${guard.requiredTier} tier needed`}
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	Current: {guard.userTier}
																</p>
															</>
														) : denialReason === "permission" ? (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Permission Required
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Contact admin"
																		: "Contact your administrator"}
																</p>
															</>
														) : denialReason === "quota" ? (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Quota Exceeded
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Limit reached"
																		: "Usage limit reached"}
																</p>
															</>
														) : (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Feature Unavailable
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Not available"
																		: "This feature is not available"}
																</p>
															</>
														)}
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}

									{/* Horizontal teaser text - hidden in iconOnly mode */}
									{!iconOnly && (
										<div
											className={`space-y-1 ${isSmallScreen ? "hidden" : ""}`}
										>
											<p className="font-medium text-foreground/80 text-sm">
												Premium Feature
											</p>
											<p className="max-w-[200px] truncate text-muted-foreground/80 text-xs">
												Unlock with{" "}
												{denialReason === "tier"
													? guard.requiredTier
													: "upgrade"}
											</p>
										</div>
									)}
								</div>
							)}
							{fallback}
						</div>
					) : (
						// Vertical overlay for vertical item layouts (default)
						<div
							className={`pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md ${
								isSmallScreen
									? "gap-2 bg-gradient-to-br from-background/70 via-background/50 to-background/70 p-2 backdrop-blur-[1px]"
									: "gap-3 bg-gradient-to-br from-background/60 via-background/40 to-background/60 p-4 backdrop-blur-[2px]"
							} border border-orange-200/50`}
						>
							{content ?? (
								<div
									className={`w-full max-w-[280px] space-y-3 text-center ${
										isSmallScreen ? "space-y-2" : "space-y-3"
									}`}
								>
									{/* Vertical lock icon with hover tooltip for explanation */}
									{allowPopover && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className={`flex cursor-pointer items-center justify-center rounded-full border border-orange-300/60 bg-orange-100/80 transition-all hover:scale-105 hover:bg-orange-200/80 focus:outline-none focus:ring-2 focus:ring-orange-300 ${
															isSmallScreen ? "h-8 w-8" : "h-10 w-10"
														}`}
														onClick={handleBlockedClick}
														aria-label={`Access blocked: ${blockedPrimaryMessage}`}
													>
														<span
															className={isSmallScreen ? "text-xs" : "text-sm"}
														>
															🔒
														</span>
													</button>
												</TooltipTrigger>
												<TooltipContent
													side="top"
													className={`p-3 ${
														isSmallScreen ? "max-w-[200px] p-2" : "max-w-xs p-3"
													}`}
													sideOffset={isSmallScreen ? 6 : 8}
												>
													<div className="space-y-1 text-center">
														{denialReason === "tier" ? (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Upgrade Required
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Tier needed"
																		: `${guard.requiredTier} tier needed`}
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	Current: {guard.userTier}
																</p>
															</>
														) : denialReason === "permission" ? (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Permission Required
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Contact admin"
																		: "Contact your administrator"}
																</p>
															</>
														) : denialReason === "quota" ? (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Quota Exceeded
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Limit reached"
																		: "Usage limit reached"}
																</p>
															</>
														) : (
															<>
																<p
																	className={`font-semibold ${
																		isSmallScreen ? "text-xs" : "text-sm"
																	}`}
																>
																	Feature Unavailable
																</p>
																<p
																	className={`text-muted-foreground ${
																		isSmallScreen ? "text-xs" : "text-xs"
																	}`}
																>
																	{isSmallScreen
																		? "Not available"
																		: "This feature is not available"}
																</p>
															</>
														)}
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}

									{/* Vertical teaser text - hidden in iconOnly mode */}
									{!iconOnly && (
										<div className="space-y-1">
											<p
												className={`font-medium text-foreground/80 ${
													isSmallScreen ? "text-xs" : "text-sm"
												}`}
											>
												Premium Feature
											</p>
											<p
												className={`max-w-[200px] truncate text-muted-foreground/80 ${
													isSmallScreen ? "line-clamp-2 text-xs" : "text-xs"
												}`}
											>
												Unlock with{" "}
												{denialReason === "tier"
													? guard.requiredTier
													: "upgrade"}
											</p>
										</div>
									)}
								</div>
							)}
							{fallback}
						</div>
					)}
				</div>
			);
		}
	}
}

export default FeatureGuard;
