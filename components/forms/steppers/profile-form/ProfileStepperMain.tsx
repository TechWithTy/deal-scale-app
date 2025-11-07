"use client";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/dashboard";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import { profileSchema } from "@/types/zod/userSetup/profile-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { OAuthMain } from "./steps/Oauth/OAuthMain";
import { BaseSetupMain } from "./steps/base/BaseSetupMain";
import { KnowledgeBaseMain } from "./steps/knowledge/KnowledgeBaseMain";
import { PersonalInformationFormMain } from "./steps/personal_information/PersonalInformationFormMain";
// * Step definitions: label and component for each step
const stepHashes = [
	"profile-info", // Step 0
	"company-info", // Step 1
	"knowledgebase", // Step 2
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
	const { openSecurityModal } = useModalStore();
	const [currentStep, setCurrentStep] = useState(0);
	// Force a fresh form instance on first mount to avoid stale values
	const [formKey] = useState(() => `profile-form-${Date.now()}`);
	const [isSaving, setIsSaving] = useState(false);
	const [bypassValidation, setBypassValidation] = useState(false);

	// Helper to navigate to a step and update the hash
	const goToStep = (stepIdx: number) => {
		setCurrentStep(stepIdx);
		const hash = stepHashes[stepIdx];
		// Use window.history for hash navigation to avoid RSC fetch errors
		if (typeof window !== "undefined") {
			window.history.replaceState(null, "", `${pathname}#${hash}`);
		}
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

	// Centralized empty defaults to ensure a clean form on mount
	const emptyDefaults: Partial<ProfileFormValues> = useMemo(
		() =>
			({
				firstName: "",
				lastName: "",
				email: "",
				personalNum: "",
				companyName: "",
				companyWebsite: "",
				profileType: "" as any,
				profileGoal: "",
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
				notifications: {
					emailNotifications: false,
					smsNotifications: false,
					notifyForNewLeads: false,
					notifyForCampaignUpdates: false,
					textNotifications: false,
					autoResponse: false,
					callRecording: false,
				},
				platformSettings: {
					callTransferBufferTime: undefined,
					textBufferPeriod: undefined,
					workingHoursStart: "",
					workingHoursEnd: "",
					timezone: "",
					maxConcurrentConversations: 5,
				},
			}) as Partial<ProfileFormValues>,
		[],
	);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: emptyDefaults,
		shouldUnregister: true,
		mode: "onChange",
	});

	// Ensure we reset to clean defaults on mount so prior values don't persist
	useEffect(() => {
		form.reset(emptyDefaults);
	}, [form, emptyDefaults]);

	// * Stepper header UI
	// Only include required and rendered fields for each step
	const stepFields: (keyof ProfileFormValues)[][] = [
		["firstName", "lastName", "email", "personalNum", "state", "city"], // Step 0
		[
			"profileType",
			"profileGoal",
			"companyName",
			"companyLogo",
			"companyAssets",
			"leadForwardingNumber",
			"platformSettings.workingHoursStart",
			"platformSettings.workingHoursEnd",
			"platformSettings.timezone",
			"platformSettings.maxConcurrentConversations",
		], // Step 1
		["selectedVoice", "exampleSalesScript"], // Step 2 (adjust if any are optional)
		[], // Step 3 (OAuth, add required fields if any)
	];

	// Helper to map field names to user-friendly labels for error hints
	const fieldLabels: Record<string, string> = {
		firstName: "First Name",
		lastName: "Last Name",
		email: "Email",
		personalNum: "Personal Phone Number",
		profileType: "Profile Type",
		profileGoal: "Primary Goal",
		companyName: "Company Name",
		companyWebsite: "Company Website",
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
		"platformSettings.workingHoursStart": "Working Hours Start",
		"platformSettings.workingHoursEnd": "Working Hours End",
		"platformSettings.timezone": "Timezone",
		"platformSettings.maxConcurrentConversations":
			"Max Concurrent Conversations",
	};

	const StepperHeader = () => {
		return (
			<div className="mb-8 flex items-center overflow-x-auto">
				{steps.map((step, idx) => {
					const isCompleted = idx < currentStep;
					const isCurrent = idx === currentStep;
					return (
						<button
							key={step.label}
							type="button"
							className={`flex items-center ${isCurrent ? "font-bold text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"} cursor-pointer`}
							onClick={() => {
								setStepError(null);
								goToStep(idx);
							}}
						>
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${isCurrent ? "border-blue-600 bg-blue-50" : isCompleted ? "border-green-600 bg-green-50" : "border-gray-300"}`}
							>
								{isCompleted ? "✓" : idx + 1}
							</div>
							<span className="ml-2 whitespace-nowrap">{step.label}</span>
							{idx < steps.length - 1 && (
								<div
									className={`mx-4 h-1 w-8 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
								/>
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

	// Handle form submission
	const onSubmit = async (data: ProfileFormValues) => {
		setIsSaving(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			toast.success("Profile saved successfully!");
			console.log("Profile data:", data);
			// TODO: Replace with actual API call
		} catch (error) {
			toast.error("Failed to save profile. Please try again.");
			console.error("Save error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<FormProvider key={formKey} {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-8 p-8"
			>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="font-bold text-xl">Profile Settings</h2>
						<p className="text-gray-500 text-sm">
							Configure your profile and platform settings
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setBypassValidation((v) => !v)}
							className={`gap-2 ${bypassValidation ? "bg-accent" : ""}`}
							title="Toggle to bypass validation and freely navigate steps"
						>
							{bypassValidation ? "Bypass: ON" : "Bypass: OFF"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={openSecurityModal}
							className="gap-2"
						>
							<Shield className="h-4 w-4" />
							Security Settings
						</Button>
					</div>
				</div>
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
						{/* --- Next/Save button --- */}
						{(() => {
							const watchedFields = form.watch(stepFields[currentStep]);
							const isCurrentStepValid =
								bypassValidation ||
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

							const isLastStep = currentStep === steps.length - 1;

							return (
								<div className="flex flex-col items-end">
									{isLastStep ? (
										<button
											type="submit"
											className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
											disabled={isSaving}
										>
											{isSaving ? "Saving..." : "Save Profile"}
										</button>
									) : (
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
											disabled={!isCurrentStepValid}
											onClick={async () => {
												setStepError(null);
												if (!bypassValidation) {
													const valid = await form.trigger(
														stepFields[currentStep],
													);
													if (!valid) {
														setStepError(
															"Please fill in all required fields for this step.",
														);
														return;
													}
												}
												goToStep(Math.min(steps.length - 1, currentStep + 1));
											}}
										>
											Next
										</button>
									)}
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
			</form>
		</FormProvider>
	);
};

export default ProfileStepper;
