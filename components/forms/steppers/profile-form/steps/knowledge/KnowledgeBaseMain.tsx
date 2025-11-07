import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";

import type {
	ElevenLabsClient,
	GenerateSpeechRequest,
} from "@/types/elevenLabs/api/clone";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { InitialKnowledgeBaseData } from "../../../utils/const/getKnowledgeBase";

import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Gauge, Sparkle } from "lucide-react";
import { KnowledgeEmailUpload } from "./KnowledgeEmailUpload";
import { KnowledgeSalesScriptUpload } from "./KnowledgeSalesScriptUpload";

import CreateVoiceModal from "./voice/CreateVoiceModal";
import VoicemailModal from "./voice/VoicemailModal";
import VoiceFeatureTabs from "./voice/utils/VoiceFeatureTabs";

import { FeatureGuard } from "@/components/access/FeatureGuard";
import type { PlayButtonTimeLineHandle } from "@/components/reusables/audio/timeline/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloneModal } from "@/external/teleprompter-modal";
import { KnowledgeVoiceSelector } from "./KnowledgeVoiceSelector";
import { SalesScriptManager } from "./SalesScriptManager";
import { VoiceManager } from "./VoiceManager";

const approvalOptions = [
	{
		value: "manual" as const,
		title: "Manual Review",
		icon: AlertTriangle,
		description:
			"Every AI-generated update waits for your approval before going live.",
		badge: "Safest",
	},
	{
		value: "auto" as const,
		title: "Auto Approve",
		icon: Sparkle,
		description:
			"Auto-approve routine updates while logging changes for auditing.",
	},
	{
		value: "turbo" as const,
		title: "Turbo Mode",
		icon: Gauge,
		description:
			"Streamline go-live workflows with immediate approvals and proactive alerts.",
		badge: "Fastest",
	},
];

export interface KnowledgeBaseMainProps {
	loading: boolean;
	handleVoiceSelect: (voiceId: string) => void;
	handleScriptUpload: (scriptContent: string) => void;
	selectedScriptFileName: string;
	handleEmailUpload: (emailContent: string) => void;
	selectedEmailFileName: string;
	initialData?: InitialKnowledgeBaseData;
}

export const KnowledgeBaseMain: React.FC<KnowledgeBaseMainProps> = ({
	loading,
	handleVoiceSelect,
	handleScriptUpload,
	selectedScriptFileName,
	handleEmailUpload,
	selectedEmailFileName,
	initialData,
}) => {
	const form = useFormContext<ProfileFormValues>();
	const [showVoiceCloneModal, setShowVoiceCloneModal] = useState(false);
	const [showVoicemailModal, setShowVoicemailModal] = useState(false);
	const [showCreateVoiceModal, setShowCreateVoiceModal] = useState(false);
	const createVoiceTimelineRef = useRef<PlayButtonTimeLineHandle>(null);

	useEffect(() => {
		if (initialData) {
			form.setValue("selectedVoice", initialData.selectedVoice || "");
			form.setValue("exampleSalesScript", initialData.exampleSalesScript || "");
			// form.setValue("exampleEmailBody", initialData.exampleEmailBody || "");
			form.setValue(
				"voicemailRecordingId",
				initialData.voicemailRecordingId || "",
			);
			form.setValue("clonedVoiceId", initialData.clonedVoiceId || "");
			if (initialData.approvalLevel) {
				form.setValue("aiKnowledgeApproval", initialData.approvalLevel);
			}
		}
	}, [initialData, form]);

	const handleVoicemailAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		console.log("Received audio blob for voicemail:", audioBlob);
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("voicemailRecordingId", fakeRecordingId);
		setShowVoicemailModal(false);
	};
	const handleVoiceCloneAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		console.log("Received audio blob for voicemail:", audioBlob);
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("clonedVoiceId", fakeRecordingId);
		setShowVoiceCloneModal(false);
	};

	const handleCreatedVoiceAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		console.log("Received audio blob for voicemail:", audioBlob);
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("createdVoiceId", fakeRecordingId);
		setShowVoicemailModal(false);
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle>AI Approval Policy</CardTitle>
					<CardDescription>
						Control how AI-generated scripts, voice assets, and campaign updates
						are reviewed before publishing.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FormField
						control={form.control}
						name={"aiKnowledgeApproval" as FieldPath<ProfileFormValues>}
						render={({ field }) => {
							const selected = approvalOptions.find(
								(option) => option.value === field.value,
							);
							const Icon = selected?.icon ?? AlertTriangle;
							return (
								<FormItem>
									<FormLabel className="text-sm font-medium">
										Approval Level
									</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger className="mt-1">
												<SelectValue placeholder="Select approval flow" />
											</SelectTrigger>
											<SelectContent>
												{approvalOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
									{selected && (
										<div className="mt-3 flex items-start gap-3 rounded-md border border-border/60 bg-muted/40 p-3">
											<div className="mt-0.5">
												<Icon className="h-4 w-4 text-primary" />
											</div>
											<div className="space-y-1 text-xs text-muted-foreground">
												<div className="flex items-center gap-2 font-semibold text-foreground">
													{selected.title}
													{selected.badge && (
														<Badge
															variant="outline"
															className="text-[10px] uppercase"
														>
															{selected.badge}
														</Badge>
													)}
												</div>
												<p className="leading-relaxed">
													{selected.description}
												</p>
											</div>
										</div>
									)}
								</FormItem>
							);
						}}
					/>
				</CardContent>
			</Card>
			<Tabs defaultValue="voice-library" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="voice-library">
						<span className="flex items-center gap-2">
							Voice Library
							<Badge variant="secondary" className="text-xs">
								New
							</Badge>
						</span>
					</TabsTrigger>
					<TabsTrigger value="scripts">
						<span className="flex items-center gap-2">
							Sales Scripts
							<Badge variant="secondary" className="text-xs">
								New
							</Badge>
						</span>
					</TabsTrigger>
				</TabsList>

				{/* Legacy Voice Features Tab - Hidden but kept for reference */}
				<TabsContent value="voice" className="hidden space-y-6">
					{/* Voice Features Group */}
					<div className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
						<span className="mb-2 font-semibold text-lg">Voice Features</span>
						<KnowledgeVoiceSelector loading={loading} />
						<VoiceFeatureTabs
							tabs={[
								{
									label: "Record Voicemail",
									content: (
										<button
											type="button"
											className="w-56 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
											onClick={() => setShowVoicemailModal(true)}
											aria-label="Record Voicemail"
										>
											+ Record Voicemail
										</button>
									),
								},
								{
									label: "Clone Voice",
									content: (
										<FeatureGuard featureKey="userProfile.cloneVoice">
											<button
												type="button"
												className="w-56 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:bg-purple-500 dark:hover:bg-purple-600"
												onClick={() => setShowVoiceCloneModal(true)}
												aria-label="Clone Voice"
											>
												+ Clone Voice
											</button>
										</FeatureGuard>
									),
								},
								{
									label: "Create Voice",
									audioSrc:
										"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
									timelineRef: createVoiceTimelineRef,
									content: (
										<button
											type="button"
											className="w-56 rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white shadow hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:bg-yellow-500 dark:hover:bg-yellow-600"
											onClick={() => setShowCreateVoiceModal(true)}
											aria-label="Create Voice"
										>
											+ Create Voice
										</button>
									),
								},
							]}
							className="w-full"
						/>
						<VoicemailModal
							open={showVoicemailModal}
							onClose={() => setShowVoicemailModal(false)}
							onSave={handleVoicemailAudio}
						/>
						<CloneModal
							open={showVoiceCloneModal}
							onClose={() => setShowVoiceCloneModal(false)}
							onSave={handleVoiceCloneAudio}
						/>
						<CreateVoiceModal
							open={showCreateVoiceModal}
							onClose={() => setShowCreateVoiceModal(false)}
							onSave={handleCreatedVoiceAudio}
						/>
					</div>

					{/* Sales Script Upload - Legacy */}
					<div className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
						<span className="mb-2 font-semibold text-lg">Sales Script</span>
						<FormLabel>
							Select Voice (Optional): Personalize your agent's voice{" "}
						</FormLabel>

						<KnowledgeSalesScriptUpload
							loading={loading}
							handleScriptUpload={handleScriptUpload}
							selectedScriptFileName={selectedScriptFileName}
						/>
						{/* <div className="relative flex w-full flex-col items-center justify-center gap-2">
							<label
								htmlFor="exampleEmailBody"
								className="mb-1 font-medium text-base text-gray-700 dark:text-gray-200"
							>
								Upload Email Body Content
							</label>
							<KnowledgeEmailUpload
								loading={loading}
								handleEmailUpload={handleEmailUpload}
								selectedEmailFileName={selectedEmailFileName}
								disabled={true} // ! Feature flag for coming soon
							/>
							
						</div> */}
					</div>
				</TabsContent>

				{/* Voice Library Tab */}
				<TabsContent value="voice-library" className="space-y-6">
					<VoiceManager />
				</TabsContent>

				{/* Sales Scripts Tab */}
				<TabsContent value="scripts" className="space-y-6">
					<SalesScriptManager />
				</TabsContent>
			</Tabs>

			{/* Modals */}
			{showVoiceCloneModal && (
				<VoicemailModal
					open={showVoicemailModal}
					onClose={() => setShowVoicemailModal(false)}
					onSave={(audioBlob) => {
						// todo: handle upload or save logic
						setShowVoicemailModal(false);
					}}
				/>
			)}
			{showVoiceCloneModal && (
				<CloneModal
					open={showVoiceCloneModal}
					onClose={() => setShowVoiceCloneModal(false)}
					onSave={(audioBlob) => {
						// todo: handle upload or save logic
						setShowVoiceCloneModal(false);
					}}
				/>
			)}
		</div>
	);
};
