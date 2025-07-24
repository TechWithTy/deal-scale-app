"use client";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/zod/userSetup/profile-form-schema";
import { OAuthMain } from "./steps/Oauth/OAuthMain";
import { BaseSetupMain } from "./steps/base/BaseSetupMain";
import { KnowledgeBaseMain } from "./steps/knowledge/KnowledgeBaseMain";
import { PersonalInformationFormMain } from "./steps/personal_information/PersonalInformationFormMain";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
// * Step definitions: label and component for each step
const stepHashes = [
	"profile-info", // Step 0
	"company-info", // Step 1
	"voice-script", // Step 2
	"oauth", // Step 3
];

const steps = [
	{ label: "Personal Info", component: PersonalInformationFormMain },
	{ label: "Base Setup", component: BaseSetupMain },
	{ label: "Knowledge Base", component: KnowledgeBaseMain },
	{ label: "OAuth", component: OAuthMain },
];

export const ProfileStepper: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [currentStep, setCurrentStep] = useState(0);

	// Helper to navigate to a step and update the hash
	const goToStep = (stepIdx: number) => {
		setCurrentStep(stepIdx);
		const hash = stepHashes[stepIdx];
		// Use shallow routing to update only the hash
		router.replace(`${pathname}#${hash}`);
	};

	// On mount, read the hash and set the step
	useEffect(() => {
		if (typeof window === "undefined") return;
		const hash = window.location.hash.replace("#", "");
		const idx = stepHashes.indexOf(hash);
		if (idx !== -1) setCurrentStep(idx);
	}, []);
	const [stepError, setStepError] = useState<string | null>(null); // * Error message for validation
	// ! Use zodResolver for strict Zod schema validation (see user rules)

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
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

	// * Stepper header UI
	// Only include required and rendered fields for each step
	const stepFields: (keyof ProfileFormValues)[][] = [
		["firstName", "lastName", "email", "personalNum", "state", "city"], // Step 0
		["companyName", "companyLogo", "companyAssets", "leadForwardingNumber"], // Step 1
		["selectedVoice", "exampleSalesScript"], // Step 2 (adjust if any are optional)
		[], // Step 3 (OAuth, add required fields if any)
	];

	// Helper to map field names to user-friendly labels for error hints
	const fieldLabels: Record<string, string> = {
		firstName: "First Name",
		lastName: "Last Name",
		email: "Email",
		personalNum: "Personal Phone Number",
		companyName: "Company Name",
		leadForwardingNumber: "Lead Forwarding Number",
		companyLogo: "Company Logo",
		// outreachEmailAddress: "Outreach Email Address",
		companyAssets: "Company Assets",
		selectedVoice: "Selected Voice",
		exampleSalesScript: "Sales Script",
		// exampleEmailBody: "Email Body",
		voicemailRecordingId: "Voicemail Recording",
		clonedVoiceId: "Cloned Voice",
		meta: "Meta",
		socialMediaCampaignAccounts: "Social Media Accounts",
		socialMediatags: "Social Media Tags",
		state: "State",
		city: "City",
	};

	const StepperHeader = () => {
		// Helper: check if all previous steps are valid
		const allPrevStepsValid = (idx: number) => {
			for (let i = 0; i < idx; i++) {
				if (
					!form.getFieldState(stepFields[i][0]).isTouched ||
					!form.formState.isValid
				) {
					return false;
				}
			}
			return true;
		};
		return (
			<div className="mb-8 flex items-center">
				{steps.map((step, idx) => {
					let isDisabled = false;
					// Disable future steps unless all previous steps are valid
					isDisabled = idx > currentStep && !allPrevStepsValid(idx);
					return (
						<button
							key={step.label}
							type="button"
							className={`flex items-center ${idx === currentStep ? "font-bold text-blue-600" : "text-gray-400"} ${isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
							onClick={async () => {
								// Only allow navigation to previous or current step
								if (idx <= currentStep) {
									setStepError(null);
									setCurrentStep(idx);
								} else {
									// Only allow navigating forward if all previous steps are valid
									let allPrevValid = true;
									for (let i = 0; i < idx; i++) {
										const valid = await form.trigger(stepFields[i]);
										if (!valid) {
											allPrevValid = false;
											break;
										}
									}
									if (allPrevValid) {
										setStepError(null);
										setCurrentStep(idx);
									} else {
										setStepError(
											"Please complete all previous steps before proceeding.",
										);
									}
								}
							}}
							disabled={isDisabled}
						>
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${idx === currentStep ? "border-blue-600" : "border-gray-300"}`}
							>
								{idx + 1}
							</div>
							<span className="ml-2">{step.label}</span>
							{idx < steps.length - 1 && (
								<div className="mx-4 h-1 w-8 bg-gray-200" />
							)}
						</button>
					);
				})}
			</div>
		);
	};

	// * Example props for KnowledgeBaseMain and OAuthMain (customize as needed)
	const voices: AssistantVoice[] = [];
	const handleVoiceSelect = (voiceId: string) => {};
	const handleScriptUpload = (scriptContent: string) => {};
	const handleEmailUpload = (emailContent: string) => {};
	const selectedScriptFileName = "";
	const selectedEmailFileName = "";
	const loading = false;
	const initialData = undefined;

	return (
		<FormProvider {...form}>
			<div className="flex flex-col gap-8 p-8">
				<h2 className="mb-4 font-bold text-xl">Profile Stepper</h2>
				<StepperHeader />
				{/* Show required fields for the current step at the top of the form */}
				<div className="mb-4">
					<span className="font-semibold">Required fields:</span>
					<ul className="flex flex-wrap gap-2">
						{stepFields[currentStep].map((field) => {
							const hasError = !!form.getFieldState(field).error;
							return (
								<li
									key={field}
									className={
										hasError
											? "border-red-400 border-b-2 font-semibold text-red-500"
											: "text-orange-400 dark:text-gray-200"
									}
								>
									{fieldLabels[field] || field}
									<span className="mx-2 font-bold text-gray-400">|</span>
								</li>
							);
						})}
					</ul>
				</div>
				{/* Render the current step's component with its props */}
				{currentStep === 0 && <PersonalInformationFormMain loading={loading} />}
				{currentStep === 1 && (
					<BaseSetupMain loading={loading} initialData={initialData} />
				)}
				{currentStep === 2 && (
					<KnowledgeBaseMain
						loading={loading}
						handleVoiceSelect={handleVoiceSelect}
						handleScriptUpload={handleScriptUpload}
						selectedScriptFileName={selectedScriptFileName}
						handleEmailUpload={handleEmailUpload}
						selectedEmailFileName={selectedEmailFileName}
						initialData={initialData}
					/>
				)}
				{currentStep === 3 && (
					<OAuthMain loading={loading} initialData={initialData} />
				)}
				<div className="mt-8 flex flex-col gap-2">
					{stepError && (
						<div className="mb-2 text-red-500 text-sm">{stepError}</div>
					)}
					<div className="flex justify-between">
						<button
							type="button"
							className="rounded bg-gray-100 px-4 py-2 text-gray-700 disabled:opacity-50"
							disabled={currentStep === 0}
							onClick={() => {
								setStepError(null);
								goToStep(Math.max(0, currentStep - 1));
							}}
						>
							Back
						</button>
						{/* --- Next button with strict step validation --- */}
						{(() => {
							const watchedFields = form.watch(stepFields[currentStep]);
							const isCurrentStepValid =
								stepFields[currentStep].length === 0 ||
								stepFields[currentStep].every((field, i) => {
									const value = watchedFields?.[i];
									return (
										value !== undefined &&
										value !== "" &&
										!form.getFieldState(field).error
									);
								});

							// Find invalid fields for the current step
							const invalidFields = stepFields[currentStep].filter((field) => {
								const state = form.getFieldState(field);
								return state.error;
							});

							return (
								<div className="flex flex-col items-end">
									<button
										type="button"
										className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
										disabled={
											currentStep === steps.length - 1 || !isCurrentStepValid
										}
										onClick={async () => {
											setStepError(null);
											const valid = await form.trigger(stepFields[currentStep]);
											if (!valid) {
												setStepError(
													"Please fill in all required fields for this step.",
												);
												return;
											}
											goToStep(Math.min(steps.length - 1, currentStep + 1));
										}}
									>
										Next
									</button>
									{/* Show invalid fields as a hint if Next is disabled */}
									{!isCurrentStepValid && invalidFields.length > 0 && (
										<div className="mt-2 text-right text-red-500 text-xs">
											<span className="font-semibold">Fields to fix:</span>
											<ul className="ml-4 list-disc">
												{invalidFields.map((field) => (
													<li key={field}>{fieldLabels[field] || field}</li>
												))}
											</ul>
										</div>
									)}
								</div>
							);
						})()}
					</div>
				</div>
			</div>
		</FormProvider>
	);
};

export default ProfileStepper;
