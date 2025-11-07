import type { CompanyInfo } from "@/types/userProfile";
import type {
	FacebookOAuthData,
	InstagramOAuthData,
	LinkedInOAuthData,
	TwitterOAuthData,
} from "@/types/userProfile/connectedAccounts";
import { create } from "zustand";
import { withAnalytics } from "../_middleware/analytics";
import { useUserProfileStore } from "./userProfile";

type ConnectedPlatform = "facebook" | "instagram" | "linkedIn" | "twitter";

interface CompanyStoreState {
	getCompanyInfo: () => CompanyInfo | null;
	updateCompanyInfo: (patch: Partial<CompanyInfo>) => void;
	setForwardingNumber: (num: string) => void;
	setWebhook: (url: string) => void;
	setCompanyLogo: (url: string | undefined) => void;
	// Connected accounts
	connectFacebook: (data: FacebookOAuthData) => void;
	connectInstagram: (data: InstagramOAuthData) => void;
	connectLinkedIn: (data: LinkedInOAuthData) => void;
	connectTwitter: (data: TwitterOAuthData) => void;
	disconnect: (platform: ConnectedPlatform) => void;
}

export const useCompanyStore = create<CompanyStoreState>(
	withAnalytics<CompanyStoreState>("user_company", () => ({
		getCompanyInfo: () =>
			useUserProfileStore.getState().userProfile?.companyInfo ?? null,

		updateCompanyInfo: (patch) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			const next: CompanyInfo = { ...cur.companyInfo, ...patch };
			useUserProfileStore.getState().updateUserProfile({ companyInfo: next });
		},

		setForwardingNumber: (num) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			const next: CompanyInfo = { ...cur.companyInfo, forwardingNumber: num };
			useUserProfileStore.getState().updateUserProfile({ companyInfo: next });
		},

		setWebhook: (url) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			const next: CompanyInfo = { ...cur.companyInfo, webhook: url };
			useUserProfileStore.getState().updateUserProfile({ companyInfo: next });
		},

		setCompanyLogo: (url) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			const next: CompanyInfo = { ...cur.companyInfo, companyLogo: url };
			useUserProfileStore.getState().updateUserProfile({ companyInfo: next });
		},

		connectFacebook: (data) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			useUserProfileStore.getState().updateUserProfile({
				connectedAccounts: { ...cur.connectedAccounts, facebook: data },
			});
		},

		connectInstagram: (data) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			useUserProfileStore.getState().updateUserProfile({
				connectedAccounts: { ...cur.connectedAccounts, instagram: data },
			});
		},

		connectLinkedIn: (data) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			useUserProfileStore.getState().updateUserProfile({
				connectedAccounts: { ...cur.connectedAccounts, linkedIn: data },
			});
		},

		connectTwitter: (data) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			useUserProfileStore.getState().updateUserProfile({
				connectedAccounts: { ...cur.connectedAccounts, twitter: data },
			});
		},

		disconnect: (platform) => {
			const cur = useUserProfileStore.getState().userProfile;
			if (!cur) return;
			const next = { ...cur.connectedAccounts } as Required<
				typeof cur
			>["connectedAccounts"];
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete (next as Record<string, unknown>)[platform];
			useUserProfileStore
				.getState()
				.updateUserProfile({ connectedAccounts: next });
		},
	})),
);
