import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
	FacebookLoginButton,
	InstagramLoginButton,
	LinkedInLoginButton,
	TwitterLoginButton,
} from "react-social-login-buttons";
import type { InitialOauthSetupData } from "../../../utils/const/connectedAccounts";
import HashtagInput from "../../../utils/socials/hashtags";

// * OAuth Setup Step
// ! This component manages OAuth state for all supported social login providers.
// * Follows DRY and type-safe patterns (see user rules).
// * Imports shared OAuthData type for consistency across codebase.
import type { OAuthData } from "@/types/userProfile/connectedAccounts";

/**
 * OAuth Setup Props
 *
 * @description Strict type for form
 * @description Initial OAuth data
 */
export interface OAuthSetupProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
	initialData?: InitialOauthSetupData;
}

const defaultOAuthData: OAuthData = {
	accessToken: "",
	expiresIn: 0,
	tokenType: "",
	scope: "",
	refreshToken: "",
};

/**
 * OAuth Setup Component
 *
 * @description Manages OAuth state for all supported social login providers
 * @description Follows DRY and type-safe patterns (see user rules)
 */
export const OAuthSetup: React.FC<OAuthSetupProps> = ({
	form,
	loading,
	initialData,
}) => {
	// * State for each provider's OAuth data
	const [metaData, setMetaData] = useState<OAuthData | null>(null); // * Meta (Facebook) OAuth data
	const [instagramData, setInstagramData] = useState<OAuthData | null>(null); // * Instagram OAuth data
	const [twitterData, setTwitterData] = useState<OAuthData | null>(null); // * Twitter OAuth data
	const [linkedInData, setLinkedInData] = useState<OAuthData | null>(null); // * LinkedIn OAuth data

	// ! Extract initial OAuth and social media tag data from the profile
	useEffect(() => {
		if (initialData) {
			setMetaData(initialData.connectedAccounts.facebook ?? null);
			setInstagramData(initialData.connectedAccounts.instagram ?? null);
			setTwitterData(initialData.connectedAccounts.twitter ?? null);
			setLinkedInData(initialData.connectedAccounts.linkedIn ?? null);
		}
	}, [initialData]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (initialData) {
			setMetaData(initialData.connectedAccounts.facebook ?? null);
			setInstagramData(initialData.connectedAccounts.instagram ?? null);
			setTwitterData(initialData.connectedAccounts.twitter ?? null);
			setLinkedInData(initialData.connectedAccounts.linkedIn ?? null);

			// * Set the form values for connected accounts and social media tags
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
	}, [initialData]);

	// ! Simulate OAuth login flow for different services
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
				); // * Set the form value for Meta (Facebook) OAuth
				break;
			case "instagram":
				setInstagramData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.instagram",
					simulatedOAuthData,
				); // * Set the form value for Instagram OAuth
				break;
			case "twitter":
				setTwitterData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.twitter",
					simulatedOAuthData,
				); // * Set the form value for Twitter OAuth
				break;
			case "linkedIn":
				setLinkedInData(simulatedOAuthData);
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.linkedIn",
					simulatedOAuthData,
				); // * Set the form value for LinkedIn OAuth
				break;
			default:
				break;
		}
	};

	// * Type-safe union for OAuth field names
	type OAuthFieldName =
		| "socialMediaCampaignAccounts.oauthData.facebook"
		| "socialMediaCampaignAccounts.oauthData.instagram"
		| "socialMediaCampaignAccounts.oauthData.twitter"
		| "socialMediaCampaignAccounts.oauthData.linkedIn";

	// * Render OAuth buttons with "Refresh Login" if logged in
	const renderOAuthButton = (
		serviceData: OAuthData | null,
		fieldName: OAuthFieldName,
		buttonComponent: JSX.Element,
		provider: "meta" | "instagram" | "twitter" | "linkedIn",
	) => (
		<FormField
			control={form.control}
			name={fieldName}
			render={({ field, fieldState: { error } }) => (
				<FormItem>
					<FormLabel>
						{provider.charAt(0).toUpperCase() + provider.slice(1)} Login
					</FormLabel>
					{serviceData ? (
						// * If user is already logged in, show Refresh Login button
						<div className="flex flex-col items-center justify-center">
							<p className="text-gray-600 text-sm dark:text-gray-300">
								You are logged in.
							</p>
							<button
								onClick={() => handleOAuthLogin(provider)}
								type="button"
								className="mt-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 dark:bg-blue-400 dark:focus:ring-blue-300 dark:hover:bg-blue-500"
							>
								Refresh Login
							</button>
						</div>
					) : (
						buttonComponent
					)}
					<FormMessage>{error?.message}</FormMessage>
				</FormItem>
			)}
		/>
	);

	// * Render all OAuth buttons and hashtag input
	return (
		<>
			{/* Facebook/Meta OAuth */}
			{renderOAuthButton(
				metaData,
				"socialMediaCampaignAccounts.oauthData.facebook",
				<FacebookLoginButton onClick={() => handleOAuthLogin("meta")} />,
				"meta",
			)}
			{/* Instagram OAuth */}
			{renderOAuthButton(
				instagramData,
				"socialMediaCampaignAccounts.oauthData.instagram",
				<InstagramLoginButton onClick={() => handleOAuthLogin("instagram")} />,
				"instagram",
			)}
			{/* Twitter OAuth */}
			{renderOAuthButton(
				twitterData,
				"socialMediaCampaignAccounts.oauthData.twitter",
				<TwitterLoginButton onClick={() => handleOAuthLogin("twitter")} />,
				"twitter",
			)}
			{/* LinkedIn OAuth */}
			{renderOAuthButton(
				linkedInData,
				"socialMediaCampaignAccounts.oauthData.linkedIn",
				<LinkedInLoginButton onClick={() => handleOAuthLogin("linkedIn")} />,
				"linkedIn",
			)}
			{/* Hashtag Input */}
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
		</>
	);
};
