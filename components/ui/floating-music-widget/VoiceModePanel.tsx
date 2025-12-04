"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { motion } from "motion/react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import {
	Activity,
	ArrowUpRight,
	Bookmark,
	BookmarkCheck,
	Check,
	Clipboard,
	Globe,
	Layers,
	Loader2,
	MessageSquare,
	MonitorUp,
	Phone,
	PhoneCall,
	Search,
	ShieldCheck,
	Sparkles,
	Target,
	Timer,
	Users,
	Video,
} from "lucide-react";

import { TrackCommandPalette } from "@/components/ui/track-command-palette";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	useMusicPreferencesStore,
	VOICE_STATUS_DEFAULT_MESSAGES,
	VOICE_STATUS_PRIORITY,
	type VoiceConnectionStatus,
} from "@/lib/stores/musicPreferences";
import { useAIChatStore } from "@/lib/stores/user/ai/chat";
import {
	useUserPromptsStore,
	type PromptCategory,
	type PromptTemplate,
	type UserPrompt,
} from "@/lib/stores/user/prompts";
import {
	AI_AGENTS as CHIP_AI_AGENTS,
	PLATFORM_AUTOMATIONS,
	PLATFORM_RESOURCES,
	PLATFORM_TOOLS,
	PLATFORM_VARIABLES,
} from "@/lib/config/ai/chipDefinitions";
import type { ChipDefinition } from "@/components/reusables/ai/InlineChipEditor";
import { cn } from "@/lib/utils";
import type { AIChatThread } from "@/types/ai/chat";
import type { VoicePaletteOption } from "@/types/focus";
import VoiceLottie from "@/public/lottie/RecordingButton.json";
import { TypewriterEffect } from "../typewriter-effect";
import {
	VOICE_AGENT_OPTIONS,
	VOICE_PROMPTS,
	VIDEO_PROMPTS,
	PHONE_PROMPTS,
	VOICE_SESSION_OPTIONS,
	VOICE_SPRINT_OPTIONS,
	VOICE_ASSET_OPTIONS,
	PHONE_COMMS_OPTIONS,
	PHONE_DIALER_RECOMMENDATIONS,
} from "./constants";

const PROMPT_CATEGORY_LABELS: Record<PromptCategory, string> = {
	audience_search: "Audience Search",
	campaign: "Sales Scripts & Prompts",
	outreach: "Outreach",
	enrichment: "Enrichment",
	analytics: "Analytics",
	workflow: "Automations & Workflows",
	custom: "Custom Templates",
};

const PROMPT_CATEGORY_ORDER: PromptCategory[] = [
	"workflow",
	"campaign",
	"audience_search",
	"outreach",
	"analytics",
	"enrichment",
	"custom",
];

type PromptSource = {
	category: PromptCategory;
	name: string;
	description?: string | null;
	content: string;
	tags: string[];
	id: string;
	isTemplate: boolean;
};

function truncateContent(value: string, max = 140): string {
	if (!value) {
		return "";
	}
	const normalized = value.replace(/\s+/g, " ").trim();
	if (normalized.length <= max) {
		return normalized;
	}
	return `${normalized.slice(0, max)}…`;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function buildPromptOption(prompt: PromptSource): VoicePaletteOption {
	const label = PROMPT_CATEGORY_LABELS[prompt.category];
	const types = Array.from(
		new Set([
			label,
			...prompt.tags,
			prompt.category.replace(/_/g, " "),
			"prompt",
		]),
	).filter(Boolean);

	return {
		id: prompt.isTemplate
			? `prompt-template-${prompt.id}`
			: `prompt-${prompt.id}`,
		name: prompt.name,
		category: label,
		types,
		description: prompt.description
			? prompt.description
			: truncateContent(prompt.content),
		badge: prompt.isTemplate ? "Template" : "Saved",
	};
}

function buildChipOption(
	chip: ChipDefinition,
	args: {
		category: string;
		badge: string;
		baseId: string;
	},
): VoicePaletteOption {
	const keywordTypes = [
		chip.type,
		...chip.label.toLowerCase().split(/\s+/),
		...args.category.toLowerCase().split(/\s+/),
	];

	return {
		id: `${args.baseId}-${chip.key}`,
		name: chip.label,
		category: args.category,
		types: Array.from(
			new Set(keywordTypes.map((token) => token.trim()).filter(Boolean)),
		),
		description: chip.description,
		badge: args.badge,
	};
}

function mergeVoiceOptions(
	...lists: Array<ReadonlyArray<VoicePaletteOption>>
): VoicePaletteOption[] {
	const map = new Map<string, VoicePaletteOption>();
	lists.flat().forEach((option) => {
		if (!map.has(option.id)) {
			map.set(option.id, option);
		}
	});
	return Array.from(map.values());
}

type VoiceIconComponent = React.ComponentType<{ className?: string }>;

const VOICE_ICON_MAP: Record<string, VoiceIconComponent> = {
	activity: Activity,
	"message-square": MessageSquare,
	globe: Globe,
	layers: Layers,
	"shield-check": ShieldCheck,
	phone: Phone,
	"phone-call": PhoneCall,
	sparkles: Sparkles,
	timer: Timer,
	target: Target,
	users: Users,
};

const SESSION_CATEGORY = "My Sessions";
const SPRINT_CATEGORY = "Sprints";
const SESSION_THREAD_PREFIX = "session-thread-";

const QUICK_SECTION_ORDER = [
	SESSION_CATEGORY,
	SPRINT_CATEGORY,
	"AI Agents (A2A)",
	"Platform Variables",
	"Tools & Functions",
	"Automations & Workflows",
	"Resources & Files",
	"Sales Scripts & Prompts",
	"Audience Search",
	"Enrichment",
	"Outreach",
	"Analytics",
	"Custom Templates",
];

type FocusWidgetVariant = FocusModePanelProps["variant"];

type VariantSectionConfig = {
	id: string;
	label: string;
	description?: string;
	options: ReadonlyArray<VoicePaletteOption>;
	variants: ReadonlyArray<FocusWidgetVariant>;
	accent?: "primary" | "neutral";
	injectIntoQuickSections?: boolean;
};

const VARIANT_SECTION_CONFIGS: VariantSectionConfig[] = [
	{
		id: "phone-communications",
		label: "Call & SMS Actions",
		description: "Dialer-ready playbooks for live calls and instant texting.",
		options: PHONE_COMMS_OPTIONS,
		variants: ["phone"],
		accent: "primary",
		injectIntoQuickSections: true,
	},
	{
		id: "phone-dialer-recommendations",
		label: "Dialer Feature Highlights",
		description: "What makes DealScale’s power dialer stand out.",
		options: PHONE_DIALER_RECOMMENDATIONS,
		variants: ["phone"],
		accent: "neutral",
		injectIntoQuickSections: false,
	},
];

function resolveVoiceIcon(name?: string): VoiceIconComponent | null {
	if (!name) return null;
	return VOICE_ICON_MAP[name] ?? null;
}

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
	numeric: "auto",
});

function formatRelativeTime(date: Date): string {
	const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
	const divisions = [
		{ amount: 60, unit: "second" },
		{ amount: 60, unit: "minute" },
		{ amount: 24, unit: "hour" },
		{ amount: 7, unit: "day" },
		{ amount: 4.34524, unit: "week" },
		{ amount: 12, unit: "month" },
		{ amount: Number.POSITIVE_INFINITY, unit: "year" },
	] as const;

	let unit: Intl.RelativeTimeFormatUnit = "second";
	let value = diffSeconds;
	for (const division of divisions) {
		if (Math.abs(value) < division.amount) {
			unit = division.unit as Intl.RelativeTimeFormatUnit;
			break;
		}
		value /= division.amount;
	}
	return relativeTimeFormat.format(Math.round(value), unit);
}

function extractSessionThreadId(id: string): string | null {
	if (id.startsWith(SESSION_THREAD_PREFIX)) {
		return id.slice(SESSION_THREAD_PREFIX.length);
	}
	return null;
}

interface FocusPanelSharedProps {
	onAgentSelect?: (agentId: string) => void;
	onClipboardPaste?: (content: string) => void;
	onMediaEvent?: (event: VoiceMediaEvent) => void;
	onRequestBrowserAccess?: () => void;
	videoAvatar?: ReactNode;
}

type FocusModePanelProps = FocusPanelSharedProps & {
	variant: "voice" | "video" | "phone";
	isAnimating?: boolean;
	onToggleAnimation?: () => void;
	voiceLottieRef?: React.MutableRefObject<LottieRefCurrentProps | null>;
};

export interface VoiceModePanelProps extends FocusPanelSharedProps {
	isAnimating: boolean;
	onToggleAnimation: () => void;
	voiceLottieRef: React.MutableRefObject<LottieRefCurrentProps | null>;
}

export interface VideoModePanelProps extends FocusPanelSharedProps {}

export interface PhoneModePanelProps extends FocusPanelSharedProps {}

type MediaStatus = "idle" | "pending" | "active" | "error";

export type VoiceMediaEvent =
	| { type: "screen-share" | "webcam" | "call" | "sms"; status: "pending" }
	| { type: "screen-share" | "webcam" | "call" | "sms"; status: "granted" }
	| {
			type: "screen-share" | "webcam" | "call" | "sms";
			status: "denied";
			error?: string;
	  };

const MEDIA_STATUS_COPY: Record<
	"screen-share" | "webcam" | "call" | "sms",
	Record<MediaStatus, { message: string; description: string }>
> = {
	"screen-share": {
		idle: {
			message: "Share screen",
			description: "Grant access so the AI can follow along.",
		},
		pending: {
			message: "Waiting for screen permission…",
			description: "Confirm the browser prompt to continue.",
		},
		active: {
			message: "Screen sharing enabled",
			description: "You can now collaborate with the AI in real time.",
		},
		error: {
			message: "Screen share blocked",
			description: "Try again when you are ready.",
		},
	},
	webcam: {
		idle: {
			message: "Share webcam",
			description: "Let the AI pick up non-verbal signals.",
		},
		pending: {
			message: "Awaiting webcam permission…",
			description: "Approve the request in your browser.",
		},
		active: {
			message: "Webcam streaming",
			description: "The AI is now receiving visual context.",
		},
		error: {
			message: "Webcam access blocked",
			description: "You can retry any time.",
		},
	},
	call: {
		idle: {
			message: "Place call",
			description: "Dial prospects with AI-assisted coaching.",
		},
		pending: {
			message: "Dialing secure line…",
			description: "Connecting your call through DealScale voice.",
		},
		active: {
			message: "Call connected",
			description: "Live transcription and coaching are active.",
		},
		error: {
			message: "Call failed",
			description: "Check microphone access or retry the dial.",
		},
	},
	sms: {
		idle: {
			message: "Send SMS",
			description: "Trigger AI-personalized text follow-ups.",
		},
		pending: {
			message: "Sending SMS…",
			description: "Queuing message via omni-channel service.",
		},
		active: {
			message: "SMS delivered",
			description: "Replies will sync back into the workspace.",
		},
		error: {
			message: "SMS failed",
			description: "Verify routing and try sending again.",
		},
	},
};

function FocusModePanel({
	variant,
	isAnimating = false,
	onToggleAnimation,
	voiceLottieRef,
	onAgentSelect,
	onClipboardPaste,
	onMediaEvent,
	onRequestBrowserAccess,
	videoAvatar,
}: FocusModePanelProps): React.ReactElement {
	const sessionHistory = useMusicPreferencesStore(
		(state) => state.sessionHistory,
	);
	const assetLibrary = useMusicPreferencesStore((state) => state.assetLibrary);
	const addSessionHistory = useMusicPreferencesStore(
		(state) => state.addSessionHistory,
	);
	const bookmarkedSessionIds = useMusicPreferencesStore(
		(state) => state.bookmarkedSessionIds,
	);
	const toggleSessionBookmark = useMusicPreferencesStore(
		(state) => state.toggleSessionBookmark,
	);
	const threads = useAIChatStore((state) => state.threads);
	const currentThreadId = useAIChatStore((state) => state.currentThreadId);
	const createThread = useAIChatStore((state) => state.createThread);
	const setCurrentThread = useAIChatStore((state) => state.setCurrentThread);
	const { templates, savedPrompts } = useUserPromptsStore((state) => ({
		templates: state.templates,
		savedPrompts: state.savedPrompts,
	}));
	const [optionFilter, setOptionFilter] = useState("");
	const normalizedFilter = optionFilter.trim().toLowerCase();
	const chipOptions = useMemo(() => {
		const variables = PLATFORM_VARIABLES.map((chip) =>
			buildChipOption(chip, {
				category: "Platform Variables",
				badge: "Variable",
				baseId: "chip-variable",
			}),
		);
		const tools = PLATFORM_TOOLS.map((chip) =>
			buildChipOption(chip, {
				category: "Tools & Functions",
				badge: "Tool",
				baseId: "chip-tool",
			}),
		);
		const agents = CHIP_AI_AGENTS.map((chip) =>
			buildChipOption(chip, {
				category: "AI Agents (A2A)",
				badge: "Agent",
				baseId: "chip-agent",
			}),
		);
		const resources = PLATFORM_RESOURCES.map((chip) =>
			buildChipOption(chip, {
				category: "Resources & Files",
				badge: "Resource",
				baseId: "chip-resource",
			}),
		);
		const automations = PLATFORM_AUTOMATIONS.map((chip) =>
			buildChipOption(chip, {
				category: "Automations & Workflows",
				badge: "Automation",
				baseId: "chip-automation",
			}),
		);
		return { variables, tools, agents, resources, automations };
	}, []);
	const [screenStatus, setScreenStatus] = useState<MediaStatus>("idle");
	const [webcamStatus, setWebcamStatus] = useState<MediaStatus>("idle");
	const [screenError, setScreenError] = useState<string | null>(null);
	const [webcamError, setWebcamError] = useState<string | null>(null);
	const [browserAccessState, setBrowserAccessState] = useState<
		"idle" | "pending" | "granted"
	>("idle");
	const [browserHoldProgress, setBrowserHoldProgress] = useState(0);
	const [isHoldingBrowser, setIsHoldingBrowser] = useState(false);
	const [clipboardStatus, setClipboardStatus] = useState<
		"idle" | "pending" | "success" | "error"
	>("idle");
	const [clipboardError, setClipboardError] = useState<string | null>(null);
	const clipboardResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasInitializedStatusRef = useRef(false);
	const fallbackVoiceRef = useRef<LottieRefCurrentProps | null>(null);
	const resolvedVoiceRef = voiceLottieRef ?? fallbackVoiceRef;
	const isVoice = variant === "voice";
	const isVideo = variant === "video";
	const isPhone = variant === "phone";
	const heroPrompts = isVoice
		? VOICE_PROMPTS
		: isVideo
			? VIDEO_PROMPTS
			: PHONE_PROMPTS;
	const animationActive = isVoice ? isAnimating : false;
	const toggleAnimation = onToggleAnimation ?? (() => {});
	const defaultResetStatus: VoiceConnectionStatus = isPhone
		? "idle"
		: "streaming";
	const voiceWords = animationActive
		? heroPrompts
		: ["Voice capture paused.", "Tap the mic to resume AI narration."];
	const voiceStatus = useMusicPreferencesStore((state) => state.voiceStatus);
	const voiceStatusMessage = useMusicPreferencesStore(
		(state) => state.voiceStatusMessage,
	);
	const voiceStatusUpdatedAt = useMusicPreferencesStore(
		(state) => state.voiceStatusUpdatedAt,
	);
	const setVoiceStatus = useMusicPreferencesStore(
		(state) => state.setVoiceStatus,
	);

	useEffect(() => {
		return () => {
			if (clipboardResetRef.current !== null) {
				clearTimeout(clipboardResetRef.current);
			}
		};
	}, []);

	const queueClipboardReset = useCallback(
		(delay = 2500, nextStatus?: VoiceConnectionStatus) => {
			if (clipboardResetRef.current) {
				clearTimeout(clipboardResetRef.current);
			}
			clipboardResetRef.current = setTimeout(() => {
				setClipboardStatus("idle");
				setClipboardError(null);
				const targetStatus = nextStatus ?? defaultResetStatus;
				setVoiceStatus(targetStatus, {
					priority: VOICE_STATUS_PRIORITY[targetStatus],
					force: true,
					message: VOICE_STATUS_DEFAULT_MESSAGES[targetStatus],
				});
				clipboardResetRef.current = null;
			}, delay);
		},
		[defaultResetStatus, setVoiceStatus],
	);

	useEffect(() => {
		if (hasInitializedStatusRef.current) return;
		hasInitializedStatusRef.current = true;

		if (isPhone) {
			setVoiceStatus("idle", {
				force: true,
				priority: VOICE_STATUS_PRIORITY.idle,
				message: "Phone co-pilot is ready for calls and SMS.",
			});
			return;
		}

		if (isVideo) {
			setVoiceStatus("streaming", {
				force: true,
				priority: VOICE_STATUS_PRIORITY.streaming,
				message: "Streaming avatar feed in real time.",
			});
			return;
		}

		setVoiceStatus("connecting", {
			force: true,
			priority: VOICE_STATUS_PRIORITY.connecting,
			message: VOICE_STATUS_DEFAULT_MESSAGES.connecting,
		});
		const timer = setTimeout(() => {
			setVoiceStatus("streaming", {
				force: true,
				priority: VOICE_STATUS_PRIORITY.streaming,
				message: VOICE_STATUS_DEFAULT_MESSAGES.streaming,
			});
		}, 900);
		return () => {
			clearTimeout(timer);
		};
	}, [isPhone, isVideo, setVoiceStatus]);

	useEffect(() => {
		if (!isVoice) return;
		setVoiceStatus(animationActive ? "streaming" : "listening", {
			priority:
				VOICE_STATUS_PRIORITY[animationActive ? "streaming" : "listening"],
			message: animationActive
				? VOICE_STATUS_DEFAULT_MESSAGES.streaming
				: VOICE_STATUS_DEFAULT_MESSAGES.listening,
		});
	}, [animationActive, isVoice, setVoiceStatus]);

	const primaryMediaType = isPhone ? "call" : "screen-share";
	const secondaryMediaType = isPhone ? "sms" : "webcam";

	const primaryMessage = useMemo(() => {
		const base = MEDIA_STATUS_COPY[primaryMediaType][screenStatus];
		return {
			...base,
			description:
				screenStatus === "error" && screenError
					? screenError
					: base.description,
		};
	}, [primaryMediaType, screenError, screenStatus]);

	const secondaryMessage = useMemo(() => {
		const base = MEDIA_STATUS_COPY[secondaryMediaType][webcamStatus];
		return {
			...base,
			description:
				webcamStatus === "error" && webcamError
					? webcamError
					: base.description,
		};
	}, [secondaryMediaType, webcamError, webcamStatus]);

	const clipboardTooltipText = useMemo(() => {
		switch (clipboardStatus) {
			case "pending":
				return "Reading from your clipboard…";
			case "success":
				return "Clipboard pasted into the focus assistant.";
			case "error":
				return clipboardError ?? "Clipboard access was denied.";
			default:
				return "Paste clipboard content into the AI workspace.";
		}
	}, [clipboardError, clipboardStatus]);

	const filterOptionsByQuery = useCallback(
		(options: ReadonlyArray<VoicePaletteOption>) => {
			if (!normalizedFilter) return options as VoicePaletteOption[];
			return (options as VoicePaletteOption[]).filter((option) => {
				const haystack = [
					option.name,
					option.description ?? "",
					option.category ?? "",
					...(option.types ?? []),
				]
					.join(" ")
					.toLowerCase();
				return haystack.includes(normalizedFilter);
			});
		},
		[normalizedFilter],
	);

	const baseResourceOptions = useMemo<VoicePaletteOption[]>(() => {
		return assetLibrary.length > 0 ? assetLibrary : VOICE_ASSET_OPTIONS;
	}, [assetLibrary]);
	const resourceOptions = useMemo<VoicePaletteOption[]>(() => {
		return mergeVoiceOptions(baseResourceOptions, chipOptions.resources);
	}, [baseResourceOptions, chipOptions.resources]);

	const agentOptions = useMemo<VoicePaletteOption[]>(() => {
		return mergeVoiceOptions(VOICE_AGENT_OPTIONS, chipOptions.agents);
	}, [chipOptions.agents]);

	const sortedThreads = useMemo<AIChatThread[]>(() => {
		return [...threads].sort((a, b) => {
			const aTime = Date.parse(a.updatedAt ?? a.createdAt);
			const bTime = Date.parse(b.updatedAt ?? b.createdAt);
			const safeA = Number.isNaN(aTime) ? 0 : aTime;
			const safeB = Number.isNaN(bTime) ? 0 : bTime;
			return safeB - safeA;
		});
	}, [threads]);

	const buildThreadOption = useCallback(
		(thread: AIChatThread): VoicePaletteOption => {
			const updatedAt = new Date(thread.updatedAt ?? thread.createdAt);
			const description = Number.isNaN(updatedAt.getTime())
				? "Session ready for launch."
				: `Updated ${formatRelativeTime(updatedAt)}`;
			const isActive = thread.id === currentThreadId;
			const isBookmarked = bookmarkedSessionIds.includes(thread.id);
			const baseTypes = ["session", "thread"];
			const contextualTypes = [
				thread.relatedLeadId ? "lead" : null,
				thread.relatedCampaignId ? "campaign" : null,
				isBookmarked ? "bookmarked" : null,
				isActive ? "active" : null,
			].filter(Boolean) as string[];

			return {
				id: `${SESSION_THREAD_PREFIX}${thread.id}`,
				name: thread.title || "Untitled session",
				category: SESSION_CATEGORY,
				types: [...baseTypes, ...contextualTypes],
				description,
				icon: isActive ? "activity" : "message-square",
				bookmarked: isBookmarked,
				badge: isActive ? "Active" : undefined,
			};
		},
		[bookmarkedSessionIds, currentThreadId],
	);

	const dynamicSessionOptions = useMemo<VoicePaletteOption[]>(() => {
		return sortedThreads.map((thread) => buildThreadOption(thread));
	}, [buildThreadOption, sortedThreads]);

	const sessionOptions = useMemo<VoicePaletteOption[]>(() => {
		if (!dynamicSessionOptions.length) {
			return VOICE_SESSION_OPTIONS.map((option) => ({ ...option }));
		}
		const newSessionAction = VOICE_SESSION_OPTIONS.find(
			(option) => option.id === "session-new",
		);
		const actionOptions = newSessionAction ? [{ ...newSessionAction }] : [];
		return mergeVoiceOptions(dynamicSessionOptions, actionOptions);
	}, [dynamicSessionOptions]);

	const sessionActionMap = useMemo<Map<string, () => void>>(() => {
		const map = new Map<string, () => void>();
		sessionOptions.forEach((option) => {
			if (option.id === "session-new") {
				map.set(option.id, () => {
					const now = new Date();
					const formatter = new Intl.DateTimeFormat("en", {
						hour: "numeric",
						minute: "2-digit",
					});
					const title = `${option.name} • ${formatter.format(now)}`;
					const threadId = createThread(title);
					setCurrentThread(threadId);
				});
				return;
			}
			const threadId = extractSessionThreadId(option.id);
			if (!threadId) return;
			map.set(option.id, () => {
				setCurrentThread(threadId);
			});
		});
		return map;
	}, [createThread, sessionOptions, setCurrentThread]);

	const promptData = useMemo(() => {
		const sources: PromptSource[] = [
			...templates.map((template: PromptTemplate) => ({
				id: template.id,
				category: template.category,
				name: template.name,
				description: template.description,
				content: template.content,
				tags: template.tags ?? [],
				isTemplate: true,
			})),
			...savedPrompts.map((prompt: UserPrompt) => ({
				id: prompt.id,
				category: prompt.category,
				name: prompt.name,
				description: null,
				content: prompt.content,
				tags: prompt.tags ?? [],
				isTemplate: false,
			})),
		];

		const byCategory = new Map<PromptCategory, VoicePaletteOption[]>();
		for (const prompt of sources) {
			const option = buildPromptOption(prompt);
			const existing = byCategory.get(prompt.category);
			if (existing) {
				existing.push(option);
			} else {
				byCategory.set(prompt.category, [option]);
			}
		}

		const sections = PROMPT_CATEGORY_ORDER.filter((category) =>
			byCategory.has(category),
		).map((category) => ({
			category,
			label: PROMPT_CATEGORY_LABELS[category],
			options: byCategory.get(category) ?? [],
		}));

		const promptOptions = sections.flatMap((section) => section.options);

		return { promptOptions, sections };
	}, [savedPrompts, templates]);
	const promptOptions = promptData.promptOptions;
	const promptSections = promptData.sections;

	const quickSections = useMemo<
		Array<{ title: string; options: VoicePaletteOption[] }>
	>(() => {
		const sectionMap = new Map<string, VoicePaletteOption[]>();
		const addSection = (
			label: string,
			options: ReadonlyArray<VoicePaletteOption>,
			config?: { variants?: ReadonlyArray<FocusWidgetVariant> },
		) => {
			if (!options.length) {
				return;
			}
			if (
				config?.variants &&
				!config.variants.some((target) => target === variant)
			) {
				return;
			}
			const existing = sectionMap.get(label);
			if (existing) {
				sectionMap.set(label, mergeVoiceOptions(existing, options));
			} else {
				sectionMap.set(label, [...options]);
			}
		};

		addSection(SESSION_CATEGORY, sessionOptions);
		addSection("AI Agents (A2A)", agentOptions);
		addSection("Platform Variables", chipOptions.variables);
		addSection("Tools & Functions", chipOptions.tools);
		addSection("Automations & Workflows", chipOptions.automations);
		addSection("Resources & Files", resourceOptions);
		addSection(SPRINT_CATEGORY, VOICE_SPRINT_OPTIONS);
		promptSections.forEach((section) =>
			addSection(section.label, section.options),
		);
		VARIANT_SECTION_CONFIGS.forEach((section) => {
			if (!section.injectIntoQuickSections) return;
			addSection(section.label, section.options, {
				variants: section.variants,
			});
		});

		const ordered: Array<{ title: string; options: VoicePaletteOption[] }> = [];
		QUICK_SECTION_ORDER.forEach((label) => {
			const options = sectionMap.get(label);
			if (options?.length) {
				ordered.push({ title: label, options });
				sectionMap.delete(label);
			}
		});
		sectionMap.forEach((options, label) => {
			ordered.push({ title: label, options });
		});

		const filtered = ordered
			.map(({ title, options }) => ({
				title,
				options: filterOptionsByQuery(options),
			}))
			.filter((section) => section.options.length);

		return filtered;
	}, [
		sessionOptions,
		agentOptions,
		chipOptions.automations,
		chipOptions.tools,
		chipOptions.variables,
		promptSections,
		resourceOptions,
		filterOptionsByQuery,
		variant,
	]);

	const variantHighlightSections = useMemo(() => {
		return VARIANT_SECTION_CONFIGS.filter((section) =>
			section.variants.includes(variant),
		)
			.map((section) => ({
				...section,
				options: filterOptionsByQuery(section.options),
			}))
			.filter((section) => section.options.length);
	}, [filterOptionsByQuery, variant]);
	const hasSearchFilter = Boolean(normalizedFilter);

	const paletteOptions = useMemo<VoicePaletteOption[]>(() => {
		const history = sessionHistory
			.slice()
			.sort((a, b) => b.lastUsed - a.lastUsed)
			.map(({ lastUsed: _ignored, ...rest }) => {
				const threadId = extractSessionThreadId(rest.id);
				const isBookmarked = threadId
					? bookmarkedSessionIds.includes(threadId)
					: (rest.bookmarked ?? false);
				return {
					...rest,
					bookmarked: isBookmarked,
					badge: "Recent",
				};
			});
		const merged = new Map<string, VoicePaletteOption>();
		history.forEach((option) => merged.set(option.id, option));
		[
			...sessionOptions,
			...VOICE_SPRINT_OPTIONS,
			...agentOptions,
			...resourceOptions,
			...chipOptions.variables,
			...chipOptions.tools,
			...chipOptions.automations,
			...promptOptions,
		].forEach((option) => {
			if (!merged.has(option.id)) {
				merged.set(option.id, option);
			}
		});
		return Array.from(merged.values());
	}, [
		agentOptions,
		resourceOptions,
		chipOptions.automations,
		chipOptions.tools,
		chipOptions.variables,
		promptOptions,
		sessionHistory,
		sessionOptions,
		bookmarkedSessionIds,
	]);

	const historyPreview = useMemo<VoicePaletteOption[]>(() => {
		const preview = sessionHistory
			.slice()
			.sort((a, b) => b.lastUsed - a.lastUsed)
			.slice(0, 3)
			.map(({ lastUsed: _ignored, ...rest }) => {
				const threadId = extractSessionThreadId(rest.id);
				const isBookmarked = threadId
					? bookmarkedSessionIds.includes(threadId)
					: (rest.bookmarked ?? false);
				return {
					...rest,
					bookmarked: isBookmarked,
				};
			});
		return filterOptionsByQuery(preview);
	}, [bookmarkedSessionIds, filterOptionsByQuery, sessionHistory]);

	const hasActionResults =
		variantHighlightSections.length > 0 ||
		quickSections.length > 0 ||
		historyPreview.length > 0;

	const handleOptionSelect = useCallback(
		(option: VoicePaletteOption) => {
			const isSession = option.types.includes("session");
			if (isSession) {
				const action = sessionActionMap.get(option.id);
				action?.();
				if (option.id.startsWith(SESSION_THREAD_PREFIX)) {
					addSessionHistory(option);
				}
				return;
			}
			addSessionHistory(option);
			onAgentSelect?.(option.id);
		},
		[addSessionHistory, onAgentSelect, sessionActionMap],
	);

	const handleBookmarkToggle = useCallback(
		(option: VoicePaletteOption) => {
			const threadId = extractSessionThreadId(option.id);
			if (!threadId) return;
			toggleSessionBookmark(threadId);
		},
		[toggleSessionBookmark],
	);

	const handleClipboardPaste = useCallback(async () => {
		setClipboardError(null);
		const clipboardApi =
			typeof navigator !== "undefined" ? navigator.clipboard : undefined;
		if (!clipboardApi || typeof clipboardApi.readText !== "function") {
			setClipboardStatus("error");
			const message = "Clipboard access is unavailable in this browser.";
			setClipboardError(message);
			setVoiceStatus("attention", {
				force: true,
				priority: VOICE_STATUS_PRIORITY.attention,
				message,
			});
			queueClipboardReset(3500, isVoice ? "listening" : undefined);
			return;
		}

		try {
			setClipboardStatus("pending");
			setVoiceStatus("processing", {
				force: true,
				priority: VOICE_STATUS_PRIORITY.processing,
				message: "Importing clipboard briefing for the AI agent…",
			});
			const raw = await clipboardApi.readText();
			const normalized = raw.trim();
			if (!normalized) {
				const message = "Clipboard is empty or contains unsupported data.";
				setClipboardStatus("error");
				setClipboardError(message);
				setVoiceStatus("attention", {
					force: true,
					priority: VOICE_STATUS_PRIORITY.attention,
					message,
				});
				queueClipboardReset(3500, isVoice ? "listening" : undefined);
				return;
			}
			onClipboardPaste?.(normalized);
			onAgentSelect?.("clipboard:ingest");
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("dealScale:focusWidget:clipboardPaste", {
						detail: {
							content: normalized,
							length: normalized.length,
							timestamp: Date.now(),
						},
					}),
				);
			}
			setClipboardStatus("success");
			queueClipboardReset(2000);
		} catch (error) {
			console.error("[FocusWidget] clipboard paste failed", error);
			const message =
				error instanceof Error
					? error.message
					: "Clipboard read failed. Check browser permissions.";
			setClipboardStatus("error");
			setClipboardError(message);
			setVoiceStatus("attention", {
				force: true,
				priority: VOICE_STATUS_PRIORITY.attention,
				message,
			});
			queueClipboardReset(3500, isVoice ? "listening" : undefined);
		}
	}, [onAgentSelect, onClipboardPaste, queueClipboardReset, setVoiceStatus]);

	const handleMediaResult = useCallback(
		(event: VoiceMediaEvent) => {
			onMediaEvent?.(event);
			const { type, status, error } = event;

			if (type === "call") {
				if (status === "pending") {
					setVoiceStatus("connecting", {
						priority: VOICE_STATUS_PRIORITY.connecting,
						message: "Dialing contact through DealScale voice…",
					});
				} else if (status === "granted") {
					setVoiceStatus("streaming", {
						force: true,
						priority: VOICE_STATUS_PRIORITY.streaming,
						message:
							"Live call connected. Transcribing and coaching in real time.",
					});
				} else if (status === "denied") {
					setVoiceStatus("attention", {
						force: true,
						priority: VOICE_STATUS_PRIORITY.attention,
						message: error ?? "Call failed. Check microphone access and retry.",
					});
				}
			} else if (type === "sms") {
				if (status === "pending") {
					setVoiceStatus("processing", {
						priority: VOICE_STATUS_PRIORITY.processing,
						message: "Dispatching SMS via omni-channel pipeline…",
					});
				} else if (status === "granted") {
					setVoiceStatus("processing", {
						force: true,
						priority: VOICE_STATUS_PRIORITY.processing,
						message: "SMS delivered. Monitoring replies in real time.",
					});
				} else if (status === "denied") {
					setVoiceStatus("attention", {
						force: true,
						priority: VOICE_STATUS_PRIORITY.attention,
						message: error ?? "SMS delivery failed. Verify routing and retry.",
					});
				}
			} else {
				if (status === "pending") {
					setVoiceStatus("connecting", {
						priority: VOICE_STATUS_PRIORITY.connecting,
						message: "Awaiting media permission to continue streaming…",
					});
				} else if (status === "granted") {
					setVoiceStatus("streaming", {
						force: true,
						priority: VOICE_STATUS_PRIORITY.streaming,
					});
				} else if (status === "denied") {
					setVoiceStatus("disconnected", {
						force: true,
						priority: VOICE_STATUS_PRIORITY.disconnected,
						message:
							error ??
							"Media access denied. Enable permissions to resume voice support.",
					});
				}
			}

			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("dealScale:focusWidget:mediaEvent", {
						detail: event,
					}),
				);
			}
		},
		[onMediaEvent, setVoiceStatus],
	);

	const requestScreenShare = useCallback(async () => {
		setScreenError(null);
		setScreenStatus("pending");
		handleMediaResult({ type: "screen-share", status: "pending" });
		const devices =
			typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
		if (!devices || typeof devices.getDisplayMedia !== "function") {
			const message = "Screen sharing is not supported in this browser.";
			setScreenStatus("error");
			setScreenError(message);
			handleMediaResult({
				type: "screen-share",
				status: "denied",
				error: message,
			});
			return;
		}

		try {
			const stream = await devices.getDisplayMedia({
				video: { frameRate: 30 },
			});
			stream?.getTracks?.().forEach((track) => track.stop());
			setScreenStatus("active");
			handleMediaResult({ type: "screen-share", status: "granted" });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Screen share permission was declined.";
			setScreenStatus("error");
			setScreenError(message);
			handleMediaResult({
				type: "screen-share",
				status: "denied",
				error: message,
			});
		}
	}, [handleMediaResult]);

	const requestWebcam = useCallback(async () => {
		setWebcamError(null);
		setWebcamStatus("pending");
		handleMediaResult({ type: "webcam", status: "pending" });
		const devices =
			typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
		if (!devices || typeof devices.getUserMedia !== "function") {
			const message = "Webcam access is not available in this browser.";
			setWebcamStatus("error");
			setWebcamError(message);
			handleMediaResult({
				type: "webcam",
				status: "denied",
				error: message,
			});
			return;
		}

		try {
			const stream = await devices.getUserMedia({
				video: true,
				audio: false,
			});
			stream?.getTracks?.().forEach((track) => track.stop());
			setWebcamStatus("active");
			handleMediaResult({ type: "webcam", status: "granted" });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Webcam permission was declined.";
			setWebcamStatus("error");
			setWebcamError(message);
			handleMediaResult({
				type: "webcam",
				status: "denied",
				error: message,
			});
		}
	}, [handleMediaResult]);

	const requestCall = useCallback(async () => {
		setScreenError(null);
		setScreenStatus("pending");
		handleMediaResult({ type: "call", status: "pending" });
		try {
			await new Promise((resolve) => setTimeout(resolve, 800));
			setScreenStatus("active");
			handleMediaResult({ type: "call", status: "granted" });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Call could not be completed.";
			setScreenStatus("error");
			setScreenError(message);
			handleMediaResult({
				type: "call",
				status: "denied",
				error: message,
			});
		}
	}, [handleMediaResult]);

	const requestSms = useCallback(async () => {
		setWebcamError(null);
		setWebcamStatus("pending");
		handleMediaResult({ type: "sms", status: "pending" });
		try {
			await new Promise((resolve) => setTimeout(resolve, 600));
			setWebcamStatus("active");
			handleMediaResult({ type: "sms", status: "granted" });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "SMS delivery failed.";
			setWebcamStatus("error");
			setWebcamError(message);
			handleMediaResult({
				type: "sms",
				status: "denied",
				error: message,
			});
		}
	}, [handleMediaResult]);

	const primaryLabel = isPhone ? "Place call" : "Share screen";
	const secondaryLabel = isPhone ? "Send SMS" : "Share webcam";
	const primaryIcon = isPhone ? Phone : MonitorUp;
	const secondaryIcon = isPhone ? MessageSquare : Video;
	const primaryRequest = isPhone ? requestCall : requestScreenShare;
	const secondaryRequest = isPhone ? requestSms : requestWebcam;
	const accordionTitle = isPhone ? "Communication tools" : "Device permissions";
	const primaryStatusLabel = isPhone ? "Call" : "Screen";
	const secondaryStatusLabel = isPhone ? "SMS" : "Webcam";
	const PrimaryIcon = primaryIcon;
	const SecondaryIcon = secondaryIcon;

	const browserHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
	const browserHoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const browserHoldStartRef = useRef<number | null>(null);
	const browserHoldCompletedRef = useRef(false);
	const HOLD_DURATION_MS = 3000;

	const clearBrowserHoldTimers = useCallback(() => {
		if (browserHoldTimerRef.current) {
			clearTimeout(browserHoldTimerRef.current);
			browserHoldTimerRef.current = null;
		}
		if (browserHoldIntervalRef.current) {
			clearInterval(browserHoldIntervalRef.current);
			browserHoldIntervalRef.current = null;
		}
		browserHoldStartRef.current = null;
	}, []);

	useEffect(() => {
		return () => {
			clearBrowserHoldTimers();
		};
	}, [clearBrowserHoldTimers]);

	const resetBrowserHold = useCallback(() => {
		clearBrowserHoldTimers();
		browserHoldCompletedRef.current = false;
		setIsHoldingBrowser(false);
		setBrowserHoldProgress(0);
		setBrowserAccessState("idle");
	}, [clearBrowserHoldTimers]);

	const grantBrowserAccess = useCallback(() => {
		if (!onRequestBrowserAccess || browserAccessState === "granted") {
			clearBrowserHoldTimers();
			setIsHoldingBrowser(false);
			setBrowserHoldProgress(100);
			return;
		}
		clearBrowserHoldTimers();
		browserHoldCompletedRef.current = true;
		setIsHoldingBrowser(false);
		setBrowserHoldProgress(100);
		setBrowserAccessState("granted");
		onRequestBrowserAccess();
	}, [browserAccessState, clearBrowserHoldTimers, onRequestBrowserAccess]);

	const handleBrowserPointerDown = useCallback(() => {
		if (!onRequestBrowserAccess) {
			return;
		}

		clearBrowserHoldTimers();
		browserHoldCompletedRef.current = false;
		setBrowserAccessState("pending");
		setBrowserHoldProgress(0);
		setIsHoldingBrowser(true);
		browserHoldStartRef.current = Date.now();

		browserHoldIntervalRef.current = setInterval(() => {
			if (!browserHoldStartRef.current) return;
			const elapsed = Date.now() - browserHoldStartRef.current;
			const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
			setBrowserHoldProgress(progress);
		}, 50);

		browserHoldTimerRef.current = setTimeout(() => {
			grantBrowserAccess();
		}, HOLD_DURATION_MS);
	}, [
		HOLD_DURATION_MS,
		clearBrowserHoldTimers,
		grantBrowserAccess,
		onRequestBrowserAccess,
	]);

	const handleBrowserPointerUp = useCallback(() => {
		if (browserHoldCompletedRef.current) {
			browserHoldCompletedRef.current = false;
			return;
		}
		grantBrowserAccess();
	}, [grantBrowserAccess]);

	const handleBrowserPointerCancel = useCallback(() => {
		resetBrowserHold();
	}, [resetBrowserHold]);

	const browserProgressStyle =
		isHoldingBrowser || browserAccessState === "pending"
			? {
					background: `conic-gradient(hsl(var(--primary)) ${browserHoldProgress}%, rgba(255,255,255,0.08) ${browserHoldProgress}% 100%)`,
				}
			: undefined;

	const browserButtonIcon =
		browserAccessState === "granted" ? (
			<Check className="h-4 w-4" />
		) : browserAccessState === "pending" ? (
			<Loader2 className="h-4 w-4 animate-spin" />
		) : (
			<Globe className="h-4 w-4" />
		);

	const callStatusLabel = isPhone
		? (() => {
				switch (screenStatus) {
					case "active":
						return "Live call connected";
					case "pending":
						return "Dialing contact…";
					case "error":
						return screenError ?? "Call blocked";
					default:
						return "Ready to dial";
				}
			})()
		: "";

	const videoAvatarNode = videoAvatar ?? (
		<div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-primary/40">
			<div className="h-24 w-24 rounded-full border border-primary/40 bg-primary/20 shadow-xl backdrop-blur" />
			<div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
		</div>
	);

	const heroContent = isVideo ? (
		<div className="flex w-full max-w-sm flex-col items-center gap-3">
			<div className="relative h-48 w-full overflow-hidden rounded-3xl border border-primary/25 bg-primary/10 shadow-inner">
				{videoAvatarNode}
				<span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
					Live
				</span>
			</div>
			<p className="text-center text-sm font-medium text-primary/80">
				{heroPrompts[0]}
			</p>
		</div>
	) : isPhone ? (
		<div className="flex w-full max-w-sm flex-col items-center gap-3">
			<div className="relative h-48 w-full overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 shadow-inner">
				<div className="absolute inset-0 bg-primary/40 blur-3xl opacity-30" />
				<div className="relative flex h-full w-full flex-col justify-between gap-4 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 text-primary">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
								<PhoneCall className="h-6 w-6" aria-hidden />
							</div>
							<div className="text-left">
								<p className="text-sm font-semibold text-primary">
									DealScale Dialer
								</p>
								<p className="text-xs text-primary/70">{callStatusLabel}</p>
							</div>
						</div>
						<span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
							SMS ready
						</span>
					</div>
					<div className="rounded-2xl bg-background/80 p-3 text-xs text-primary/80 shadow-inner">
						<p>{heroPrompts[0]}</p>
					</div>
				</div>
			</div>
			<p className="text-center text-sm font-medium text-primary/80">
				{heroPrompts[1]}
			</p>
		</div>
	) : (
		<>
			<motion.button
				type="button"
				onClick={toggleAnimation}
				className={cn(
					"group relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition focus:outline-none focus:ring-2 focus:ring-primary/40",
					animationActive
						? "bg-primary text-background"
						: "bg-primary/15 text-primary",
				)}
				aria-label={
					animationActive ? "Pause voice capture" : "Resume voice capture"
				}
				aria-pressed={animationActive}
				animate={animationActive ? { scale: [1, 1.05, 1] } : undefined}
				transition={
					animationActive
						? {
								duration: 2.4,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "loop",
							}
						: undefined
				}
			>
				<Lottie
					lottieRef={resolvedVoiceRef}
					className="pointer-events-none h-14 w-14"
					animationData={VoiceLottie}
					loop
					autoplay
				/>
				<span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/10 opacity-0 transition-opacity group-hover:opacity-10" />
			</motion.button>
			<TypewriterEffect
				words={voiceWords.map((text) => ({ text }))}
				className="text-center font-semibold text-primary/90 text-xs leading-relaxed sm:text-sm"
				cursorClassName="bg-primary"
			/>
		</>
	);

	const footerCopy = isPhone
		? "Logging calls and syncing SMS transcripts automatically."
		: "The AI co-pilot drafts transcripts while the mic pulse is active.";

	const browserTooltipText =
		browserAccessState === "granted"
			? "Browser assistance enabled"
			: "Click to enable instantly or press and hold for 3 seconds to confirm";

	return (
		<div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-secondary/30 to-background text-secondary-foreground">
			{onRequestBrowserAccess ? (
				<div className="pointer-events-auto absolute left-4 top-4 z-10">
					<TooltipProvider delayDuration={150}>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									aria-label="Press and hold to enable browser assistance"
									title="Enable browser assistance"
									aria-pressed={browserAccessState === "granted"}
									onClick={(event) => {
										event.preventDefault();
										grantBrowserAccess();
									}}
									onPointerDown={handleBrowserPointerDown}
									onPointerUp={handleBrowserPointerUp}
									onPointerLeave={handleBrowserPointerCancel}
									onPointerCancel={handleBrowserPointerCancel}
									className={cn(
										"relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-background/70 text-primary shadow-md transition focus:outline-none focus:ring-2 focus:ring-primary/30",
										browserAccessState === "granted" &&
											"border-primary bg-primary text-primary-foreground",
									)}
								>
									<span
										className={cn(
											"absolute inset-0 rounded-full opacity-0 transition-opacity",
											(isHoldingBrowser || browserAccessState === "pending") &&
												"opacity-80",
										)}
										style={browserProgressStyle}
									/>
									<span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background/70">
										{browserButtonIcon}
									</span>
									<span className="sr-only">
										Browser assistance status: {browserAccessState}
									</span>
								</button>
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								sideOffset={8}
								className="max-w-xs text-xs"
							>
								{browserTooltipText}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			) : null}
			<div className="pointer-events-auto absolute right-4 top-4 z-10 flex items-center gap-2">
				<TooltipProvider delayDuration={150}>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={handleClipboardPaste}
								disabled={clipboardStatus === "pending"}
								aria-label="Paste clipboard content into the focus assistant"
								aria-busy={clipboardStatus === "pending"}
								className={cn(
									"relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-background/70 text-primary shadow-md transition focus:outline-none focus:ring-2 focus:ring-primary/30",
									clipboardStatus === "pending" && "opacity-75",
									clipboardStatus === "success" &&
										"border-primary bg-primary text-primary-foreground",
									clipboardStatus === "error" &&
										"border-destructive/60 text-destructive focus:ring-destructive/30",
								)}
							>
								{clipboardStatus === "pending" ? (
									<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
								) : clipboardStatus === "success" ? (
									<Check className="h-4 w-4" aria-hidden />
								) : (
									<Clipboard className="h-4 w-4" aria-hidden />
								)}
								<span className="sr-only">
									Clipboard status: {clipboardStatus}
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							sideOffset={8}
							className="max-w-xs text-xs"
						>
							{clipboardTooltipText}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<TrackCommandPalette
					triggerLabel="Browse sessions, assets, and assistants"
					triggerVariant="icon"
					triggerIcon={
						<Sparkles className="h-5 w-5 text-primary" aria-hidden />
					}
					placeholder="Search agents, sessions, or tags"
					options={paletteOptions}
					onSelect={handleOptionSelect}
					iconResolver={resolveVoiceIcon}
					onBookmarkToggle={handleBookmarkToggle}
				/>
			</div>
			<div className="flex-1 overflow-y-auto px-5 pb-6 pt-20 [touch-action:pan-y] [overscroll-behavior-y:contain] [-webkit-overflow-scrolling:touch]">
				<div className="mx-auto flex w-full max-w-sm flex-col items-stretch gap-5">
					<div className="flex flex-col items-center gap-4">
						<VoiceStatusIndicator
							status={voiceStatus}
							message={voiceStatusMessage}
							updatedAt={voiceStatusUpdatedAt}
						/>
						{heroContent}
					</div>
					<div className="space-y-2">
						<label
							htmlFor="focus-widget-search"
							className="text-[11px] font-semibold uppercase tracking-wide text-primary/60"
						>
							Quick filter
						</label>
						<div className="relative">
							<Search
								className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50"
								aria-hidden
							/>
							<Input
								id="focus-widget-search"
								type="search"
								value={optionFilter}
								onChange={(event) => setOptionFilter(event.target.value)}
								placeholder="Search sessions, prompts, or automations"
								className="w-full bg-primary/5 pl-9 text-sm text-primary placeholder:text-primary/50 focus-visible:ring-primary/40"
							/>
						</div>
					</div>
					<Accordion
						type="single"
						collapsible
						defaultValue="media-permissions"
						className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 backdrop-blur-sm"
					>
						<AccordionItem value="media-permissions" className="border-none">
							<AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
								<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<span className="flex items-center gap-2 text-sm">
										<PrimaryIcon className="h-4 w-4 text-primary" aria-hidden />
										<span>{accordionTitle}</span>
									</span>
									<div className="flex flex-wrap items-center gap-1.5">
										<MediaStatusPill
											label={primaryStatusLabel}
											status={screenStatus}
										/>
										<MediaStatusPill
											label={secondaryStatusLabel}
											status={webcamStatus}
										/>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4">
								<div className="grid gap-3 sm:grid-cols-2">
									<MediaPermissionButton
										icon={primaryIcon}
										label={primaryLabel}
										status={screenStatus}
										message={primaryMessage}
										onRequest={primaryRequest}
									/>
									<MediaPermissionButton
										icon={SecondaryIcon}
										label={secondaryLabel}
										status={webcamStatus}
										message={secondaryMessage}
										onRequest={secondaryRequest}
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					{variantHighlightSections.map((section) => (
						<Accordion
							key={section.id}
							type="single"
							collapsible
							defaultValue={section.id}
							className={cn(
								"overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm",
								section.accent === "primary" &&
									"border-primary/40 bg-primary/10 shadow-[0_8px_30px_rgba(59,130,246,0.25)]",
							)}
						>
							<AccordionItem value={section.id} className="border-none">
								<AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
									<div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
										<span className="flex items-center gap-2">
											{section.accent === "primary" ? (
												<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
													Phone Mode
												</span>
											) : null}
											<span>{section.label}</span>
										</span>
										{section.description ? (
											<span className="text-xs font-medium text-primary/70">
												{section.description}
											</span>
										) : null}
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pb-4">
									<OptionStrip
										title={section.label}
										options={section.options}
										onSelect={handleOptionSelect}
										onBookmarkToggle={handleBookmarkToggle}
										showHeading={false}
										layout="grid"
										maxItems={section.options.length}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					))}
					<div className="space-y-4">
						<Accordion
							type="multiple"
							defaultValue={
								quickSections.length > 0
									? [`quick-${slugify(quickSections[0].title)}`]
									: []
							}
							className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 backdrop-blur-sm"
						>
							{quickSections.map((section) => {
								const value = `quick-${slugify(section.title)}`;
								return (
									<AccordionItem
										value={value}
										key={value}
										className="border-none"
									>
										<AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
											<div className="flex w-full items-center justify-between gap-2">
												<span>{section.title}</span>
												<span className="text-[11px] font-medium text-primary/60">
													{section.options.length} options
												</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className="px-4 pb-4">
											<OptionStrip
												title={section.title}
												options={section.options}
												onSelect={handleOptionSelect}
												onBookmarkToggle={handleBookmarkToggle}
												showHeading={false}
												layout="scroll"
												maxItems={section.options.length}
											/>
										</AccordionContent>
									</AccordionItem>
								);
							})}
							{historyPreview.length > 0 ? (
								<AccordionItem value="quick-recent" className="border-none">
									<AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
										<div className="flex w-full items-center justify-between gap-2">
											<span>Recent</span>
											<span className="text-[11px] font-medium text-primary/60">
												{historyPreview.length} items
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-4 pb-4">
										<OptionStrip
											title="Recent"
											options={historyPreview}
											onSelect={handleOptionSelect}
											onBookmarkToggle={handleBookmarkToggle}
											showHeading={false}
											layout="scroll"
											maxItems={historyPreview.length}
										/>
									</AccordionContent>
								</AccordionItem>
							) : null}
						</Accordion>
					</div>
					{hasSearchFilter && !hasActionResults ? (
						<div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm text-primary/70">
							No matches for “{optionFilter.trim()}”. Try different keywords.
						</div>
					) : null}
					<p className="text-center text-[11px] text-primary/70">
						{footerCopy}
					</p>
				</div>
			</div>
		</div>
	);
}

interface VoiceStatusIndicatorProps {
	status: VoiceConnectionStatus;
	message: string;
	updatedAt: number | null;
}

const STATUS_VISUALS: Record<
	VoiceConnectionStatus,
	{ label: string; tone: "success" | "warning" | "danger" | "info" | "idle" }
> = {
	streaming: { label: "Live", tone: "success" },
	connecting: { label: "Connecting", tone: "warning" },
	listening: { label: "Listening", tone: "info" },
	processing: { label: "Processing", tone: "info" },
	reconnecting: { label: "Reconnecting", tone: "warning" },
	disconnected: { label: "Disconnected", tone: "danger" },
	idle: { label: "Idle", tone: "idle" },
	attention: { label: "Action Required", tone: "warning" },
};

const TONE_STYLES: Record<
	"success" | "warning" | "danger" | "info" | "idle",
	{ dot: string; wrapper: string }
> = {
	success: {
		dot: "bg-emerald-500",
		wrapper: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700",
	},
	warning: {
		dot: "bg-amber-500",
		wrapper: "border-amber-400/50 bg-amber-500/10 text-amber-700",
	},
	danger: {
		dot: "bg-red-500",
		wrapper: "border-red-400/50 bg-red-500/10 text-red-700",
	},
	info: {
		dot: "bg-sky-500",
		wrapper: "border-sky-400/50 bg-sky-500/10 text-sky-700",
	},
	idle: {
		dot: "bg-primary/60",
		wrapper: "border-primary/30 bg-primary/15 text-primary",
	},
};

function VoiceStatusIndicator({
	status,
	message,
	updatedAt,
}: VoiceStatusIndicatorProps): React.ReactElement {
	const visuals = STATUS_VISUALS[status] ?? STATUS_VISUALS.streaming;
	const tone = TONE_STYLES[visuals.tone];
	const relativeUpdated =
		updatedAt != null ? formatRelativeTime(new Date(updatedAt)) : null;

	return (
		<div className="flex flex-col items-center gap-1 text-center">
			<div
				className={cn(
					"flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest shadow-sm backdrop-blur",
					tone.wrapper,
				)}
			>
				<span
					className={cn(
						"h-2.5 w-2.5 rounded-full",
						tone.dot,
						status === "streaming" && "animate-ping",
					)}
					aria-hidden
				/>
				<span>{visuals.label}</span>
				{relativeUpdated ? (
					<span className="text-[10px] font-medium opacity-70">
						{relativeUpdated}
					</span>
				) : null}
			</div>
			<span className="max-w-[260px] truncate text-[11px] text-muted-foreground">
				{message}
			</span>
		</div>
	);
}

export function VoiceModePanel(props: VoiceModePanelProps): React.ReactElement {
	return (
		<FocusModePanel
			variant="voice"
			isAnimating={props.isAnimating}
			onToggleAnimation={props.onToggleAnimation}
			voiceLottieRef={props.voiceLottieRef}
			onAgentSelect={props.onAgentSelect}
			onClipboardPaste={props.onClipboardPaste}
			onMediaEvent={props.onMediaEvent}
			onRequestBrowserAccess={props.onRequestBrowserAccess}
		/>
	);
}

export function VideoModePanel(props: VideoModePanelProps): React.ReactElement {
	return (
		<FocusModePanel
			variant="video"
			onAgentSelect={props.onAgentSelect}
			onClipboardPaste={props.onClipboardPaste}
			onMediaEvent={props.onMediaEvent}
			onRequestBrowserAccess={props.onRequestBrowserAccess}
			videoAvatar={props.videoAvatar}
		/>
	);
}

export function PhoneModePanel(props: PhoneModePanelProps): React.ReactElement {
	return (
		<FocusModePanel
			variant="phone"
			onAgentSelect={props.onAgentSelect}
			onClipboardPaste={props.onClipboardPaste}
			onMediaEvent={props.onMediaEvent}
			onRequestBrowserAccess={props.onRequestBrowserAccess}
		/>
	);
}

type MediaPermissionButtonProps = {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	status: MediaStatus;
	message: { message: string; description: string };
	onRequest: () => void;
};

function MediaPermissionButton({
	icon: Icon,
	label,
	status,
	message,
	onRequest,
}: MediaPermissionButtonProps) {
	const isPending = status === "pending";
	const isActive = status === "active";
	const isError = status === "error";
	const buttonClasses = cn(
		"flex h-11 w-full items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary/40",
		isActive
			? "border-primary/50 bg-primary/10 text-primary"
			: "border-primary/20 bg-primary/5 text-primary/80 hover:border-primary/40 hover:bg-primary/10",
		isError && "border-destructive/40 bg-destructive/10 text-destructive",
	);

	return (
		<div className="flex flex-col gap-1.5 rounded-xl bg-background/40 p-3">
			<button
				type="button"
				onClick={onRequest}
				className={buttonClasses}
				disabled={isPending}
				aria-pressed={isActive}
			>
				<Icon className="h-5 w-5" aria-hidden />
				<span className="sr-only">{label}</span>
			</button>
			<div className="flex flex-col text-xs text-primary/70">
				<strong aria-live="polite" className="font-semibold text-primary">
					{message.message}
				</strong>
				<span className="leading-tight text-primary/60">
					{message.description}
				</span>
				{isError ? (
					<button
						type="button"
						className="mt-1 self-start rounded-full border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary/80 transition hover:border-primary/40 hover:text-primary"
						onClick={onRequest}
					>
						Try again
					</button>
				) : null}
			</div>
		</div>
	);
}

function MediaStatusPill({
	label,
	status,
}: {
	label: string;
	status: MediaStatus;
}) {
	const variant = (() => {
		switch (status) {
			case "active":
				return "border-emerald-400/40 bg-emerald-400/10 text-emerald-500";
			case "pending":
				return "border-amber-400/40 bg-amber-400/10 text-amber-500";
			case "error":
				return "border-destructive/40 bg-destructive/10 text-destructive";
			default:
				return "border-primary/20 bg-background/60 text-primary/70";
		}
	})();

	const statusLabel = (() => {
		switch (status) {
			case "active":
				return "Active";
			case "pending":
				return "Requesting";
			case "error":
				return "Needs access";
			default:
				return "Idle";
		}
	})();

	return (
		<span
			className={cn(
				"flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
				variant,
			)}
		>
			<span className="inline-flex h-1.5 w-1.5 rounded-full bg-current" />
			<span className="capitalize">
				{label}: {statusLabel}
			</span>
		</span>
	);
}

type OptionStripProps = {
	title: string;
	options: readonly VoicePaletteOption[];
	onSelect: (option: VoicePaletteOption) => void;
	onBookmarkToggle?: (option: VoicePaletteOption) => void;
	showHeading?: boolean;
	layout?: "scroll" | "grid";
	maxItems?: number;
};

function OptionStrip({
	title,
	options,
	onSelect,
	onBookmarkToggle,
	showHeading = true,
	layout = "scroll",
	maxItems,
}: OptionStripProps) {
	const limit = maxItems ?? (layout === "grid" ? options.length : 4);
	const limited = options.slice(0, Math.max(limit, 0));
	return (
		<section className="flex w-full flex-col gap-1">
			{showHeading ? (
				<h3 className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
					{title}
				</h3>
			) : null}
			<div
				className={cn(
					"gap-2 pb-1",
					layout === "scroll"
						? "flex flex-nowrap overflow-x-auto [touch-action:pan-x] [overscroll-behavior-inline:contain] [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:[touch-action:auto] sm:[overscroll-behavior-inline:auto]"
						: "grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]",
				)}
			>
				{limited.map((option) => {
					const Icon = resolveVoiceIcon(option.icon);
					const isSession = option.types.includes("session");
					const sessionThreadId = isSession
						? extractSessionThreadId(option.id)
						: null;
					const isSessionThread = Boolean(sessionThreadId);
					const isBookmarked = isSessionThread && Boolean(option.bookmarked);
					return (
						<div
							key={option.id}
							className={cn(
								"flex items-stretch gap-1",
								layout === "scroll"
									? "min-w-[160px] flex-none sm:flex-1 sm:min-w-[200px]"
									: "w-full",
							)}
						>
							<button
								type="button"
								onClick={() => onSelect(option)}
								className="flex flex-1 flex-col gap-1 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<span className="flex items-center justify-between gap-2">
									<span className="flex items-center gap-1 text-primary">
										{Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
										<span className="text-[12px] font-semibold">
											{option.name}
										</span>
									</span>
									{option.badge ? (
										<span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
											{option.badge}
										</span>
									) : null}
								</span>
								{option.description ? (
									<span className="text-[10px] text-primary/70">
										{option.description}
									</span>
								) : null}
							</button>
							{isSessionThread ? (
								<div className="flex flex-col gap-1">
									<button
										type="button"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											onSelect(option);
										}}
										className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
										aria-label={`Open ${option.name}`}
									>
										<ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
									</button>
									<button
										type="button"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											onBookmarkToggle?.(option);
										}}
										className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
										aria-label={
											isBookmarked
												? `Remove bookmark for ${option.name}`
												: `Bookmark ${option.name}`
										}
									>
										{isBookmarked ? (
											<BookmarkCheck className="h-3.5 w-3.5" aria-hidden />
										) : (
											<Bookmark className="h-3.5 w-3.5" aria-hidden />
										)}
									</button>
								</div>
							) : null}
						</div>
					);
				})}
			</div>
		</section>
	);
}
