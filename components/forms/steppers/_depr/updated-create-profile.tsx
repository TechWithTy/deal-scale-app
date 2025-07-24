// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";
// import { campaignSteps } from "@/_tests/tours/campaignTour";
// import {
// 	getNotificationPreferences,
// 	getTwoFactorAuth,
// 	getUserPreferences,
// 	updateUserProfile,
// } from "@/actions/_depr/_old_user";
// import WalkThroughModal from "@/components/reusables/tutorials/walkthroughModal";
// import { Button } from "@/components/ui/button";
// import {
// 	Form,
// 	FormControl,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage,
// } from "@/components/ui/form";
// import { Heading } from "@/components/ui/heading";
// import { Input } from "@/components/ui/input";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch";
// import { mockVoices } from "@/constants/_faker/_api/vapi/assistant";
// import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
// import { cn } from "@/lib/_utils/kanban/utils";
// import { useUserProfileStore } from "@/lib/stores/user/userProfile";
// import {
// 	NotificationPreferences,
// 	TwoFactorAuth,
// 	type UserProfile,
// } from "@/types/userProfile";
// import {
// 	type ProfileFormValues,
// 	profileSchema,
// } from "@/types/zod/userSetup/profile-form-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { City, State } from "country-state-city";
// import { HelpCircle, Trash } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useMemo } from "react"; // ✅ Import useMemo
// import { useForm } from "react-hook-form";
// import {
// 	FacebookLoginButton,
// 	InstagramLoginButton,
// 	LinkedInLoginButton,
// 	TwitterLoginButton,
// } from "react-social-login-buttons";
// import { toast } from "sonner";
// import { v4 as uuidv4 } from "uuid";
// import { uuid } from "uuidv4";
// import { updatePersonalInfoUtil } from "./utils/_data/updateProfile";
// import {
// 	type InitialOauthSetupData,
// 	extractOAuthDataFromUserProfile,
// } from "./utils/const/connectedAccounts";
// import {
// 	type InitialBaseSetupData,
// 	extractInitialBaseDataFromUserProfile,
// } from "./utils/const/getBasetProfile";
// import {
// 	type InitialKnowledgeBaseData,
// 	extractInitialKnowledgeBaseDataFromUserProfile,
// } from "./utils/const/getKnowledgeBase";
// import type { InitialProfileData } from "./utils/const/getProfileInfo";
// import { DynamicFileUpload } from "./utils/files/dynamicUploadFiles";
// import HashtagInput from "./utils/socials/hashtags";
// import VoiceSelector from "./utils/voice/selector";
// import { UploadEmailBody } from "./utils/voice/uploadEmailBody";
// import UploadSalesScript from "./utils/voice/uploadScript";
// const twoFactorAuthOptions = [
// 	// { name: 'twoFactorAuth.sms', label: 'SMS' },
// 	// { name: 'twoFactorAuth.email', label: 'Email ' },
// 	{ name: "twoFactorAuth.authenticatorApp", label: "Authenticator App" },
// ];

// const notificationOptions = [
// 	{ name: "notifications.emailNotifications", label: "Email " },
// 	{ name: "notifications.smsNotifications", label: "SMS" },
// 	{ name: "notifications.notifyForNewLeads", label: "New Leads" },
// 	{ name: "notifications.notifyForCampaignUpdates", label: "Campaign Updates" },
// ];
// interface ProfileFormType {
// 	initialData?: UserProfile;
// }

// // 1. Profile Heading Component
// const ProfileHeading: React.FC<{
// 	title: string;
// 	description: string;
// 	loading: boolean;
// 	onDelete: () => void;
// 	showDeleteButton: boolean;
// }> = ({ title, description, loading, onDelete, showDeleteButton }) => (
// 	<div className="flex flex-col items-center justify-between text-center sm:flex-row sm:text-left">
// 		<Heading title={title} description={description} />
// 		{showDeleteButton && (
// 			<Button
// 				disabled={loading}
// 				variant="destructive"
// 				size="sm"
// 				onClick={onDelete}
// 				className="mt-2 sm:mt-0"
// 			>
// 				<Trash className="h-4 w-4" />
// 			</Button>
// 		)}
// 	</div>
// );

// // 2. Personal Information Form Component

// export const PersonalInformationForm: React.FC<{
// 	form: any;
// 	loading: boolean;
// 	initialData?: InitialProfileData;
// }> = ({ form, loading, initialData }) => {
// 	const { userProfile } = useUserProfileStore();
// 	const [isFormInitialized, setIsFormInitialized] = useState(false);

// 	// console.warn("[DEBUG] userProfile:", userProfile);

// 	// Track 'state' field
// 	const selectedState = form.watch("state");

// 	// Country/state/city data
// 	const countryCode = "US";
// 	const stateList =
// 		State.getStatesOfCountry(countryCode)?.map((st) => ({
// 			id: st.isoCode,
// 			name: st.name,
// 		})) || [];
// 	const cityList =
// 		City.getCitiesOfState(countryCode, selectedState)?.map((city) => ({
// 			id: city.name,
// 			name: city.name,
// 		})) || [];

// 	return (
// 		<>
// 			<FormField
// 				control={form.control}
// 				name="firstName"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>First Name</FormLabel>
// 						<FormControl>
// 							<Input disabled={loading} placeholder="John" {...field} />
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<FormField
// 				control={form.control}
// 				name="lastName"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Last Name</FormLabel>
// 						<FormControl>
// 							<Input disabled={loading} placeholder="Doe" {...field} />
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<FormField
// 				control={form.control}
// 				name="email"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Email</FormLabel>
// 						<FormControl>
// 							<Input
// 								disabled={loading}
// 								placeholder="johndoe@gmail.com"
// 								{...field}
// 							/>
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<FormField
// 				control={form.control}
// 				name="personalNum"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Personal Phone Number</FormLabel>
// 						<FormControl>
// 							<Input
// 								type="number"
// 								placeholder="Enter your phone number"
// 								disabled={loading}
// 								{...field}
// 							/>
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>
// 			<FormField
// 				control={form.control}
// 				name="state"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>State</FormLabel>
// 						<Select
// 							disabled={loading}
// 							onValueChange={field.onChange}
// 							value={field.value}
// 							defaultValue={field.value}
// 						>
// 							<FormControl>
// 								<SelectTrigger>
// 									<SelectValue placeholder="Select a state" />
// 								</SelectTrigger>
// 							</FormControl>
// 							<SelectContent
// 								position="popper"
// 								side="bottom"
// 								avoidCollisions={false}
// 								className="max-h-56 overflow-y-auto"
// 							>
// 								{stateList.map((state) => (
// 									<SelectItem key={state.id} value={state.id}>
// 										{state.name}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>
// 			<FormField
// 				control={form.control}
// 				name="city"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>City</FormLabel>
// 						<Select
// 							disabled={loading}
// 							onValueChange={field.onChange}
// 							value={field.value}
// 							defaultValue={field.value}
// 						>
// 							<FormControl>
// 								<SelectTrigger>
// 									<SelectValue
// 										defaultValue={field.value}
// 										placeholder="Select a city"
// 									/>
// 								</SelectTrigger>
// 							</FormControl>
// 							<SelectContent
// 								position="popper"
// 								side="bottom"
// 								avoidCollisions={false}
// 								className="max-h-64 overflow-y-auto"
// 							>
// 								{cityList.map((city) => (
// 									<SelectItem key={city.id} value={city.id}>
// 										{city.name}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			{/* Two-Factor Authentication (2FA) Section */}
// 			<div className="space-y-4">
// 				<h3 className="font-medium text-lg">Two-Factor Authentication (2FA)</h3>
// 				<div className="space-y-4">
// 					{twoFactorAuthOptions.map((option) => (
// 						<FormField
// 							key={option.name}
// 							control={form.control}
// 							name={`twoFactorAuth.methods.${option.name}`} // ✅ FIXED FIELD NAME
// 							render={({ field }) => (
// 								<FormItem>
// 									<div className="flex items-center justify-between space-x-4">
// 										<FormLabel className="flex-shrink-0">
// 											{option.label}
// 										</FormLabel>
// 										<FormControl>
// 											<Switch
// 												checked={field.value ?? false} // ✅ Avoid undefined
// 												onCheckedChange={field.onChange}
// 												disabled={loading}
// 											/>
// 										</FormControl>
// 									</div>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 					))}
// 				</div>
// 			</div>

// 			{/* Notifications Section */}
// 			<div className="space-y-4">
// 				<h3 className="font-medium text-lg">Notifications</h3>
// 				<div className="space-y-4">
// 					{notificationOptions.map((option) => (
// 						<FormField
// 							key={option.name}
// 							control={form.control}
// 							name={`notifications.${option.name}`} // ✅ FIXED FIELD NAME
// 							render={({ field }) => (
// 								<FormItem>
// 									<div className="flex items-center justify-between space-x-4">
// 										<FormLabel className="flex-shrink-0">
// 											{option.label}
// 										</FormLabel>
// 										<FormControl>
// 											<Switch
// 												checked={field.value ?? false} // ✅ Avoid undefined
// 												onCheckedChange={field.onChange}
// 												disabled={loading}
// 											/>
// 										</FormControl>
// 									</div>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 					))}
// 				</div>
// 			</div>
// 		</>
// 	);
// };

// const BaseSetup: React.FC<{
// 	form: any;
// 	loading: boolean;
// 	initialData?: InitialBaseSetupData; // Add the optional initialData prop
// 	voices: AssistantVoice[]; // Add voices prop for VoiceSelector
// 	handleVoiceSelect: (voiceId: string) => void; // Voice select handler
// 	handleScriptUpload: (scriptContent: string) => void; // Script upload handler
// 	selectedScriptFileName: string; // Selected script file name
// 	handleEmailUpload: (emailContent: string) => void; // Email upload handler
// 	selectedEmailFileName: string; // Selected email file name
// }> = ({ form, loading, initialData }) => {
// 	// Populate form fields with initial data if it exists
// 	useEffect(() => {
// 		if (initialData) {
// 			form.setValue("companyName", initialData.companyName || "");
// 			form.setValue("companyLogo", initialData.companyLogo || "");
// 			form.setValue(
// 				"outreachEmailAddress",
// 				initialData.outreachEmailAddress || "",
// 			);
// 			form.setValue(
// 				"leadForwardingNumber",
// 				initialData.leadForwardingNumber || "",
// 			);
// 			form.setValue(
// 				"companyExplainerVideoUrl",
// 				initialData.companyExplainerVideoUrl || "",
// 			);
// 			form.setValue("companyAssets", initialData.companyAssets || []);
// 		}

// 		// Log all form values after setting all fields
// 	}, [initialData, form]);

// 	const [isReplacingLogo, setIsReplacingLogo] = useState(false); // Track if the user wants to replace the logo
// 	const [isEditingAssets, setIsEditingAssets] = useState(false); // State to toggle editing assets
// 	// Extract the initial logo URL or file from form state
// 	const logoFromForm = form.watch("companyLogo");
// 	const assetsFromForm = form.watch("companyAssets") || [];

// 	// Handle deleting an asset
// 	const handleDeleteAsset = (index: number) => {
// 		const updatedAssets = assetsFromForm.filter(
// 			(_: any, i: number) => i !== index,
// 		);
// 		form.setValue("companyAssets", updatedAssets); // Update form state
// 	};
// 	return (
// 		<>
// 			<FormField
// 				control={form.control}
// 				name="companyName"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Company name</FormLabel>
// 						<FormControl>
// 							<Input disabled={loading} placeholder="Apex Company" {...field} />
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<FormField
// 				control={form.control}
// 				name="companyLogo"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Company Logo</FormLabel>
// 						<FormControl>
// 							{/* Check if logo is a string (URL) */}
// 							{logoFromForm && !isReplacingLogo ? (
// 								<div className="relative flex flex-col items-center justify-center">
// 									{" "}
// 									{/* Display the existing logo from URL */}
// 									{typeof logoFromForm === "string" ? (
// 										<Image
// 											src={logoFromForm}
// 											alt="Company Logo"
// 											className="mb-4 h-32 w-32 rounded-lg object-cover"
// 											width={300}
// 											height={300}
// 										/>
// 									) : (
// 										<p>No logo available</p>
// 									)}
// 									{/* Replace Button */}
// 									<button
// 										type="button"
// 										onClick={() => setIsReplacingLogo(true)} // Enable replacing the logo
// 										className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
// 									>
// 										Replace Logo
// 									</button>
// 								</div>
// 							) : (
// 								// Show file input to replace logo
// 								<div>
// 									<input
// 										type="file"
// 										accept="image/*"
// 										disabled={loading}
// 										onChange={(e) => {
// 											if (e.target.files && e.target.files[0]) {
// 												const file = e.target.files[0];
// 												field.onChange(file); // Update form state with new file
// 												setIsReplacingLogo(false); // Hide input after selecting a file
// 											}
// 										}}
// 										className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
// 									/>
// 								</div>
// 							)}
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<FormField
// 				control={form.control}
// 				name="outreachEmailAddress"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Outreach Email</FormLabel>
// 						<FormControl>
// 							<Input
// 								disabled={loading}
// 								placeholder="johndoe@gmail.com"
// 								{...field}
// 							/>
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<FormField
// 				control={form.control}
// 				name="leadForwardingNumber"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Forwarding Phone Number</FormLabel>
// 						<FormControl>
// 							<Input
// 								type="number"
// 								placeholder="Enter your phone number"
// 								disabled={loading}
// 								{...field}
// 							/>
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			{/* Company Explainer Video Upload */}
// 			<FormField
// 				control={form.control}
// 				name="companyExplainerVideoUrl"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Company Explainer Video URL</FormLabel>
// 						<FormControl>
// 							<Input
// 								type="url"
// 								disabled={loading}
// 								placeholder="https://example.com/video"
// 								{...field} // Bind the field to the form state
// 							/>
// 						</FormControl>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			<div className="mt-4 md:text-center">
// 				<FormField
// 					control={form.control}
// 					name="companyAssets"
// 					render={({ field, fieldState: { error } }) => (
// 						<FormItem>
// 							<FormLabel>Company Assets</FormLabel>

// 							{!isEditingAssets && assetsFromForm.length > 0 ? (
// 								<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
// 									{/* Display preview of assets */}
// 									{assetsFromForm.map((asset: File | string, index: number) => (
// 										<div key={index} className="relative inline-block">
// 											{/* Differentiate between File objects and URLs */}
// 											{asset instanceof File ? (
// 												// If it's a File object, use URL.createObjectURL to preview it
// 												<Image
// 													src={URL.createObjectURL(asset)}
// 													alt={`Asset ${index + 1}`}
// 													className="mb-4 rounded-lg object-cover"
// 													width={100}
// 													height={100}
// 													onLoadingComplete={() => {
// 														// Ensure proper layout after the image has loaded
// 														const button = document.getElementById(
// 															`delete-btn-${index}`,
// 														);
// 														if (button) {
// 															button.style.visibility = "visible"; // Make the delete button visible
// 														}
// 													}}
// 												/>
// 											) : (
// 												// If it's a URL (string), render it directly
// 												<Image
// 													src={asset as string}
// 													alt={`Asset ${index + 1}`}
// 													className="mb-4 rounded-lg object-cover"
// 													width={100}
// 													height={100}
// 													onLoadingComplete={() => {
// 														const button = document.getElementById(
// 															`delete-btn-${index}`,
// 														);
// 														if (button) {
// 															button.style.visibility = "visible"; // Make the delete button visible
// 														}
// 													}}
// 												/>
// 											)}

// 											{/* X Icon for Deleting */}
// 											<button
// 												id={`delete-btn-${index}`}
// 												type="button"
// 												onClick={() => handleDeleteAsset(index)} // Delete asset
// 												className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
// 												style={{ visibility: "hidden" }} // Initially hide the button until the image is loaded
// 											>
// 												<svg
// 													xmlns="http://www.w3.org/2000/svg"
// 													className="h-4 w-4"
// 													fill="none"
// 													viewBox="0 0 24 24"
// 													stroke="currentColor"
// 													strokeWidth="2"
// 												>
// 													<path
// 														strokeLinecap="round"
// 														strokeLinejoin="round"
// 														d="M6 18L18 6M6 6l12 12"
// 													/>
// 												</svg>
// 											</button>
// 										</div>
// 									))}

// 									{/* Add Images Button */}
// 									<div className="col-span-2 md:col-span-1">
// 										<button
// 											type="button"
// 											onClick={() => setIsEditingAssets(true)} // Enable adding more assets
// 											className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 										>
// 											Add More Images
// 										</button>
// 									</div>
// 								</div>
// 							) : (
// 								// If no assets or in edit mode, show the DynamicFileUpload component
// 								<div>
// 									<DynamicFileUpload
// 										onFilesUpload={(files) => {
// 											field.onChange([...assetsFromForm, ...files]); // Append new files to existing assets
// 											setIsEditingAssets(false); // Hide input after uploading
// 										}}
// 										allowedFileTypes={["jpg", "jpeg", "png", "webp"]}
// 										minFiles={3}
// 										maxFiles={12}
// 										selectedFiles={assetsFromForm}
// 									/>
// 								</div>
// 							)}

// 							<FormMessage>{error?.message}</FormMessage>
// 						</FormItem>
// 					)}
// 				/>
// 			</div>
// 		</>
// 	);
// };

// interface KnowledgeBaseSetupProps {
// 	form: any;
// 	loading: boolean;
// 	voices: AssistantVoice[]; // Add voices prop for VoiceSelector
// 	handleVoiceSelect: (voiceId: string) => void; // Voice select handler
// 	handleScriptUpload: (scriptContent: string) => void; // Script upload handler
// 	selectedScriptFileName: string; // Selected script file name
// 	handleEmailUpload: (emailContent: string) => void; // Email upload handler
// 	selectedEmailFileName: string; // Selected email file name
// 	initialData?: InitialKnowledgeBaseData; // Optional initial data to pre-fill the form
// }

// const KnowledgeBaseSetup: React.FC<KnowledgeBaseSetupProps> = ({
// 	form,
// 	loading,
// 	voices,
// 	handleVoiceSelect,
// 	handleScriptUpload,
// 	selectedScriptFileName,
// 	handleEmailUpload,
// 	selectedEmailFileName,
// 	initialData, // New prop for pre-filled data
// }) => {
// 	const [showVoiceCloneModal, setShowVoiceCloneModal] = useState(false);
// 	const [showVoicemailModal, setShowVoicemailModal] = useState(false);

// 	useEffect(() => {
// 		if (initialData) {
// 			// Prefill form values from initial data
// 			form.setValue("selectedVoice", initialData.selectedVoice || "");
// 			form.setValue("exampleSalesScript", initialData.exampleSalesScript || "");
// 			form.setValue("exampleEmailBody", initialData.exampleEmailBody || "");
// 			form.setValue(
// 				"voicemailRecordingId",
// 				initialData.voicemailRecordingId || "",
// 			);
// 			form.setValue("clonedVoiceId", initialData.clonedVoiceId || "");
// 		}
// 	}, [initialData, form]);

// 	// Handle voicemail recording logic
// 	const handleVoicemailRecording = (recordingId: string) => {
// 		form.setValue("voicemailRecordingId", recordingId); // Store the voicemail recording ID in the form
// 		setShowVoicemailModal(false); // Close the modal
// 		// console.log('Voicemail recorded with ID:', recordingId);
// 	};

// 	// Handle voice clone recording logic
// 	const handleVoiceCloneRecording = (recordingId: string) => {
// 		form.setValue("clonedVoiceId", recordingId); // Store the voice clone recording ID in the form
// 		setShowVoiceCloneModal(false); // Close the modal
// 		// console.log('Voice clone recorded with ID:', recordingId);
// 	};

// 	return (
// 		<>
// 			{/* Voice Selection Field */}
// 			<FormField
// 				control={form.control}
// 				name="selectedVoice"
// 				render={({ field }) => (
// 					<FormItem>
// 						<FormLabel>Select Voice (Optional)</FormLabel>
// 						<VoiceSelector
// 							voices={voices}
// 							onVoiceSelect={(voiceId: string) => {
// 								field.onChange(voiceId); // Update the form state when a voice is selected
// 								handleVoiceSelect(voiceId); // Call the original handler to handle side-effects
// 							}}
// 						/>
// 						<FormMessage />
// 					</FormItem>
// 				)}
// 			/>

// 			{/* Upload Sales Script Field */}
// 			<FormField
// 				control={form.control}
// 				name="exampleSalesScript"
// 				render={({ field, fieldState: { error } }) => (
// 					<FormItem>
// 						<FormLabel>Upload Sales Script (Optional)</FormLabel>

// 						{field.value ? (
// 							<div className="flex items-center justify-between">
// 								{/* Show the Replace Button if a script is already uploaded */}
// 								<button
// 									type="button"
// 									className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 									onClick={() => field.onChange(null)} // Reset the value to allow replacement
// 								>
// 									Replace Script{" "}
// 									{selectedScriptFileName && `${selectedScriptFileName}`}
// 								</button>
// 							</div>
// 						) : (
// 							// Show the Upload Component when there is no value
// 							<UploadSalesScript
// 								onFileUpload={(fileContent: string) => {
// 									field.onChange(fileContent); // Update form state with file content
// 									handleScriptUpload(fileContent); // Handle file upload
// 								}}
// 								selectedFileName={selectedScriptFileName} // Show the selected file name
// 							/>
// 						)}

// 						<FormMessage>{error?.message}</FormMessage>
// 					</FormItem>
// 				)}
// 			/>

// 			{/* Upload Email Body Field */}
// 			<FormField
// 				control={form.control}
// 				name="exampleEmailBody"
// 				render={({ field, fieldState: { error } }) => (
// 					<FormItem>
// 						<FormLabel>Upload Email Body (Optional)</FormLabel>

// 						{field.value ? (
// 							<div className="flex items-center justify-between">
// 								{/* Show the Replace Button if an email body is already uploaded */}
// 								<button
// 									type="button"
// 									className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 									onClick={() => field.onChange(null)} // Reset the value to allow replacement
// 								>
// 									Replace Email Body{" "}
// 									{selectedEmailFileName && `${selectedEmailFileName}`}
// 								</button>
// 							</div>
// 						) : (
// 							// Show the Upload Component when there is no value
// 							<UploadEmailBody
// 								onFileUpload={(fileContent: string) => {
// 									field.onChange(fileContent); // Update form state with file content
// 									handleEmailUpload(fileContent); // Handle file upload
// 								}}
// 								selectedFileName={selectedEmailFileName} // Show the selected file name
// 							/>
// 						)}

// 						<FormMessage>{error?.message}</FormMessage>
// 					</FormItem>
// 				)}
// 			/>

// 			{/* Voicemail Recording Field */}
// 			<FormField
// 				control={form.control}
// 				name="voicemailRecordingId"
// 				render={({ field, fieldState: { error } }) => (
// 					<FormItem>
// 						<FormLabel>Record Voicemail (1m - 5m)</FormLabel>

// 						{field.value ? (
// 							<div className="flex items-center justify-between">
// 								{/* Show the Replace Button if a voicemail is already recorded */}
// 								<button
// 									type="button"
// 									className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 									onClick={() => field.onChange(null)} // Reset the value to allow re-recording
// 								>
// 									Replace Voicemail
// 								</button>
// 							</div>
// 						) : (
// 							// Show the Recording Button if no voicemail exists
// 							<button
// 								type="button"
// 								className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 								onClick={() => setShowVoicemailModal(true)}
// 							>
// 								Record Voicemail
// 							</button>
// 						)}

// 						<FormMessage>{error?.message}</FormMessage>
// 					</FormItem>
// 				)}
// 			/>

// 			{/* Voice Clone Recording Field */}
// 			<FormField
// 				control={form.control}
// 				name="clonedVoiceId"
// 				render={({ field, fieldState: { error } }) => (
// 					<FormItem>
// 						<FormLabel>Record Voice Clone (5m - 10m)</FormLabel>

// 						{field.value ? (
// 							<div className="flex items-center justify-between">
// 								{/* Show the Replace Button if a voice clone is already recorded */}
// 								<button
// 									type="button"
// 									className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 									onClick={() => field.onChange(null)} // Reset the value to allow re-recording
// 								>
// 									Replace Voice Clone
// 								</button>
// 							</div>
// 						) : (
// 							// Show the Recording Button if no voice clone exists
// 							<button
// 								type="button"
// 								className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
// 								onClick={() => setShowVoiceCloneModal(true)}
// 							>
// 								Record Voice Clone
// 							</button>
// 						)}

// 						<FormMessage>{error?.message}</FormMessage>
// 					</FormItem>
// 				)}
// 			/>
// 		</>
// 	);
// };

// const OAuthSetup: React.FC<{
// 	form: any;
// 	loading: boolean;
// 	initialData?: InitialOauthSetupData; // Optional initial data for OAuth and social media tags
// }> = ({ form, loading, initialData }) => {
// 	const [metaData, setMetaData] = useState<any>(null); // Meta (Facebook) OAuth data
// 	const [instagramData, setInstagramData] = useState<any>(null); // Instagram OAuth data
// 	const [twitterData, setTwitterData] = useState<any>(null); // Twitter OAuth data
// 	const [linkedInData, setLinkedInData] = useState<any>(null); // LinkedIn OAuth data

// 	// Extract initial OAuth and social media tag data from the profile
// 	useEffect(() => {
// 		if (initialData) {
// 			// Set the initial OAuth data
// 			setMetaData(initialData.connectedAccounts.facebook);
// 			setInstagramData(initialData.connectedAccounts.instagram);
// 			setTwitterData(initialData.connectedAccounts.twitter);
// 			setLinkedInData(initialData.connectedAccounts.linkedIn);

// 			// Set the form values for connected accounts and social media tags
// 			form.setValue("meta", initialData.connectedAccounts.facebook);
// 			form.setValue("instagram", initialData.connectedAccounts.instagram);
// 			form.setValue("twitter", initialData.connectedAccounts.twitter);
// 			form.setValue("linkedIn", initialData.connectedAccounts.linkedIn);
// 			form.setValue("socialMediatags", initialData.socialMediaTags || []);
// 		}
// 	}, [initialData, form]);

// 	// Simulate OAuth login flow for different services
// 	const handleOAuthLogin = (service: string) => {
// 		const simulatedOAuthData = {
// 			accessToken: "abc123",
// 			refreshToken: "def456",
// 			expiresIn: 3600,
// 			tokenType: "Bearer",
// 			scope: "user_profile",
// 		};

// 		switch (service) {
// 			case "meta":
// 				setMetaData(simulatedOAuthData);
// 				form.setValue("meta", simulatedOAuthData); // Set the form value for Meta (Facebook) OAuth
// 				break;
// 			case "instagram":
// 				setInstagramData(simulatedOAuthData);
// 				form.setValue("instagram", simulatedOAuthData); // Set the form value for Instagram OAuth
// 				break;
// 			case "twitter":
// 				setTwitterData(simulatedOAuthData);
// 				form.setValue("twitter", simulatedOAuthData); // Set the form value for Twitter OAuth
// 				break;
// 			case "linkedIn":
// 				setLinkedInData(simulatedOAuthData);
// 				form.setValue("linkedIn", simulatedOAuthData); // Set the form value for LinkedIn OAuth
// 				break;
// 			default:
// 				break;
// 		}
// 	};

// 	// Render OAuth buttons with "Refresh Login" if logged in
// 	const renderOAuthButton = (
// 		serviceData: any,
// 		serviceName: string,
// 		buttonComponent: JSX.Element,
// 	) => {
// 		return (
// 			<FormField
// 				control={form.control}
// 				name={serviceName}
// 				render={({ field, fieldState: { error } }) => (
// 					<FormItem>
// 						<FormLabel>{`${
// 							serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
// 						} Login`}</FormLabel>
// 						{serviceData ? (
// 							// If user is already logged in, show Refresh Login button
// 							<div className="flex flex-col items-center justify-center">
// 								{" "}
// 								<p className="text-gray-600 text-sm dark:text-gray-300">
// 									You are logged in.
// 								</p>
// 								<button
// 									onClick={() => handleOAuthLogin(serviceName)}
// 									className="mt-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 dark:bg-blue-400 dark:focus:ring-blue-300 dark:hover:bg-blue-500"
// 								>
// 									Refresh Login
// 								</button>
// 							</div>
// 						) : (
// 							// Otherwise, show the regular login button
// 							buttonComponent
// 						)}
// 						<FormMessage>{error?.message}</FormMessage>
// 					</FormItem>
// 				)}
// 			/>
// 		);
// 	};

// 	return (
// 		<>
// 			{/* Meta (Facebook) OAuth */}
// 			{renderOAuthButton(
// 				metaData,
// 				"meta",
// 				<FacebookLoginButton onClick={() => handleOAuthLogin("meta")} />,
// 			)}

// 			{/* Instagram OAuth */}
// 			{renderOAuthButton(
// 				instagramData,
// 				"instagram",
// 				<InstagramLoginButton onClick={() => handleOAuthLogin("instagram")} />,
// 			)}

// 			{/* Twitter OAuth */}
// 			{renderOAuthButton(
// 				twitterData,
// 				"twitter",
// 				<TwitterLoginButton onClick={() => handleOAuthLogin("twitter")} />,
// 			)}

// 			{/* LinkedIn OAuth */}
// 			{renderOAuthButton(
// 				linkedInData,
// 				"linkedIn",
// 				<LinkedInLoginButton onClick={() => handleOAuthLogin("linkedIn")} />,
// 			)}

// 			{/* Hashtag Input */}
// 			<FormField
// 				control={form.control}
// 				name="socialMediatags"
// 				render={({ field, fieldState: { error } }) => (
// 					<FormItem>
// 						<HashtagInput
// 							form={form}
// 							loading={loading}
// 							minHashtags={5} // Minimum number of hashtags required
// 							maxHashtags={10} // Maximum number of hashtags allowed
// 							required={false} // Whether this field is required
// 						/>
// 						<FormMessage>{error?.message}</FormMessage>
// 					</FormItem>
// 				)}
// 			/>
// 		</>
// 	);
// };

// // 4. Step Navigation Component
// const StepNavigation: React.FC<{
// 	currentStep: number;
// 	stepsLength: number;
// 	next: () => void;
// 	prev: () => void;
// 	nextDisabled?: boolean;
// }> = ({ currentStep, stepsLength, next, prev, nextDisabled = false }) => (
// 	<div className="mt-8 flex justify-between pt-5">
// 		{/* Previous Button */}
// 		<button
// 			type="button"
// 			onClick={prev}
// 			disabled={currentStep === 0}
// 			className="rounded bg-white px-2 py-1 font-semibold text-sky-900 text-sm shadow-sm ring-1 ring-sky-300 ring-inset hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
// 		>
// 			Previous
// 		</button>

// 		{/* Next / Finish & Save Button */}
// 		<button
// 			type="button"
// 			onClick={next}
// 			disabled={nextDisabled}
// 			className={`rounded px-4 py-2 font-semibold text-sm shadow-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 ${
// 				currentStep === stepsLength - 1
// 					? "bg-blue-600 text-white"
// 					: "bg-white text-sky-900 ring-1 ring-sky-300 ring-inset"
// 			}`}
// 		>
// 			{currentStep === stepsLength - 1 ? "Finish & Save" : "Next"}
// 		</button>
// 	</div>
// );

// export const CreateProfileUpdated: React.FC<ProfileFormType> = ({
// 	initialData,
// }) => {
// 	const { userProfile } = useUserProfileStore(); // ✅ Fetch from Zustand store

// 	const router = useRouter();
// 	const [open, setOpen] = useState(false);
// 	const [loading, setLoading] = useState(false);
// 	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for help modal visibility
// 	const [isTourOpen, setIsTourOpen] = useState(false); // State for the tour

// 	const handleHelpCloseModal = () => setIsHelpModalOpen(false);
// 	const handleHelpStartTour = () => setIsTourOpen(true);
// 	const handleHelpCloseTour = () => setIsTourOpen(false);
// 	const [selectedScriptFileName, setSelectedScriptFileName] =
// 		useState<string>(""); // Track uploaded file name
// 	const [selectedEmailFileName, setSelectedEmailFileName] =
// 		useState<string>(""); // Track uploaded file name

// 	const title = initialData ? "Edit Your Profile" : "Create Profile";
// 	const description = initialData
// 		? "Edit your profile, change callback number script etc."
// 		: "Create your profile to optimize, your lead generation";
// 	const [currentStep, setCurrentStep] = useState(0);

// 	// const defaultValues = {
// 	//   jobs: [
// 	//     {
// 	//       jobtitle: '',
// 	//       employer: '',
// 	//       startdate: '',
// 	//       enddate: '',
// 	//       jobcountry: '',
// 	//       jobcity: ''
// 	//     }
// 	//   ]
// 	// };

// 	// useForm setup with Zod validation
// 	const form = useForm<ProfileFormValues>({
// 		resolver: zodResolver(profileSchema),
// 		mode: "onChange",
// 		reValidateMode: "onChange",
// 		defaultValues: useMemo(
// 			() => ({
// 				firstName: userProfile?.firstName || initialData?.firstName || "",
// 				lastName: userProfile?.lastName || initialData?.lastName || "",
// 				email: userProfile?.email || initialData?.email || "",
// 				personalNum:
// 					userProfile?.personalNum ||
// 					initialData?.personalNum ||
// 					"000-000-0000",
// 				state: userProfile?.state || initialData?.state || "", // 🚀 Persist state
// 				city: userProfile?.city || initialData?.city || "", // 🚀 Persist city
// 			}),
// 			[userProfile, initialData],
// 		), // ✅ Updates when userProfile or initialData change
// 	});

// 	const steps = [
// 		{
// 			id: "Personal Information",
// 			name: "Setup Profile",
// 			fields: [
// 				"firstName",
// 				"lastName",
// 				"email",
// 				"personalNum",
// 				"state",
// 				"city",
// 				"twoFactorAuth",
// 				"notifications",
// 			],
// 		},
// 		{
// 			id: "Upload Company Assets",
// 			name: "Setup Your Base",
// 			fields: [
// 				"companyName",
// 				"companyLogo",
// 				"companyExplainerVideoUrl",
// 				"companyAssets",
// 				"outreachEmailAddress",
// 				"leadForwardingNumber",
// 			],
// 		},
// 		{
// 			id: "Optimize Your Outreach",
// 			name: "Setup Ai Knowledgebase",
// 			fields: [
// 				"selectedVoice",
// 				"clonedVoiceId",
// 				"exampleSalesScript",
// 				"exampleEmailBody",
// 				"voicemailRecordingId",
// 			],
// 		},
// 		{
// 			id: "Connect Social Accounts",
// 			name: "Setup Tags & Accounts",
// 			fields: [
// 				"socialMediaCampaignAccounts.facebook", // Meta (Facebook)
// 				"socialMediaCampaignAccounts.twitter", // Twitter
// 				"socialMediaCampaignAccounts.instagram", // Instagram
// 				"socialMediaCampaignAccounts.linkedIn", // LinkedIn
// 				"socialMediatags",
// 			],
// 		},
// 	];

// 	const next = async () => {
// 		const stepFields = steps[currentStep].fields as (keyof ProfileFormValues)[];
// 		const fieldValues = form.getValues(); // Get all field values
// 		const isStepValid = await form.trigger(stepFields);

// 		if (!isStepValid) {
// 			console.warn(`⚠️ Step ${currentStep} validation failed.`);
// 			console.warn("🔹 stepFields:", stepFields);
// 			console.warn(
// 				"🔹 Field values:",
// 				stepFields.map((field) => ({ [field]: fieldValues[field] })),
// 			);
// 			console.log("🛠 twoFactorAuth Data:", form.getValues("twoFactorAuth"));
// 			console.error("❌ Validation Errors:", form.formState.errors);
// 			alert("failed");
// 			return;
// 		}

// 		try {
// 			setLoading(true); // ✅ Show loading state
// 			console.log("🔄 User:", JSON.stringify(userProfile, null, 2));

// 			console.log(`🔄 Updating profile for User ID: ${userProfile!.id}`);

// 			// ✅ Extract relevant form data and update the database
// 			const success = await updatePersonalInfoUtil(
// 				userProfile!.id,
// 				form.getValues(),
// 				setLoading,
// 			);

// 			if (!success) return; // ❌ Stop if update fails

// 			console.log(`✅ Profile updated successfully for step ${currentStep}`);

// 			if (currentStep === steps.length - 1) {
// 				toast.success("🎉 Profile setup completed! Redirecting...");
// 				router.push("/dashboard");
// 			} else {
// 				setCurrentStep((prevStep) => prevStep + 1);
// 				console.log(`➡️ Moving to step ${currentStep + 1}`);
// 			}
// 		} catch (error) {
// 			console.error("🚨 Unexpected profile update error:", error);
// 			toast.error("An unexpected error occurred.");
// 		} finally {
// 			setLoading(false); // ✅ Reset loading state
// 		}
// 	};

// 	const prev = () => {
// 		if (currentStep > 0) setCurrentStep((step) => step - 1);
// 	};

// 	const voices: AssistantVoice[] = mockVoices; // Generate 5 mock voices

// 	// Handle voice selection (use form.setValue to track selected voice)
// 	const handleVoiceSelect = (voiceId: string) => {
// 		form.setValue("selectedVoice", voiceId); // Update form state with selected voice
// 		// console.log('Selected voice:', voiceId);
// 	};

// 	// Function to handle file uploads for sales script
// 	const handleScriptUpload = (fileContent: string) => {
// 		form.setValue("exampleSalesScript", fileContent); // Update form state with sales script content
// 		// console.log('Uploaded Sales Script Content:', fileContent);
// 	};

// 	// Function to handle file uploads for email body
// 	const handleEmailUpload = (fileContent: string) => {
// 		form.setValue("exampleEmailBody", fileContent); // Update form state with email body content
// 		// console.log('Uploaded Email Body Content:', fileContent);
// 	};

// 	return (
// 		<>
// 			<ProfileHeading
// 				title={title}
// 				description={description}
// 				loading={loading}
// 				onDelete={() => setOpen(true)}
// 				showDeleteButton={false}
// 			/>
// 			<div className="flex items-center justify-center">
// 				<button
// 					onClick={() => setIsHelpModalOpen(true)}
// 					className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
// 				>
// 					<HelpCircle size={20} />
// 				</button>
// 			</div>

// 			<Separator />
// 			<div>
// 				<ul className="flex gap-4">
// 					{steps.map((step, index) => (
// 						<li key={step.name} className="md:flex-1">
// 							<div
// 								onClick={() => initialData && setCurrentStep(index)} // Allow click if initialData is true
// 								className={cn(
// 									"group flex w-full cursor-pointer flex-col py-2 pl-4",
// 									currentStep === index
// 										? "border-blue-600 border-l-4 text-blue-600" // Current step (active)
// 										: currentStep > index
// 											? "border-green-600 border-l-4 text-green-600" // Completed steps
// 											: "border-gray-200 border-l-4 text-gray-500", // Inactive steps (future)
// 								)}
// 							>
// 								<span className="font-medium text-sm">{step.id}</span>
// 								<span className="font-medium text-sm">{step.name}</span>
// 							</div>
// 						</li>
// 					))}
// 				</ul>
// 			</div>

// 			<Separator />

// 			<WalkThroughModal
// 				isOpen={isHelpModalOpen}
// 				onClose={handleHelpCloseModal}
// 				videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
// 				title="Welcome to Your Profile Setup"
// 				subtitle="Learn how to create or edit your profile, optimize your settings, and improve lead generation."
// 				steps={campaignSteps} // Steps for the tour
// 				isTourOpen={isTourOpen}
// 				onStartTour={handleHelpStartTour}
// 				onCloseTour={handleHelpCloseTour}
// 			/>

// 			<Form {...form}>
// 				<form
// 					onSubmit={form.handleSubmit(() => {})}
// 					className="w-full space-y-8"
// 				>
// 					<div
// 						className={cn(
// 							currentStep === 1
// 								? "w-full md:inline-block"
// 								: "gap-8 md:grid md:grid-cols-3",
// 						)}
// 					>
// 						{currentStep === 0 && (
// 							<PersonalInformationForm form={form} loading={loading} />
// 						)}

// 						{currentStep === 1 && (
// 							<BaseSetup
// 								form={form}
// 								loading={loading}
// 								initialData={extractInitialBaseDataFromUserProfile(initialData)}
// 								voices={voices} // Pass the voices prop for VoiceSelector
// 								handleVoiceSelect={handleVoiceSelect} // Pass the handler for voice selection
// 								handleScriptUpload={handleScriptUpload} // Pass the handler for script upload
// 								selectedScriptFileName={selectedScriptFileName} // Pass the selected script file name
// 								handleEmailUpload={handleEmailUpload} // Pass the handler for email upload
// 								selectedEmailFileName={selectedEmailFileName} // Pass the selected email file name
// 							/>
// 						)}
// 						{currentStep === 2 && (
// 							<KnowledgeBaseSetup
// 								form={form}
// 								loading={loading}
// 								voices={voices} // Pass the voices prop for VoiceSelector
// 								handleVoiceSelect={handleVoiceSelect} // Pass the handler for voice selection
// 								handleScriptUpload={handleScriptUpload} // Pass the handler for script upload
// 								selectedScriptFileName={selectedScriptFileName} // Pass the selected script file name
// 								handleEmailUpload={handleEmailUpload} // Pass the handler for email upload
// 								selectedEmailFileName={selectedEmailFileName} // Pass the selected email file name
// 								initialData={extractInitialKnowledgeBaseDataFromUserProfile(
// 									mockUserProfile,
// 								)}
// 							/>
// 						)}

// 						{currentStep === 3 && (
// 							<OAuthSetup
// 								form={form}
// 								loading={loading} // Pass loading state if needed
// 								initialData={extractOAuthDataFromUserProfile(initialData)}
// 							/>
// 						)}
// 					</div>
// 				</form>
// 			</Form>
// 			<StepNavigation
// 				currentStep={currentStep}
// 				stepsLength={steps.length}
// 				next={next}
// 				prev={prev}
// 			/>
// 		</>
// 	);
// };
