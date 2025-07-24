"use client";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { OAuthMain } from "./steps/Oauth/OAuthMain";
import { BaseSetupMain } from "./steps/base/BaseSetupMain";
import { KnowledgeBaseMain } from "./steps/knowledge/KnowledgeBaseMain";
import { PersonalInformationFormMain } from "./steps/personal_information/PersonalInformationFormMain";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
// Example initial data (replace with real data as needed)
const initialData = undefined;

export const ProfileStepper: React.FC = () => {
	const form = useForm<ProfileFormValues>({
		defaultValues: {
			// Provide sensible defaults or leave empty
			firstName: "",
			lastName: "",
			email: "",
			personalNum: "",
			companyName: "",
			companyLogo: undefined,
			// outreachEmailAddress: "",
			companyAssets: [],
			selectedVoice: "",
			exampleSalesScript: "",
			// exampleEmailBody: "",
			voicemailRecordingId: "",
			clonedVoiceId: "",
			meta: undefined,
			socialMediaCampaignAccounts: {
				oauthData: {},
				facebook: undefined,
				twitter: undefined,
				instagram: undefined,
				linkedIn: undefined,
			},
			socialMediatags: [],
			state: "",
			city: "",
		},
		mode: "onChange",
	});

	// Get user profile from Zustand
	const userProfile = mockUserProfile;

	const handleVoiceSelect = (voiceId: string) => {};
	const handleScriptUpload = (scriptContent: string) => {};
	const handleEmailUpload = (emailContent: string) => {};
	const selectedScriptFileName = "";
	const selectedEmailFileName = "";
	const loading = false;

	return (
		<FormProvider {...form}>
			<div className="flex flex-col gap-8 p-8">
				<h2 className="font-bold text-xl">Profile Stepper Demo</h2>
				<PersonalInformationFormMain loading={loading} />
				<BaseSetupMain loading={loading} initialData={initialData} />
				<KnowledgeBaseMain
					loading={loading}
					handleVoiceSelect={handleVoiceSelect}
					handleScriptUpload={handleScriptUpload}
					selectedScriptFileName={selectedScriptFileName}
					handleEmailUpload={handleEmailUpload}
					selectedEmailFileName={selectedEmailFileName}
					initialData={initialData}
				/>
				<OAuthMain loading={loading} initialData={initialData} />
			</div>
		</FormProvider>
	);
};

export default ProfileStepper;
