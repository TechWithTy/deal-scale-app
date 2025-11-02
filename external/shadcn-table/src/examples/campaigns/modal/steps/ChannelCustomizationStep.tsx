import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
	type Agent,
	useCampaignCreationStore,
} from "@/lib/stores/campaignCreation";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";
import { Label } from "../../../../components/ui/label";
import PhoneNumberInput from "./channelCustomization/PhoneNumberInput";
import AreaModeSelector from "./channelCustomization/AreaModeSelector";
import LeadListSelector from "./channelCustomization/LeadListSelector";
import CampaignNavigation from "./channelCustomization/CampaignNavigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { ChevronDown, Pause, Play } from "lucide-react";
import AllRecipientDropdown from "../../../../../../ai-avatar-dropdown/AllRecipientDropdown";

// * Step 2: Channel Customization

interface ChannelCustomizationStepProps {
	onNext: () => void;
	onBack: () => void;
	form: UseFormReturn<z.input<typeof FormSchema>>;
	onCreateVariant?: (label?: string) => void;
}

export const FormSchema = z
	.object({
		primaryPhoneNumber: z
			.string()
			.transform((val) => {
				let digits = val.replace(/\D/g, "");
				if (digits.startsWith("1")) {
					digits = digits.substring(1);
				}
				return `+1${digits}`;
			})
			.refine((val) => /^\+1\d{10}$/.test(val), {
				message: "Phone number must be 10 digits after the +1 country code.",
			}),
		areaMode: z.enum(["zip", "leadList"], {
			required_error: "You must select an area mode.",
		}),
		zipCode: z.string().optional(),
		selectedLeadListId: z.string().optional(),
		// Social-specific
		socialPlatform: z.enum(["facebook", "linkedin"]).optional(),
		// Direct mail-specific
		directMailType: z
			.enum(["postcard", "letter_front", "letter_front_back", "snap_pack"])
			.optional(),
		templates: z
			.array(
				z.object({
					templateId: z.string({ required_error: "Please select a template." }),
					description: z.string().max(200).optional(),
				}),
			)
			.default([]),
		// Transfer
		transferEnabled: z.boolean().default(true),
		transferType: z
			.enum([
				"inbound_call",
				"outbound_call",
				"social",
				"text",
				"chat_live_person",
				"appraisal",
				"live_avatar",
			])
			.default("inbound_call"),
		transferAgentId: z.string().optional(),
		transferGuidelines: z.string().default(""),
		transferPrompt: z.string().default(""),
		// Number Pooling (Calls/Text only)
		numberPoolingEnabled: z.boolean().default(false),
		messagingServiceSid: z
			.string()
			.trim()
			.optional()
			.refine((val) => !val || /^MG[a-zA-Z0-9]{32}$/.test(val), {
				message: "Invalid Messaging Service SID format.",
			}),
		senderPoolNumbersCsv: z.string().default(""), // CSV of E.164 numbers
		smartEncodingEnabled: z.boolean().default(true),
		optOutHandlingEnabled: z.boolean().default(true),
		perNumberDailyLimit: z.number().min(1).default(75),
		tcpaSourceLink: z
			.string()
			.default("")
			.refine(
				(value) => {
					if (!value || value.trim().length === 0) return true;
					try {
						new URL(value);
						return true;
					} catch (error) {
						return false;
					}
				},
				{ message: "Please enter a valid URL for TCPA source" },
			),
		skipName: z.boolean().default(false),
		addressVerified: z.boolean().default(false),
		phoneVerified: z.boolean().default(false),
		emailAddress: z.union([z.string().email(), z.literal("")]).optional(),
		emailVerified: z.boolean().default(false),
		possiblePhones: z.string().optional(),
		possibleEmails: z.string().optional(),
		possibleHandles: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.areaMode === "leadList") {
				return !!data.selectedLeadListId;
			}
			return true;
		},
		{ message: "Please select a lead list.", path: ["selectedLeadListId"] },
	)
	.refine(
		(data) => {
			if (data.areaMode === "zip") {
				return !!data.zipCode && /^\d{5}(-\d{4})?$/.test(data.zipCode);
			}
			return true;
		},
		{
			message: "Please enter a valid US zip code (e.g., 12345 or 12345-6789).",
			path: ["zipCode"],
		},
	)
	.refine(
		(data) => {
			// When direct mail type requires two sides, enforce at least 2 templates
			const needsTwo =
				data.directMailType === "letter_front_back" ||
				data.directMailType === "snap_pack";
			if (!data.directMailType) return true;
			if (needsTwo) return (data.templates?.length || 0) >= 2;
			return (data.templates?.length || 0) >= 1;
		},
		{
			message:
				"Please add the required number of templates for the selected mail type.",
			path: ["templates"],
		},
	)
	.refine(
		(data) => {
			if (data.transferEnabled) {
				return Boolean(data.transferAgentId && data.transferAgentId.length > 0);
			}
			return true;
		},
		{
			message: "Please select an agent to transfer to.",
			path: ["transferAgentId"],
		},
	);

// Additional conditional validations for transfer text fields
export const TransferConditionalSchema = FormSchema.superRefine((data, ctx) => {
	if (data.transferEnabled) {
		if (
			!data.transferGuidelines ||
			data.transferGuidelines.trim().length === 0
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Transfer guidelines are required when transfer is enabled.",
				path: ["transferGuidelines"],
			});
		}
		if (!data.transferPrompt || data.transferPrompt.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Transfer prompt/message is required when transfer is enabled.",
				path: ["transferPrompt"],
			});
		}
	}
});

// Reusable type for consumers
export type ChannelCustomizationFormValues = z.infer<typeof FormSchema>;

const ChannelCustomizationStep: FC<ChannelCustomizationStepProps> = ({
	onNext,
	onBack,
	form,
	onCreateVariant,
}) => {
	const {
		primaryChannel,
		areaMode,
		setAreaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		setLeadCount,
		// A/B testing fields
		abTestingEnabled,
		selectedLeadListAId,
		setSelectedLeadListAId,
		selectedLeadListBId,
		setSelectedLeadListBId,
		availableAgents,
		setSelectedAgentId,
		// Number pooling store fields
		numberPoolingEnabled,
		setNumberPoolingEnabled,
		messagingServiceSid,
		setMessagingServiceSid,
		senderPoolNumbersCsv,
		setSenderPoolNumbersCsv,
		smartEncodingEnabled,
		setSmartEncodingEnabled,
		optOutHandlingEnabled,
		setOptOutHandlingEnabled,
		perNumberDailyLimit,
		setPerNumberDailyLimit,
		availableSenderNumbers,
		selectedSenderNumbers,
		setSelectedSenderNumbers,
		numberSelectionStrategy,
		setNumberSelectionStrategy,
		setAvailableSenderNumbers,

		// Voice and voicemail preferences
		preferredVoicemailVoiceId,
		setPreferredVoicemailVoiceId,
		preferredVoicemailMessageId,
		setPreferredVoicemailMessageId,
	} = useCampaignCreationStore();

	const watchedAreaMode = form.watch("areaMode");
	const watchedDirectMailType = form.watch("directMailType");
	const watchedPrimaryChannel = primaryChannel;
	const poolingEnabled = form.watch("numberPoolingEnabled");

	// Track counts for A/B lists to compute total leads
	const [leadCountA, setLeadCountA] = useState<number>(0);
	const [leadCountB, setLeadCountB] = useState<number>(0);

	const [poolingExpanded, setPoolingExpanded] = useState(false);
	const [loadingNumbers, setLoadingNumbers] = useState(false);
	const [numbersError, setNumbersError] = useState<string | null>(null);

	// Derived labels for voice and voicemail message
	const voiceLabel = useMemo(() => {
		const map: Record<string, string> = {
			voice_emma: "Emma (Natural)",
			voice_paul: "Paul (Warm)",
			voice_matthew: "Matthew (Clear)",
		};
		return preferredVoicemailVoiceId
			? (map[preferredVoicemailVoiceId] ?? "Select a voice")
			: "Select a voice";
	}, [preferredVoicemailVoiceId]);

	const messageLabel = useMemo(() => {
		const map: Record<string, string> = {
			vm_professional: "Professional Business Message",
			vm_friendly: "Friendly Personal Message",
			vm_urgent: "Urgent Callback Message",
			vm_custom: "Custom Message (Upload Audio)",
		};
		return preferredVoicemailMessageId
			? (map[preferredVoicemailMessageId] ?? "Select a voicemail message")
			: "Select a voicemail message";
	}, [preferredVoicemailMessageId]);

	// Audio preview control
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [playingKey, setPlayingKey] = useState<string | null>(null);

	// Text/SMS settings from store
	const {
		textSignature,
		setTextSignature,
		smsCanSendImages,
		setSmsCanSendImages,
		smsCanSendVideos,
		setSmsCanSendVideos,
		smsCanSendLinks,
		setSmsCanSendLinks,
		smsMediaSource,
		setSmsMediaSource,
		smsAppendAgentName,
		setSmsAppendAgentName,
		selectedAgentId,
	} = useCampaignCreationStore();

	// Prefill signature for Text channel based on company name
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (watchedPrimaryChannel === "text") {
			if (!textSignature || textSignature.trim().length === 0) {
				try {
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					const profile =
						require("@/constants/_faker/profile/userProfile").mockUserProfile;
					const company = profile?.companyInfo?.companyName || "Your Company";
					setTextSignature(`-- ${company}`);
				} catch {
					setTextSignature("--");
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watchedPrimaryChannel]);

	const agentName = (() => {
		try {
			const found = (availableAgents || []).find(
				(a: Agent) => a.id === selectedAgentId,
			);
			return found?.name || "Your Agent";
		} catch {
			return "Your Agent";
		}
	})();

	const getAudioUrl = (
		kind: "voice" | "message",
		id: string,
	): string | null => {
		const voiceMap: Record<string, string> = {
			voice_emma: "/audio/voices/voice_emma.mp3",
			voice_paul: "/audio/voices/voice_paul.mp3",
			voice_matthew: "/audio/voices/voice_matthew.mp3",
		};
		const msgMap: Record<string, string> = {
			vm_professional: "/audio/messages/vm_professional.mp3",
			vm_friendly: "/audio/messages/vm_friendly.mp3",
			vm_urgent: "/audio/messages/vm_urgent.mp3",
			vm_custom: "/audio/messages/vm_custom.mp3",
		};
		return kind === "voice" ? (voiceMap[id] ?? null) : (msgMap[id] ?? null);
	};

	const stopAudio = () => {
		try {
			audioRef.current?.pause();
			if (audioRef.current) audioRef.current.currentTime = 0;
		} catch {}
		audioRef.current = null;
	};

	const handleTogglePlay = (
		e: React.MouseEvent,
		kind: "voice" | "message",
		id: string,
		label: string,
	) => {
		e.stopPropagation();
		const key = `${kind}:${id}`;
		if (playingKey === key) {
			stopAudio();
			setPlayingKey(null);
			return;
		}
		stopAudio();
		const url = getAudioUrl(kind, id);
		if (!url) {
			// eslint-disable-next-line no-console
			console.warn("No preview available for", { kind, id, label });
			setPlayingKey(null);
			return;
		}
		try {
			const audio = new Audio(url);
			audioRef.current = audio;
			void audio.play().catch((err) => {
				// eslint-disable-next-line no-console
				console.warn("Audio preview failed", { kind, id, error: err });
				setPlayingKey(null);
			});
			setPlayingKey(key);
			audio.onended = () => {
				setPlayingKey((curr) => (curr === key ? null : curr));
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn("Audio init failed", { kind, id, error: err });
			setPlayingKey(null);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => () => stopAudio(), []);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "templates",
	});

	useEffect(() => {
		setAreaMode(watchedAreaMode);
	}, [watchedAreaMode, setAreaMode]);

	useEffect(() => {
		if (watchedAreaMode !== "leadList") {
			setLeadCount(0);
			setSelectedLeadListId("");
			form.setValue("selectedLeadListId", "");
		}
	}, [watchedAreaMode, setLeadCount, setSelectedLeadListId, form]);

	// Initialize form with store-backed defaults for number pooling
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		form.setValue("numberPoolingEnabled", numberPoolingEnabled);
		form.setValue("messagingServiceSid", messagingServiceSid || "");
		form.setValue("senderPoolNumbersCsv", senderPoolNumbersCsv || "");
		form.setValue("smartEncodingEnabled", smartEncodingEnabled);
		form.setValue("optOutHandlingEnabled", optOutHandlingEnabled);
		form.setValue("perNumberDailyLimit", perNumberDailyLimit ?? 75);
		// Expand if enabled to show current values
		if (numberPoolingEnabled) setPoolingExpanded(true);
		// If CSV had values but no explicit selections, hydrate selection from CSV
		if (
			(senderPoolNumbersCsv?.trim()?.length || 0) > 0 &&
			(selectedSenderNumbers?.length || 0) === 0
		) {
			const parsed = senderPoolNumbersCsv
				.split(/[\n,]+/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			setSelectedSenderNumbers(parsed);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync form -> store for number pooling fields
	useEffect(() => {
		const sub = form.watch((vals, { name }) => {
			switch (name) {
				case "numberPoolingEnabled":
					setNumberPoolingEnabled(Boolean(vals.numberPoolingEnabled));
					break;
				case "messagingServiceSid":
					setMessagingServiceSid(vals.messagingServiceSid || "");
					break;
				case "senderPoolNumbersCsv":
					setSenderPoolNumbersCsv(vals.senderPoolNumbersCsv || "");
					break;
				case "smartEncodingEnabled":
					setSmartEncodingEnabled(Boolean(vals.smartEncodingEnabled));
					break;
				case "optOutHandlingEnabled":
					setOptOutHandlingEnabled(Boolean(vals.optOutHandlingEnabled));
					break;
				case "perNumberDailyLimit":
					setPerNumberDailyLimit(Number(vals.perNumberDailyLimit ?? 75));
					break;
				default:
					break;
			}
		});
		return () => sub.unsubscribe();
	}, [
		form,
		setNumberPoolingEnabled,
		setMessagingServiceSid,
		setSenderPoolNumbersCsv,
		setSmartEncodingEnabled,
		setOptOutHandlingEnabled,
		setPerNumberDailyLimit,
	]);

	// On first expand, fetch connected numbers from server and populate store
	useEffect(() => {
		if (!poolingExpanded) return;
		// Only fetch once if list is empty or still mocked
		if ((availableSenderNumbers?.length || 0) > 0) return;
		let isActive = true;
		(async () => {
			try {
				setLoadingNumbers(true);
				setNumbersError(null);
				const res = await fetch("/api/twilio/numbers", { cache: "no-store" });
				if (!res.ok) {
					const text = await res.text();
					throw new Error(text || `Request failed: ${res.status}`);
				}
				const raw = (await res.json().catch(() => ({}))) as unknown;
				const TwilioNumbersSchema = z
					.object({ numbers: z.array(z.string()).optional() })
					.passthrough();
				const parsed = TwilioNumbersSchema.safeParse(raw);
				if (isActive) {
					setAvailableSenderNumbers(
						parsed.success ? (parsed.data.numbers ?? []) : [],
					);
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				if (isActive) setNumbersError(msg);
			} finally {
				if (isActive) setLoadingNumbers(false);
			}
		})();
		return () => {
			isActive = false;
		};
	}, [poolingExpanded, availableSenderNumbers, setAvailableSenderNumbers]);

	if (!primaryChannel) {
		return <div className="text-red-500">Please select a channel first.</div>;
	}

	const watchedTransferType = form.watch("transferType");
	const isLivePerson =
		watchedTransferType === "chat_live_person" ||
		watchedTransferType === "appraisal";

	// Normalize direct mail channel check to store representation ('email')
	const isDirectMailChannel = String(primaryChannel ?? "") === "email";

	return (
		<Form {...form}>
			<div className="flex h-full flex-col">
				<div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
					<h2 className="font-semibold text-lg">Channel Customization</h2>
					<p className="text-gray-500 text-sm">
						Customize settings for your {primaryChannel} campaign.
					</p>

					<FormField
						control={form.control}
						name="primaryPhoneNumber"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<PhoneNumberInput {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Number Pooling (Calls/Text) */}
					{(watchedPrimaryChannel === "text" ||
						watchedPrimaryChannel === "call") && (
						<div className="space-y-2 rounded-md border p-3">
							<div className="flex items-center justify-between">
								<FormField
									control={form.control}
									name="numberPoolingEnabled"
									render={({ field }) => (
										<FormItem className="flex items-center gap-2">
											<Checkbox
												id="number-pooling-enabled"
												checked={field.value}
												onCheckedChange={(v) => field.onChange(Boolean(v))}
											/>
											<FormLabel
												className="!m-0"
												htmlFor="number-pooling-enabled"
											>
												Enable Number Pooling
											</FormLabel>
										</FormItem>
									)}
								/>
								<Button
									type="button"
									variant="ghost"
									onClick={() => setPoolingExpanded((s) => !s)}
								>
									{poolingExpanded ? "Hide" : "Show"}
								</Button>
							</div>

							{poolingExpanded && (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									{/* Selection strategy */}
									<div>
										<FormLabel>Number selection strategy</FormLabel>
										<div className="mt-1">
											<Select
												value={numberSelectionStrategy}
												onValueChange={(v) =>
													setNumberSelectionStrategy(
														v as "round_robin" | "sticky_by_lead" | "random",
													)
												}
												disabled={!poolingEnabled}
											>
												<SelectTrigger>
													<SelectValue placeholder="Choose strategy" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="round_robin">
														Round-robin
													</SelectItem>
													<SelectItem value="sticky_by_lead">
														Sticky by lead
													</SelectItem>
													<SelectItem value="random">Random</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Sender numbers multi-select */}
									<div className="md:col-span-2">
										<FormLabel>Sender Numbers</FormLabel>
										<div className="mb-1 text-muted-foreground text-xs">
											Selected {selectedSenderNumbers.length} of{" "}
											{availableSenderNumbers.length}
										</div>
										<div className="grid grid-cols-1 gap-2 md:grid-cols-3">
											{availableSenderNumbers.map((num) => {
												const checked = selectedSenderNumbers.includes(num);
												const checkboxId = `sender-${num}`;
												const labelId = `${checkboxId}-label`;
												return (
													<div
														key={num}
														className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
															!poolingEnabled ? "opacity-50" : ""
														}`}
													>
														<Checkbox
															id={checkboxId}
															aria-labelledby={labelId}
															checked={checked}
															onCheckedChange={(v) => {
																if (!poolingEnabled) return;
																const next = v
																	? Array.from(
																			new Set([...selectedSenderNumbers, num]),
																		)
																	: selectedSenderNumbers.filter(
																			(n) => n !== num,
																		);
																setSelectedSenderNumbers(next);
																// keep CSV in sync under the hood for backward compatibility
																const csv = next.join(", ");
																form.setValue("senderPoolNumbersCsv", csv);
																setSenderPoolNumbersCsv(csv);
															}}
															disabled={!poolingEnabled}
														/>
														<span id={labelId}>{num}</span>
													</div>
												);
											})}
										</div>
									</div>

									<FormField
										control={form.control}
										name="messagingServiceSid"
										render={({ field }) => (
											<FormItem>
												<FormLabel htmlFor="twilio-messaging-service-sid">
													Messaging Service SID
												</FormLabel>
												<FormControl>
													<Input
														id="twilio-messaging-service-sid"
														placeholder="MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
														disabled={!poolingEnabled}
														{...field}
													/>
												</FormControl>
												<div className="text-muted-foreground text-xs">
													Twilio Console → Messaging → Services
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="perNumberDailyLimit"
										render={({ field }) => (
											<FormItem>
												<FormLabel htmlFor="per-number-daily-limit">
													Per-number daily limit
												</FormLabel>
												<FormControl>
													<Input
														id="per-number-daily-limit"
														type="number"
														min={1}
														value={field.value ?? 75}
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
														disabled={!poolingEnabled}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="smartEncodingEnabled"
										render={({ field }) => (
											<FormItem className="flex items-center gap-2">
												<Checkbox
													id="smart-encoding-toggle"
													checked={field.value}
													onCheckedChange={(v) => field.onChange(Boolean(v))}
													disabled={!poolingEnabled}
												/>
												<FormLabel
													className="!m-0"
													htmlFor="smart-encoding-toggle"
												>
													Smart Encoding
												</FormLabel>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="optOutHandlingEnabled"
										render={({ field }) => (
											<FormItem className="flex items-center gap-2">
												<Checkbox
													id="opt-out-handling-toggle"
													checked={field.value}
													onCheckedChange={(v) => field.onChange(Boolean(v))}
													disabled={!poolingEnabled}
												/>
												<FormLabel
													className="!m-0"
													htmlFor="opt-out-handling-toggle"
												>
													Opt-out Handling
												</FormLabel>
											</FormItem>
										)}
									/>

									{/* Keep CSV field in form for validation/back-compat but hide the input */}
									<FormField
										control={form.control}
										name="senderPoolNumbersCsv"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormControl>
													<input
														type="hidden"
														value={field.value}
														onChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}
						</div>
					)}

					{/* Text Messaging Settings (separate card) */}
					{watchedPrimaryChannel === "text" && (
						<div className="mt-4 space-y-4 rounded-md border p-3">
							<div>
								<FormLabel>Text Signature</FormLabel>
								<FormControl>
									<Input
										placeholder="-- Your Name"
										value={textSignature}
										onChange={(e) => setTextSignature(e.target.value)}
									/>
								</FormControl>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="append-agent-name"
									checked={smsAppendAgentName}
									onCheckedChange={(v) => setSmsAppendAgentName(Boolean(v))}
								/>
								<Label className="!m-0" htmlFor="append-agent-name">
									Auto-append agent name
								</Label>
							</div>
							<p className="text-muted-foreground text-xs">
								Final signature: {(textSignature || "").trim() || "--"}
								{smsAppendAgentName ? ` ${agentName}` : ""}
							</p>
							<div>
								<FormLabel>Media Source</FormLabel>
								<div className="mt-1">
									<Select
										value={smsMediaSource}
										onValueChange={(v) =>
											setSmsMediaSource(v as "ai" | "stock" | "hybrid")
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Choose source" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ai">AI-generated media</SelectItem>
											<SelectItem value="stock">Stock assets</SelectItem>
											<SelectItem value="hybrid">Hybrid</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div>
								<FormLabel>Media Permissions</FormLabel>
								<div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
									<FormItem className="flex flex-row items-center space-x-2 space-y-0">
										<FormControl>
											<Checkbox
												id="sms-can-send-images"
												checked={smsCanSendImages}
												onCheckedChange={(v) => setSmsCanSendImages(Boolean(v))}
											/>
										</FormControl>
										<FormLabel
											htmlFor="sms-can-send-images"
											className="font-normal"
										>
											Can send images
										</FormLabel>
									</FormItem>
									<FormItem className="flex flex-row items-center space-x-2 space-y-0">
										<FormControl>
											<Checkbox
												id="sms-can-send-videos"
												checked={smsCanSendVideos}
												onCheckedChange={(v) => setSmsCanSendVideos(Boolean(v))}
											/>
										</FormControl>
										<FormLabel
											htmlFor="sms-can-send-videos"
											className="font-normal"
										>
											Can send videos
										</FormLabel>
									</FormItem>
									<FormItem className="flex flex-row items-center space-x-2 space-y-0">
										<FormControl>
											<Checkbox
												id="sms-can-send-links"
												checked={smsCanSendLinks}
												onCheckedChange={(v) => setSmsCanSendLinks(Boolean(v))}
											/>
										</FormControl>
										<FormLabel
											htmlFor="sms-can-send-links"
											className="font-normal"
										>
											Can send links
										</FormLabel>
									</FormItem>
								</div>
								<p className="mt-2 text-muted-foreground text-xs">
									These limits affect message composition and compliance; media
									may count as multiple segments.
								</p>
							</div>
						</div>
					)}

					{watchedPrimaryChannel === "call" && (
						<>
							{/* Voice and Voicemail Preferences */}
							<div className="space-y-6">
								<div className="space-y-3">
									<Label>Voice</Label>
									<div className="space-y-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-between"
												>
													<span>{voiceLabel}</span>
													<ChevronDown className="h-4 w-4 opacity-50" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-full min-w-[300px]">
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailVoiceId("voice_emma")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Emma (Natural)</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"voice",
																		"voice_emma",
																		"Emma (Natural)",
																	)
																}
															>
																{playingKey === "voice:voice_emma" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailVoiceId("voice_paul")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Paul (Warm)</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"voice",
																		"voice_paul",
																		"Paul (Warm)",
																	)
																}
															>
																{playingKey === "voice:voice_paul" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailVoiceId("voice_matthew")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Matthew (Clear)</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"voice",
																		"voice_matthew",
																		"Matthew (Clear)",
																	)
																}
															>
																{playingKey === "voice:voice_matthew" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
										<p className="text-muted-foreground text-xs">
											Overrides any agent voice.
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label className="block">Preferred Voicemail Message</Label>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-between"
												>
													<span>{messageLabel}</span>
													<ChevronDown className="h-4 w-4 opacity-50" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-full min-w-[300px]">
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_professional")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Professional Business Message</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_professional",
																		"Professional Business Message",
																	)
																}
															>
																{playingKey === "message:vm_professional" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_friendly")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Friendly Personal Message</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_friendly",
																		"Friendly Personal Message",
																	)
																}
															>
																{playingKey === "message:vm_friendly" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_urgent")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Urgent Callback Message</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_urgent",
																		"Urgent Callback Message",
																	)
																}
															>
																{playingKey === "message:vm_urgent" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_custom")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Custom Message (Upload Audio)</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_custom",
																		"Custom Message",
																	)
																}
															>
																{playingKey === "message:vm_custom" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
										<p className="text-muted-foreground text-xs">
											Choose a pre-recorded voicemail message or upload your own
											audio file.
										</p>
									</div>
								</div>
							</div>
						</>
					)}

					{/* Transfer toggle and agent selection */}
					<div className="space-y-3">
						<FormField
							control={form.control}
							name="transferEnabled"
							render={({ field }) => (
								<FormItem className="flex items-center gap-3">
									<Checkbox
										id="transfer-enabled"
										checked={field.value}
										onCheckedChange={(v) => field.onChange(Boolean(v))}
									/>
									<FormLabel className="!m-0" htmlFor="transfer-enabled">
										Enable Transfer to Agent
									</FormLabel>
								</FormItem>
							)}
						/>

						{form.watch("transferEnabled") && (
							<>
								<FormField
									control={form.control}
									name="transferType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Transfer Type</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select transfer type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="inbound_call">
															Inbound Call
														</SelectItem>
														<SelectItem value="outbound_call">
															Outbound Call
														</SelectItem>
														<SelectItem value="social">Social</SelectItem>
														<SelectItem value="text">Text</SelectItem>
														<SelectItem value="chat_live_person">
															Chat (Live Person)
														</SelectItem>
														<SelectItem value="appraisal">Appraisal</SelectItem>
														<SelectItem value="live_avatar">
															Live Avatar
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="transferAgentId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{isLivePerson
													? "Select Employee/Subuser"
													: "Select Agent"}
											</FormLabel>
											<FormControl>
												<AllRecipientDropdown
													value={field.value}
													onChange={(val) => {
														field.onChange(val);
														setSelectedAgentId(val);
													}}
													availablePeople={availableAgents}
													transferType={watchedTransferType}
													placeholderAgent="Select an agent"
													placeholderEmployee="Select an employee or subuser"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Transfer Guidelines */}
								<FormField
									control={form.control}
									name="transferGuidelines"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Transfer Guidelines</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Provide brief guidelines for the live agent (context, do/don'ts, handoff notes)"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Transfer Prompt / Message */}
								<FormField
									control={form.control}
									name="transferPrompt"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Transfer Prompt / Message</FormLabel>
											<FormControl>
												<Textarea
													placeholder="What should be sent or spoken to initiate/announce the transfer?"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}
					</div>

					{primaryChannel === "social" && (
						<FormField
							control={form.control}
							name="socialPlatform"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Social Platform</FormLabel>
									<FormControl>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a platform" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="facebook">Facebook</SelectItem>
												<SelectItem value="linkedin">LinkedIn</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{isDirectMailChannel && (
						<>
							<FormField
								control={form.control}
								name="directMailType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Direct Mail Type</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="postcard">Postcard</SelectItem>
													<SelectItem value="letter_front">
														Letter (Front only)
													</SelectItem>
													<SelectItem value="letter_front_back">
														Letter (Front & Back)
													</SelectItem>
													<SelectItem value="snap_pack">Snap Pack</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-3">
								<FormLabel>Templates</FormLabel>
								{fields.map((item, index) => (
									<div
										key={item.id}
										className="grid grid-cols-1 gap-3 md:grid-cols-12"
									>
										<div className="md:col-span-5">
											<FormField
												control={form.control}
												name={`templates.${index}.templateId` as const}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select a template" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="tpl_basic">
																		Basic Template
																	</SelectItem>
																	<SelectItem value="tpl_pro">
																		Professional Template
																	</SelectItem>
																	<SelectItem value="tpl_modern">
																		Modern Template
																	</SelectItem>
																</SelectContent>
															</Select>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="md:col-span-6">
											<FormField
												control={form.control}
												name={`templates.${index}.description` as const}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Textarea
																placeholder="Description (optional)"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="flex items-start md:col-span-1">
											<Button
												type="button"
												variant="ghost"
												onClick={() => remove(index)}
											>
												Remove
											</Button>
										</div>
									</div>
								))}
								<div className="flex items-center justify-between">
									<div className="text-muted-foreground text-xs">
										{watchedDirectMailType === "letter_front_back" ||
										watchedDirectMailType === "snap_pack"
											? "Requires at least 2 templates (front and back)."
											: "Requires at least 1 template."}
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={() => append({ templateId: "", description: "" })}
									>
										Add more
									</Button>
								</div>
							</div>
						</>
					)}

					<FormField
						control={form.control}
						name="areaMode"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormControl>
									<AreaModeSelector
										onValueChange={field.onChange}
										value={field.value}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{watchedAreaMode === "zip" && (
						<FormField
							control={form.control}
							name="zipCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Zip Code</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter US zip code (e.g., 12345 or 12345-6789)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{watchedAreaMode === "leadList" && (
						<FormField
							control={form.control}
							name="selectedLeadListId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<LeadListSelector
											value={
												abTestingEnabled
													? selectedLeadListAId || ""
													: field.value || ""
											}
											onChange={(
												selectedValue: string,
												recordCount: number,
											) => {
												if (abTestingEnabled) {
													setSelectedLeadListAId(selectedValue);
													setLeadCountA(recordCount);
													setLeadCount(recordCount + leadCountB);
													// keep single-field form in sync with A for validation/back-compat
													field.onChange(selectedValue);
													setSelectedLeadListId(selectedValue);
												} else {
													field.onChange(selectedValue);
													setSelectedLeadListId(selectedValue);
													setLeadCount(recordCount);
												}
											}}
											abTestingEnabled={abTestingEnabled}
											valueB={
												abTestingEnabled ? selectedLeadListBId || "" : undefined
											}
											onChangeB={
												abTestingEnabled
													? (selectedValue: string, recordCount: number) => {
															setSelectedLeadListBId(selectedValue);
															setLeadCountB(recordCount);
															setLeadCount(leadCountA + recordCount);
														}
													: undefined
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
				</div>
				<CampaignNavigation onBack={onBack} onNext={onNext} />
			</div>
		</Form>
	);
};

export default ChannelCustomizationStep;
