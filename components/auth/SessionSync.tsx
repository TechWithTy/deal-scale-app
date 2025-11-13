"use client";

import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useUserStore } from "@/lib/stores/userStore";
import {
	deriveQuickStartDefaults,
	resolveDemoLogoUrl,
} from "@/lib/demo/normalizeDemoPayload";
import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import type { Session } from "next-auth";
import type { UserProfile } from "@/types/userProfile";
import type { UserProfileSubscription } from "@/types/userProfile/subscriptions";

const cloneProfileTemplate = (): UserProfile | null => {
	if (!MockUserProfile) {
		return null;
	}

	try {
		return structuredClone(MockUserProfile);
	} catch (_error) {
		return JSON.parse(JSON.stringify(MockUserProfile)) as UserProfile;
	}
};

const sanitizeProfileForStorage = (profile: UserProfile): UserProfile => {
	return {
		...profile,
		savedSearches: [],
		savedCampaignTemplates: [],
		workflowPlatforms: [],
		savedWorkflows: [],
		integrations: [],
		teamMembers: [],
		activityLog: [],
		billingHistory: [],
		leadPreferences: {
			...profile.leadPreferences,
			preferredLocation: [],
		},
		companyInfo: {
			...profile.companyInfo,
			campaignAnalytics: [],
			leads: [],
			leadLists: [],
			assets: {
				...profile.companyInfo.assets,
				ghlAssets: [],
			},
		},
		aIKnowledgebase: {
			...profile.aIKnowledgebase,
			recordings: {
				...profile.aIKnowledgebase.recordings,
				voices: [],
			},
		},
	};
};

const buildProfileFromSession = (
	session: Session | null,
): UserProfile | null => {
	const template = cloneProfileTemplate();
	const demo = session?.user?.demoConfig;
	const quickStartDefaults = deriveQuickStartDefaults({
		demoConfig: demo,
		fallback: session?.user?.quickStartDefaults,
	});

	if (!template || !session?.user) {
		return null;
	}

	const base = sanitizeProfileForStorage(template);
	if (demo) {
		const socialTags = Object.values(demo.social ?? {}).filter(
			(link): link is string =>
				typeof link === "string" && link.trim().length > 0,
		);
		base.companyInfo = {
			...base.companyInfo,
			companyName: demo.companyName ?? base.companyInfo.companyName,
			companyLogo:
				resolveDemoLogoUrl({
					demoConfig: demo,
					fallback: base.companyInfo.companyLogo,
				}) ?? base.companyInfo.companyLogo,
			website: demo.website ?? base.companyInfo.website,
			outreachEmail: demo.email ?? base.companyInfo.outreachEmail,
			forwardingNumber: demo.phoneNumber ?? base.companyInfo.forwardingNumber,
			socialMediaTags: socialTags,
			assets: {
				...base.companyInfo.assets,
				logo:
					resolveDemoLogoUrl({
						demoConfig: demo,
						fallback:
							typeof base.companyInfo.assets.logo === "string"
								? (base.companyInfo.assets.logo as string)
								: undefined,
					}) ?? base.companyInfo.assets.logo,
			},
		};
		if (demo.roiProfile) {
			base.roiProfileOverrides = { ...demo.roiProfile };
		}
	}

	const [givenName = base.firstName, familyName = base.lastName] =
		session.user.name?.split(" ") ?? [];
	base.email = session.user.email ?? base.email;
	base.firstName = givenName;
	base.lastName = familyName ?? base.lastName;
	base.quickStartDefaults = quickStartDefaults ?? base.quickStartDefaults;
	base.subscription = session.user.subscription ?? base.subscription;
	const hydratedSubscription = base.subscription as
		| (UserProfileSubscription & Record<string, unknown>)
		| undefined;
	if (hydratedSubscription) {
		const sessionSubscriptionName = session.user.subscription?.name;
		const fallbackTierName = session.user.tier;
		const normalizedName =
			typeof sessionSubscriptionName === "string" &&
			sessionSubscriptionName.trim().length > 0
				? sessionSubscriptionName
				: fallbackTierName;
		if (normalizedName && normalizedName.trim().length > 0) {
			hydratedSubscription.name = normalizedName;
		}
	}

	return base;
};

export default function SessionSync() {
	const { data: session, status } = useSession();
	const setUser = useUserStore((state) => state.setUser);
	const hydrateImpersonation = useImpersonationStore(
		(state) => state.hydrateFromSession,
	);
	const { setFromSession, clear } = useSessionStore((state) => ({
		setFromSession: state.setFromSession,
		clear: state.clear,
	}));
	const { setUserProfile, resetUserProfile } = useUserProfileStore((state) => ({
		setUserProfile: state.setUserProfile,
		resetUserProfile: state.resetUserProfile,
	}));

	useEffect(() => {
		if (status === "authenticated") {
			setUser(session);
			setFromSession(session ?? null);
			hydrateImpersonation(session ?? null);
			const profile = buildProfileFromSession(session ?? null);
			if (profile) {
				try {
					setUserProfile(profile);
				} catch (error) {
					if (
						error instanceof DOMException &&
						error.name === "QuotaExceededError"
					) {
						console.warn(
							"[SessionSync] Failed to persist user profile due to storage quota.",
						);
						resetUserProfile();
					} else {
						throw error;
					}
				}
			}
		} else if (status === "unauthenticated") {
			setUser(null);
			clear();
			hydrateImpersonation(null);
			resetUserProfile();
		}
	}, [
		session,
		status,
		setUser,
		hydrateImpersonation,
		setFromSession,
		clear,
		setUserProfile,
		resetUserProfile,
	]);

	return null;
}
