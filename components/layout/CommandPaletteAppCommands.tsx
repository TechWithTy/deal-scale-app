"use client";

import React, { useEffect, useMemo } from "react";

import {
	BookTemplate,
	HelpCircle,
	LifeBuoy,
	Radio,
	Sparkles,
	Target,
	Bot,
	List,
	ClipboardList,
	FolderOpen,
	Megaphone,
	LineChart,
	Briefcase,
	Home,
	Banknote,
} from "lucide-react";
import { toast } from "sonner";

import type { ChipDefinition } from "@/components/reusables/ai/InlineChipEditor";
import { getChipsForContext } from "@/lib/config/ai/chipDefinitions";
import {
	quickStartGoals,
	quickStartPersonas,
	type QuickStartPersonaId,
	type QuickStartGoalDefinition,
} from "@/lib/config/quickstart/wizardFlows";
import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import { useLeadListStore } from "@/lib/stores/leadList";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import {
	useUserPromptsStore,
	type PromptCategory,
} from "@/lib/stores/user/prompts";
import { useAISettingsStore } from "@/lib/stores/user/ai/ai";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import {
	openFocusWidget,
	openHelpModal,
	showHelpIcon,
} from "@/lib/ui/helpActions";
import type { CommandChip, CommandItem } from "external/action-bar/utils/types";
import { useCommandPalette } from "external/action-bar/components/providers/CommandPaletteProvider";
import { useRouter } from "next/navigation";

const ICON_CLASS = "h-4 w-4";

const CATEGORY_LABELS: Record<PromptCategory, string> = {
	audience_search: "Audience Search",
	campaign: "Campaign Creation",
	outreach: "Outreach",
	enrichment: "Enrichment",
	analytics: "Analytics",
	workflow: "Workflows",
	custom: "Custom Templates",
};

const CATEGORY_TO_CONTEXT: Record<
	PromptCategory,
	"campaign" | "workflow" | "search"
> = {
	audience_search: "search",
	campaign: "campaign",
	outreach: "campaign",
	enrichment: "workflow",
	analytics: "campaign",
	workflow: "workflow",
	custom: "campaign",
};

const PROVIDER_METADATA: Record<
	"openai" | "claude" | "gemini" | "dealscale",
	{ label: string; url: string }
> = {
	openai: {
		label: "ChatGPT",
		url: "https://chat.openai.com/",
	},
	claude: {
		label: "Claude",
		url: "https://claude.ai/new",
	},
	gemini: {
		label: "Gemini",
		url: "https://gemini.google.com/app",
	},
	dealscale: {
		label: "Deal Scale Copilot",
		url: "https://dealscale.ai/copilot",
	},
};

type CampaignChannelKey = "call" | "text" | "email" | "social";

const CAMPAIGN_TYPE_LABELS: Record<CampaignChannelKey, string> = {
	call: "Call",
	text: "Text",
	email: "Email",
	social: "Social",
};

const formatStatus = (status?: string) => {
	if (!status) return "Active";
	return status
		.replace(/_/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

const personaIconMap: Record<QuickStartPersonaId, JSX.Element> = {
	investor: <LineChart className={ICON_CLASS} aria-hidden />,
	wholesaler: <Briefcase className={ICON_CLASS} aria-hidden />,
	loan_officer: <Banknote className={ICON_CLASS} aria-hidden />,
	agent: <Home className={ICON_CLASS} aria-hidden />,
};

export default function CommandPaletteAppCommands(): null {
	const { registerDynamicCommands } = useCommandPalette();
	const router = useRouter();
	const templates = useUserPromptsStore((state) => state.templates);
	const preferredProvider = useAISettingsStore(
		(state) => state.preferredProvider ?? "dealscale",
	);
	const providerMeta =
		PROVIDER_METADATA[preferredProvider] ?? PROVIDER_METADATA.dealscale;
	const storeLeadLists = useLeadListStore((state) => state.leadLists);
	const profileCampaigns = useUserProfileStore(
		(state) => state.userProfile?.companyInfo?.campaigns,
	);

	const leadListItems = useMemo(() => {
		const base =
			(storeLeadLists?.length ?? 0) > 0
				? storeLeadLists
				: (MockUserProfile?.companyInfo?.leadLists ?? []);
		const map = new Map<
			string,
			{
				id: string;
				name: string;
				records: number;
				emails: number;
				phones: number;
			}
		>();
		for (const list of base ?? []) {
			if (!list?.id) continue;
			if (map.has(list.id)) continue;
			map.set(list.id, {
				id: list.id,
				name: list.listName ?? "Lead List",
				records:
					typeof list.records === "number"
						? list.records
						: Array.isArray(list.leads)
							? list.leads.length
							: 0,
				emails: list.emails ?? 0,
				phones: list.phone ?? 0,
			});
		}
		return Array.from(map.values());
	}, [storeLeadLists]);

	const campaignItems = useMemo(() => {
		const source = profileCampaigns ?? MockUserProfile?.companyInfo?.campaigns;
		if (!source)
			return [] as Array<{
				id: string;
				name: string;
				status?: string;
				type: CampaignChannelKey;
			}>;
		const bucket: Array<{
			id: string;
			name: string;
			status?: string;
			type: CampaignChannelKey;
		}> = [];
		const pushCampaigns = <
			T extends { id?: string; name?: string; status?: string },
		>(
			items: T[] | undefined,
			type: CampaignChannelKey,
		) => {
			if (!items) return;
			for (const item of items) {
				if (!item?.id) continue;
				bucket.push({
					id: item.id,
					name: item.name ?? "Campaign",
					status: item.status,
					type,
				});
			}
		};
		pushCampaigns(
			source.callCampaigns as
				| Array<{ id: string; name: string; status?: string }>
				| undefined,
			"call",
		);
		pushCampaigns(
			source.textCampaigns as
				| Array<{ id: string; name: string; status?: string }>
				| undefined,
			"text",
		);
		pushCampaigns(
			source.emailCampaigns as
				| Array<{ id: string; name: string; status?: string }>
				| undefined,
			"email",
		);
		pushCampaigns(
			source.socialCampaigns as
				| Array<{ id: string; name: string; status?: string }>
				| undefined,
			"social",
		);
		const map = new Map<string, (typeof bucket)[number]>();
		for (const item of bucket) {
			if (!map.has(item.id)) map.set(item.id, item);
		}
		return Array.from(map.values());
	}, [profileCampaigns]);

	const campaignsByType = useMemo(() => {
		return campaignItems.reduce<
			Record<CampaignChannelKey, typeof campaignItems>
		>(
			(acc, campaign) => {
				acc[campaign.type] = acc[campaign.type] ?? [];
				acc[campaign.type].push(campaign);
				return acc;
			},
			{ call: [], text: [], email: [], social: [] },
		);
	}, [campaignItems]);

	const chipCatalog = useMemo(() => {
		const contexts: Array<"campaign" | "workflow" | "search"> = [
			"campaign",
			"workflow",
			"search",
		];
		return contexts.reduce<
			Record<"campaign" | "workflow" | "search", Map<string, ChipDefinition>>
		>(
			(acc, context) => {
				const collections = getChipsForContext(context);
				const combined = [
					...collections.variables,
					...collections.tools,
					...collections.agents,
					...collections.scripts,
					...collections.resources,
					...collections.automations,
				];
				acc[context] = new Map(combined.map((chip) => [chip.key, chip]));
				return acc;
			},
			{
				campaign: new Map<string, ChipDefinition>(),
				workflow: new Map<string, ChipDefinition>(),
				search: new Map<string, ChipDefinition>(),
			},
		);
	}, []);

	useEffect(() => {
		const commands: CommandItem[] = [
			{
				id: "assist-help-icon",
				group: "Assist",
				label: "Show Help Icon",
				icon: <HelpCircle className={ICON_CLASS} aria-hidden />,
				action: () => {
					showHelpIcon();
				},
			},
			{
				id: "assist-help-modal",
				group: "Assist",
				label: "Open Help Modal",
				icon: <LifeBuoy className={ICON_CLASS} aria-hidden />,
				action: () => {
					openHelpModal();
				},
			},
			{
				id: "assist-focus-player",
				group: "Assist",
				label: "Open Focus Player",
				icon: <Radio className={ICON_CLASS} aria-hidden />,
				action: () => {
					openFocusWidget();
				},
			},
		];

		const templatesByCategory = templates.reduce(
			(acc, template) => {
				const category = template.category;
				if (!acc[category]) acc[category] = [];
				acc[category].push(template);
				return acc;
			},
			{} as Record<PromptCategory, typeof templates>,
		);

		for (const [category, categoryTemplates] of Object.entries(
			templatesByCategory,
		) as Array<[PromptCategory, typeof templates]>) {
			if (!categoryTemplates.length) continue;
			const context = CATEGORY_TO_CONTEXT[category];
			const chipMap = chipCatalog[context];
			const children: CommandItem[] = [
				{
					id: `ai-template-provider-${category}`,
					group: "AI Templates",
					label: `Open in ${providerMeta.label}`,
					hint: `${providerMeta.url} • Opens new tab`,
					icon: <Bot className={ICON_CLASS} aria-hidden />,
					chips: [
						{
							key: `provider-${preferredProvider}`,
							label: providerMeta.label,
							type: "provider",
						},
						{
							key: "action-new-tab",
							label: "NEW TAB",
							type: "action",
						},
					],
					action: () => {
						if (typeof window === "undefined") return;
						window.open(providerMeta.url, "_blank", "noopener,noreferrer");
					},
				},
			];
			const categoryChildren = categoryTemplates.map((template) => {
				const chips = template.variables.reduce<CommandChip[]>((acc, key) => {
					const chipDef = chipMap.get(key);
					if (!chipDef) return acc;
					acc.push({
						key: chipDef.key,
						label: chipDef.label,
						type: chipDef.type,
					});
					return acc;
				}, []);

				return {
					id: `ai-template-${template.id}`,
					group: "AI Templates",
					label: template.name,
					hint: template.description,
					icon: <Sparkles className={ICON_CLASS} aria-hidden />,
					chips,
					action: async () => {
						try {
							if (
								typeof navigator !== "undefined" &&
								navigator.clipboard?.writeText
							) {
								await navigator.clipboard.writeText(template.content);
								toast.success("Prompt copied", {
									description: template.name,
								});
							} else {
								throw new Error("Clipboard unavailable");
							}
						} catch (error) {
							toast.error("Unable to copy prompt", {
								description: template.name,
							});
						}
					},
				};
			});

			commands.push({
				id: `ai-templates-${category}`,
				group: "AI Templates",
				label: `${CATEGORY_LABELS[category]} Templates`,
				icon: <BookTemplate className={ICON_CLASS} aria-hidden />,
				action: () => {},
				chips: [
					{
						key: `provider-${preferredProvider}`,
						label: providerMeta.label,
						type: "provider",
					},
				],
				children: [...children, ...categoryChildren],
			});
		}

		const leadListChildren: CommandItem[] = [
			{
				id: "lead-lists-all",
				group: "Lead Lists",
				label: "View All Lead Lists",
				hint: "Navigates to lead lists",
				icon: <ClipboardList className={ICON_CLASS} aria-hidden />,
				chips: [{ key: "action-navigate", label: "NAVIGATE", type: "action" }],
				action: () => {
					router.push("/dashboard/lead-list");
				},
			},
		];
		for (const list of leadListItems.slice(0, 6)) {
			leadListChildren.push({
				id: `lead-list-${list.id}`,
				group: "Lead Lists",
				label: list.name,
				hint: `${list.records} records • Navigates`,
				icon: <FolderOpen className={ICON_CLASS} aria-hidden />,
				chips: [
					{
						key: `records-${list.id}`,
						label: `${list.records} records`,
						type: "metric",
					},
					{ key: `action-${list.id}`, label: "NAVIGATE", type: "action" },
				],
				action: () => {
					router.push(
						`/dashboard/lead-list?listId=${encodeURIComponent(list.id)}`,
					);
				},
			});
		}
		commands.push({
			id: "lead-lists-root",
			group: "Lead Lists",
			label: "Lead Lists",
			icon: <List className={ICON_CLASS} aria-hidden />,
			action: () => {},
			children: leadListChildren,
		});

		const campaignTypeChildren: CommandItem[] = [];
		const hasRealCampaignData = Boolean(profileCampaigns);
		for (const type of ["call", "text", "email", "social"] as const) {
			const items = campaignsByType[type];
			if (!items.length) continue;
			const typeChildren = items.map((campaign) => {
				const typeLabel = CAMPAIGN_TYPE_LABELS[campaign.type];
				const statusLabel = formatStatus(campaign.status);
				return {
					id: `campaign-${campaign.type}-${campaign.id}`,
					group: "Campaigns",
					label: campaign.name,
					hint: `${typeLabel} • ${statusLabel}`,
					icon: <Megaphone className={ICON_CLASS} aria-hidden />,
					chips: [
						{
							key: `campaign-type-${campaign.id}`,
							label: typeLabel.toUpperCase(),
							type: "type",
						},
						{
							key: `campaign-status-${campaign.id}`,
							label: statusLabel.toUpperCase(),
							type: "status",
						},
						{
							key: `campaign-action-${campaign.id}`,
							label: "NAVIGATE",
							type: "action",
						},
					],
					action: () => {
						if (!hasRealCampaignData) {
							router.push(`/dashboard/campaigns?type=${campaign.type}`);
							return;
						}
						router.push(
							`/dashboard/campaigns?type=${campaign.type}&campaignId=${campaign.id}`,
						);
					},
				};
			});
			campaignTypeChildren.push({
				id: `campaigns-${type}`,
				group: "Campaigns",
				label: `${CAMPAIGN_TYPE_LABELS[type]} Campaigns`,
				hint: `${items.length} campaign${items.length === 1 ? "" : "s"}`,
				icon: <FolderOpen className={ICON_CLASS} aria-hidden />,
				chips: [
					{
						key: `campaign-count-${type}`,
						label: `${items.length} items`,
						type: "metric",
					},
				],
				action: () => {},
				children: typeChildren,
			});
		}

		if (campaignTypeChildren.length) {
			commands.push({
				id: "campaigns-root",
				group: "Campaigns",
				label: "Campaigns",
				icon: <Megaphone className={ICON_CLASS} aria-hidden />,
				action: () => {},
				children: campaignTypeChildren,
			});
		}

		const goalsByPersona = quickStartGoals.reduce<
			Record<QuickStartPersonaId, QuickStartGoalDefinition[]>
		>(
			(acc, goal) => {
				const existing = acc[goal.personaId];
				if (existing) {
					existing.push(goal);
				} else {
					acc[goal.personaId] = [goal];
				}
				return acc;
			},
			{ investor: [], wholesaler: [], loan_officer: [], agent: [] },
		);

		const goalPersonaChildren: CommandItem[] = [];
		for (const persona of quickStartPersonas) {
			const personaGoals = goalsByPersona[persona.id];
			if (!personaGoals.length) continue;
			const goalChildren = personaGoals.map((goal) => {
				const automationChip = goal.isOneClickAutomatable
					? {
							key: `goal-automation-${goal.id}`,
							label: "ONE CLICK",
							type: "status" as const,
						}
					: {
							key: `goal-automation-${goal.id}`,
							label: "GUIDED",
							type: "status" as const,
						};
				return {
					id: `goal-${goal.id}`,
					group: "Goals",
					label: goal.title,
					hint: goal.description,
					icon: <Target className={ICON_CLASS} aria-hidden />,
					chips: [
						automationChip,
						{
							key: `goal-persona-${goal.id}`,
							label: persona.title.toUpperCase(),
							type: "type",
						},
					],
					action: () => {
						useQuickStartWizardDataStore.getState().selectGoal(goal.id);
						useQuickStartWizardStore.getState().open({
							goalId: goal.id,
							personaId: goal.personaId,
							templateId: goal.templateId,
						});
					},
				};
			});

			goalPersonaChildren.push({
				id: `goals-${persona.id}`,
				group: "Goals",
				label: persona.title,
				hint: `${personaGoals.length} play${
					personaGoals.length === 1 ? "" : "s"
				} • ${persona.headline}`,
				icon: personaIconMap[persona.id],
				chips: [
					{
						key: `goals-count-${persona.id}`,
						label: `${personaGoals.length} goals`,
						type: "metric",
					},
				],
				action: () => {},
				children: goalChildren,
			});
		}

		if (goalPersonaChildren.length) {
			commands.push({
				id: "goals-root",
				group: "Goals",
				label: "Quick Start Goals",
				icon: <Target className={ICON_CLASS} aria-hidden />,
				action: () => {},
				children: goalPersonaChildren,
			});
		}

		registerDynamicCommands(commands);
		return () => {
			registerDynamicCommands([]);
		};
	}, [
		campaignsByType,
		chipCatalog,
		leadListItems,
		preferredProvider,
		providerMeta.label,
		providerMeta.url,
		registerDynamicCommands,
		router,
		templates,
		profileCampaigns,
	]);

	return null;
}
