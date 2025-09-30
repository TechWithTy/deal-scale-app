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
			return (
				<div
					className={cn("relative", wrapperClassName)}
					data-feature-guard="overlay"
					data-feature-denial={denialReason ?? undefined}
				>
					<div aria-hidden="true">{children}</div>
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md bg-background/80 p-6 text-center backdrop-blur-sm">
						{content ?? (
							<div className="space-y-2">
								{denialReason === "tier" ? (
									<>
										<p className="font-semibold text-lg">
											Upgrade to {guard.requiredTier} to use this feature.
										</p>
										<p className="text-muted-foreground text-sm">
											Your {guard.userTier} plan does not include this
											capability.
										</p>
									</>
								) : null}
								{denialReason === "permission" ? (
									<p className="text-muted-foreground text-sm">
										Your role does not include the required permission.
									</p>
								) : null}
								{denialReason === "quota" ? (
									<p className="text-muted-foreground text-sm">
										You have exhausted the available quota for this action.
									</p>
								) : null}
							</div>
						)}
						{fallback}
					</div>
				</div>
			);
		}
	}
}

export default FeatureGuard;
