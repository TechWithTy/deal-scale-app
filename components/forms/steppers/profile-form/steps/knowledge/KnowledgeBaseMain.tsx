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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	AlertTriangle,
	Gauge,
	HelpCircle,
	Sparkle,
	Sparkles,
} from "lucide-react";
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
import { McpAllowListSection } from "./McpAllowListSection";

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

const aiProviderOptions = [
	{
		id: "dealscale",
		title: "DealScale Fusion",
		tagline: "Managed AI with guardrails",
		description:
			"Adaptive routing across our proprietary models with live observability, safety rails, and cost controls.",
		recommended: true,
	},
	{
		id: "openai",
		title: "OpenAI GPT",
		tagline: "Best-in-class general reasoning",
		description:
			"Use GPT-4.1 for rich conversations, summarization, and knowledge synthesis.",
	},
	{
		id: "claude",
		title: "Anthropic Claude",
		tagline: "High compliance & long context",
		description:
			"Great for regulated industries needing alignment and traceable outputs.",
	},
	{
		id: "deepseek",
		title: "DeepSeek",
		tagline: "Cost-optimized reasoning",
		description:
			"Efficient for large-scale lead scoring, enrichment, and outbound personalization.",
	},
	{
		id: "free",
		title: "Community Free Tier",
		tagline: "Zero-cost sandbox",
		description:
			"Great for demos, staging, and lightweight experimentation with shared capacity.",
	},
];

const aiRoutingOptions = [
	{
		id: "balanced",
		label: "Balanced",
		description: "Smartly weights quality vs cost per request.",
	},
	{
		id: "quality",
		label: "Quality First",
		description: "Always favor highest-performing models.",
	},
	{
		id: "economy",
		label: "Cost Saver",
		description: "Route to cost-effective models unless overridden.",
	},
	{
		id: "speed",
		label: "Speed Boost",
		description: "Prioritize the lowest latency models for rapid responses.",
	},
	{
		id: "personalization",
		label: "Personalization",
		description: "Bias selection toward models tuned on your account data.",
	},
	{
		id: "contextWindow",
		label: "Max Context",
		description:
			"Favor models with the largest context window for long inputs.",
	},
];

const fallbackOptions = [
	{ id: "none", label: "No Fallback" },
	...aiProviderOptions.map((option) => ({
		id: option.id,
		label: option.title,
	})),
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
			if (initialData.mcpAllowList) {
				form.setValue("mcpAllowList", {
					tools: initialData.mcpAllowList.tools ?? [],
					words: initialData.mcpAllowList.words ?? [],
					phrases: initialData.mcpAllowList.phrases ?? [],
					regexes: initialData.mcpAllowList.regexes ?? [],
				});
			}
			if (initialData.mcpDenyList) {
				form.setValue("mcpDenyList", {
					tools: initialData.mcpDenyList.tools ?? [],
					words: initialData.mcpDenyList.words ?? [],
					phrases: initialData.mcpDenyList.phrases ?? [],
					regexes: initialData.mcpDenyList.regexes ?? [],
				});
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

	const selectedPrimary = form.watch("aiProvider.primary");
	const selectedFallback = form.watch("aiProvider.fallback");
	const selectedRouting = form.watch("aiProvider.routing");

	const primaryInfo = useMemo(
		() => aiProviderOptions.find((option) => option.id === selectedPrimary),
		[selectedPrimary],
	);

	const fallbackInfo = useMemo(
		() => aiProviderOptions.find((option) => option.id === selectedFallback),
		[selectedFallback],
	);

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
									<FormLabel className="font-medium text-sm">
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
											<div className="space-y-1 text-muted-foreground text-xs">
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
			<Card>
				<CardHeader className="pb-3">
					<CardTitle>AI Provider Orchestration</CardTitle>
					<CardDescription>
						Choose how DealScale orchestrates large language model calls. Mix
						and match providers and routing rules to balance cost, latency, and
						compliance.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="grid gap-4 md:grid-cols-3">
						<FormField
							control={form.control}
							name="aiProvider.primary"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-sm">
										Primary Provider
									</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="mt-1">
												<SelectValue placeholder="Select primary" />
											</SelectTrigger>
											<SelectContent>
												{aiProviderOptions.map((option) => (
													<SelectItem key={option.id} value={option.id}>
														{option.title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="aiProvider.fallback"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-sm">
										Fallback Provider
									</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="mt-1">
												<SelectValue placeholder="Select fallback" />
											</SelectTrigger>
											<SelectContent>
												{fallbackOptions.map((option) => (
													<SelectItem key={option.id} value={option.id}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="aiProvider.routing"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-sm">
										Routing Strategy
									</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="mt-1">
												<SelectValue placeholder="Select strategy" />
											</SelectTrigger>
											<SelectContent>
												{aiRoutingOptions.map((option) => (
													<SelectItem key={option.id} value={option.id}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="rounded-lg border border-border/60 bg-card/50 p-4">
						<div className="flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-primary" />
							<p className="font-semibold text-foreground text-sm">
								Execution Plan
							</p>
							{primaryInfo?.recommended && (
								<Badge
									variant="default"
									className="ml-auto bg-primary/10 text-primary"
								>
									Recommended
								</Badge>
							)}
						</div>
						<p className="mt-2 text-muted-foreground text-xs leading-relaxed">
							Requests start with{" "}
							<strong>{primaryInfo?.title ?? "DealScale Fusion"}</strong>
							{selectedFallback !== "none" && fallbackInfo ? (
								<>
									, then automatically fail over to{" "}
									<strong>{fallbackInfo.title}</strong> if a call fails.
								</>
							) : (
								" with no failover configured."
							)}
						</p>
						<p className="text-muted-foreground text-xs leading-relaxed">
							Routing mode:{" "}
							<strong>
								{aiRoutingOptions.find(
									(option) => option.id === selectedRouting,
								)?.label ?? "Balanced"}
							</strong>
							—{" "}
							{
								aiRoutingOptions.find((option) => option.id === selectedRouting)
									?.description
							}
						</p>
					</div>
					{(selectedPrimary === "free" || selectedFallback === "free") && (
						<TooltipProvider delayDuration={150}>
							<div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50/80 p-3 text-amber-900">
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											aria-label="Community free tier details"
											className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-amber-800 transition-colors hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
										>
											<HelpCircle className="h-4 w-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs text-xs leading-relaxed">
										The Community Free Tier shares infrastructure with our QA
										cluster. Throughput and feature coverage fluctuate, and some
										specialized automations may return partial results.
									</TooltipContent>
								</Tooltip>
								<p className="text-xs leading-relaxed">
									Use the Community Free Tier for sandboxing or internal demos.
									Production-grade cadences should stay on DealScale Fusion or
									other paid providers—we can’t guarantee uptime or remediation
									for free-tier misfires.
								</p>
							</div>
						</TooltipProvider>
					)}
				</CardContent>
			</Card>
			<McpAllowListSection loading={loading} />
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
