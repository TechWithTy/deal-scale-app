"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/_utils";
import {
	useFeatureAccessGuard,
	type FeatureGuardMode,
} from "@/hooks/useFeatureAccessGuard";
import type {
	SubscriptionTier,
	TierInput,
} from "@/constants/subscription/tiers";
import type { PermissionAction, PermissionResource } from "@/types/user";
import type { FeatureQuotaKey } from "@/constants/features";
import { useUserStore } from "@/lib/stores/userStore";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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

	// Handle blocked click actions
	const handleBlockedClick = () => {
		if (!onBlockedClick || finalAllowed) return;

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
		onBlockedClick(denialReason!);
	};

	if (finalAllowed) {
		return <>{children}</>;
	}

	switch (mode) {
		case "hide":
			return <>{fallback}</>;
		case "disable":
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
		default: {
			const content =
				typeof overlayContent === "function"
					? overlayContent({
							requiredTier: guard.requiredTier,
							userTier: guard.userTier,
						})
					: overlayContent;

			// Check if this is for navigation items (sidebar)
			const isNavigationItem =
				wrapperClassName?.includes("nav-item") ||
				wrapperClassName?.includes("nav") ||
				wrapperClassName?.includes("sidebar");

			// Determine orientation automatically if set to 'auto'
			const effectiveOrientation =
				orientation === "auto"
					? isNavigationItem
						? "horizontal"
						: "vertical"
					: orientation;

			// Responsive styling based on container size
			const isSmallScreen =
				typeof window !== "undefined" && window.innerWidth < 640;

			return (
				<div
					className={cn("relative", wrapperClassName)}
					data-feature-guard="overlay"
					data-feature-denial={denialReason ?? undefined}
				>
					<div aria-hidden="true" className="pointer-events-none">
						{children}
					</div>
					{isNavigationItem ? (
						// Horizontal blocking for navigation items
						<div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent pointer-events-none">
							<div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
								{showPopover ? (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="flex items-center justify-center rounded-full bg-orange-100/80 border border-orange-300/60 hover:bg-orange-200/80 transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300"
													onClick={handleBlockedClick}
													aria-label={`Access blocked: ${denialReason === "tier" ? "Upgrade required" : denialReason === "permission" ? "Permission required" : "Quota exceeded"}`}
												>
													<span className="text-xs">🔒</span>
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="max-w-xs p-2">
												<div className="text-center">
													{denialReason === "tier" ? (
														<p className="text-sm font-medium">
															Upgrade to {guard.requiredTier} required
														</p>
													) : denialReason === "permission" ? (
														<p className="text-sm font-medium">
															Permission required
														</p>
													) : denialReason === "quota" ? (
														<p className="text-sm font-medium">
															Quota exceeded
														</p>
													) : (
														<p className="text-sm font-medium">
															Feature not available
														</p>
													)}
												</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : (
									<div className="rounded-full bg-background/95 p-1 shadow-sm border border-orange-200 backdrop-blur-sm">
										<span className="text-xs">🔒</span>
									</div>
								)}
							</div>
						</div>
					) : effectiveOrientation === "horizontal" ? (
						// Horizontal overlay for horizontal button layouts
						<div
							className={`absolute inset-0 flex items-center justify-center pointer-events-auto ${
								isSmallScreen
									? "bg-gradient-to-r from-background/70 via-background/50 to-background/70 backdrop-blur-[1px] p-2 gap-2"
									: "bg-gradient-to-r from-background/60 via-background/40 to-background/60 backdrop-blur-[2px] p-3 gap-3"
							} border border-orange-200/50`}
						>
							{content ?? (
								<div
									className={`flex items-center gap-3 text-center ${
										isSmallScreen ? "gap-2" : "gap-3"
									}`}
								>
									{/* Horizontal lock icon with hover tooltip */}
									{showPopover && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className={`flex items-center justify-center rounded-full bg-orange-100/80 border border-orange-300/60 hover:bg-orange-200/80 transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 ${
															isSmallScreen ? "w-8 h-8" : "w-10 h-10"
														}`}
														onClick={handleBlockedClick}
														aria-label={`Access blocked: ${denialReason === "tier" ? "Upgrade required" : denialReason === "permission" ? "Permission required" : "Quota exceeded"}`}
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
													<div className="text-center space-y-1">
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
											<p className="font-medium text-sm text-foreground/80">
												Premium Feature
											</p>
											<p className="text-xs text-muted-foreground/80 truncate max-w-[200px]">
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
							className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md pointer-events-auto ${
								isSmallScreen
									? "bg-gradient-to-br from-background/70 via-background/50 to-background/70 backdrop-blur-[1px] p-2 gap-2"
									: "bg-gradient-to-br from-background/60 via-background/40 to-background/60 backdrop-blur-[2px] p-4 gap-3"
							} border border-orange-200/50`}
						>
							{content ?? (
								<div
									className={`space-y-3 text-center w-full max-w-[280px] ${
										isSmallScreen ? "space-y-2" : "space-y-3"
									}`}
								>
									{/* Vertical lock icon with hover tooltip for explanation */}
									{showPopover && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className={`flex items-center justify-center rounded-full bg-orange-100/80 border border-orange-300/60 hover:bg-orange-200/80 transition-all hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 ${
															isSmallScreen ? "w-8 h-8" : "w-10 h-10"
														}`}
														onClick={handleBlockedClick}
														aria-label={`Access blocked: ${denialReason === "tier" ? "Upgrade required" : denialReason === "permission" ? "Permission required" : "Quota exceeded"}`}
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
													<div className="text-center space-y-1">
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
												className={`text-muted-foreground/80 truncate max-w-[200px] ${
													isSmallScreen ? "text-xs line-clamp-2" : "text-xs"
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
