"use client";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useEffect, useState } from "react";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import {
	FacebookLoginButton,
	InstagramLoginButton,
	LinkedInLoginButton,
	TwitterLoginButton,
} from "react-social-login-buttons";
import type { InitialOauthSetupData } from "../../../utils/const/connectedAccounts";
import HashtagInput from "../../../utils/socials/hashtags";
import { OAuthButton } from "./OAuthButton";

import type { OAuthData } from "@/types/userProfile/connectedAccounts";

export interface OAuthMainProps {
	loading: boolean;
	initialData?: InitialOauthSetupData;
}

const defaultOAuthData = {
	accessToken: "",
	expiresIn: 0,
	tokenType: "",
	scope: "",
	refreshToken: "",
};

// * OAuthMain component for managing OAuth logins and social media tags
export const OAuthMain: React.FC<OAuthMainProps> = ({
	loading,
	initialData,
}) => {
	const form = useFormContext<ProfileFormValues>();

	// * State for storing OAuth data
	const [metaData, setMetaData] = useState<OAuthData | null>(null);
	const [instagramData, setInstagramData] = useState<OAuthData | null>(null);
	const [twitterData, setTwitterData] = useState<OAuthData | null>(null);
	const [linkedInData, setLinkedInData] = useState<OAuthData | null>(null);

	useEffect(() => {
		if (initialData) {
			setMetaData(initialData.connectedAccounts.facebook ?? null);
			setInstagramData(initialData.connectedAccounts.instagram ?? null);
			setTwitterData(initialData.connectedAccounts.twitter ?? null);
			setLinkedInData(initialData.connectedAccounts.linkedIn ?? null);
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.facebook",
				initialData.connectedAccounts.facebook ?? defaultOAuthData,
			);
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.instagram",
				initialData.connectedAccounts.instagram ?? defaultOAuthData,
			);
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.twitter",
				initialData.connectedAccounts.twitter ?? defaultOAuthData,
			);
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.linkedIn",
				initialData.connectedAccounts.linkedIn ?? defaultOAuthData,
			);
			form.setValue("socialMediatags", initialData.socialMediaTags || []);
		}
	}, [initialData, form]);

	// Simulated OAuth login handler (replace with real OAuth logic as needed)
	const handleOAuthLogin = (service: string) => {
		const simulatedOAuthData: OAuthData = {
			accessToken: "abc123",
			refreshToken: "def456",
			expiresIn: 3600,
			tokenType: "Bearer",
			scope: "user_profile",
		};
		switch (service) {
			case "meta":
				setMetaData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.facebook",
					simulatedOAuthData,
				);
				break;
			case "instagram":
				setInstagramData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.instagram",
					simulatedOAuthData,
				);
				break;
			case "twitter":
				setTwitterData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.twitter",
					simulatedOAuthData,
				);
				break;
			case "linkedIn":
				setLinkedInData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.linkedIn",
					simulatedOAuthData,
				);
				break;
			default:
				break;
		}
	};

	return (
		<div className="flex w-full flex-col items-center">
			<div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
				{[
					{
						key: "meta",
						serviceData: metaData,
						name: "meta",
						button: (
							<FacebookLoginButton
								onClick={() => handleOAuthLogin("meta")}
								style={{ width: "100%", minWidth: 200, maxWidth: 350 }}
							/>
						),
					},

					{
						key: "linkedIn",
						serviceData: linkedInData,
						name: "linkedIn",
						button: (
							<LinkedInLoginButton
								onClick={() => handleOAuthLogin("linkedIn")}
								style={{ width: "100%", minWidth: 200, maxWidth: 350 }}
							/>
						),
					},
				].map(({ key, serviceData, name, button }) => (
					<OAuthButton
						key={key}
						serviceData={serviceData}
						serviceName={name}
						buttonComponent={button}
						onRefresh={() => handleOAuthLogin(name)}
						control={form.control}
					/>
				))}
			</div>
			{/* Hashtag Input */}
			<div className="relative my-6 w-full max-w-md">
				{/* Overlay */}
				<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/60">
					<span className="font-semibold text-white text-xl drop-shadow-lg">
						Coming Soon
					</span>
				</div>
				<FormField
					control={form.control}
					name="socialMediatags"
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<HashtagInput
								form={form}
								loading={loading}
								minHashtags={5}
								maxHashtags={10}
								required={false}
							/>
							<FormMessage>{error?.message}</FormMessage>
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
};
