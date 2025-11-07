/**
 * AI Campaign Generator
 * Creates optimized campaign configurations using AI
 */

"use client";

import type { SavedCampaignTemplate } from "@/types/userProfile";
import { Megaphone } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AIPromptGenerator } from "@/components/reusables/ai/AIPromptGenerator";
import { MonetizationToggle } from "@/components/reusables/ai/shared/MonetizationToggle";
import { getChipsForContext } from "@/lib/config/ai/chipDefinitions";
import { getSalesScriptsChips } from "@/lib/config/ai/chipUtils";
import { useSavedCampaignTemplatesStore } from "@/lib/stores/user/campaigns/savedTemplates";
import { useUserCampaignsStore } from "@/lib/stores/user/campaigns/campaigns";
import {
	parseCampaignFromAIPrompt,
	extractMessagingFromPrompt,
	extractScheduleFromPrompt,
} from "@/lib/utils/campaign/templateParser";

interface AICampaignGeneratorProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCampaignGenerated: (template: SavedCampaignTemplate) => void;
	existingTemplate?: SavedCampaignTemplate;
}

export function AICampaignGenerator({
	isOpen,
	onOpenChange,
	onCampaignGenerated,
	existingTemplate,
}: AICampaignGeneratorProps) {
	const [title, setTitle] = useState(existingTemplate?.name || "");
	const [prompt, setPrompt] = useState(
		existingTemplate?.campaignConfig?.aiPrompt || "",
	);
	const [referenceCampaignId, setReferenceCampaignId] = useState<
		string | undefined
	>(undefined);
	const [aiLearningEnabled, setAILearningEnabled] = useState(false);

	// Monetization state
	const [monetizationEnabled, setMonetizationEnabled] = useState(false);
	const [priceMultiplier, setPriceMultiplier] = useState<number>(1);
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	const userCampaigns = useUserCampaignsStore((state) => state.items);
	const createTemplate = useSavedCampaignTemplatesStore(
		(state) => state.createTemplate,
	);

	// Get centralized chip definitions for campaign context
	const chipContext = useMemo(() => getChipsForContext("campaign"), []);
	const salesScriptsChips = useMemo(() => getSalesScriptsChips(), []);

	const handleGenerate = async () => {
		console.log("[AICampaignGenerator] handleGenerate called", {
			title,
			promptLength: prompt.length,
		});

		if (!title.trim() || !prompt.trim()) {
			toast.error("Missing required fields", {
				description: "Please provide both a title and prompt",
			});
			return;
		}

		try {
			console.log("[AICampaignGenerator] Parsing campaign config...");
			// Parse AI prompt to extract campaign config
			const parsedConfig = parseCampaignFromAIPrompt(prompt);
			const messaging = extractMessagingFromPrompt(prompt);
			const schedule = extractScheduleFromPrompt(prompt);

			console.log("[AICampaignGenerator] Parsed config:", {
				channels: parsedConfig.channels,
				hasMessaging: !!messaging,
				hasSchedule: !!schedule,
			});

			// Validate monetization settings
			if (monetizationEnabled && !acceptedTerms) {
				toast.error("Please accept the Terms & Conditions", {
					description: "Required to make templates public and monetized",
				});
				return;
			}

			// Create campaign template
			const campaignConfig: SavedCampaignTemplate["campaignConfig"] = {
				channels: parsedConfig.channels || ["call", "sms", "email"],
				audience: parsedConfig.audience || {},
				messaging: messaging,
				schedule: schedule,
				budget: parsedConfig.budget,
				aiPrompt: prompt,
				generatedByAI: true,
				aiSuggested: false,
			};

			console.log("[AICampaignGenerator] Creating template...");

			// Save to store
			const templateId = createTemplate({
				name: title,
				description: `AI-generated campaign from prompt`,
				campaignConfig,
				priority: false,
				monetization: monetizationEnabled
					? {
							enabled: true,
							priceMultiplier: priceMultiplier,
							isPublic: true,
							acceptedTerms: acceptedTerms,
						}
					: undefined,
			});

			console.log(
				"[AICampaignGenerator] Template created with ID:",
				templateId,
			);

			// Create template object directly instead of retrieving from store
			const createdTemplate: SavedCampaignTemplate = {
				id: templateId,
				name: title,
				description: `AI-generated campaign from prompt`,
				campaignConfig,
				createdAt: new Date(),
				updatedAt: new Date(),
				priority: false,
				monetization: monetizationEnabled
					? {
							enabled: true,
							priceMultiplier: priceMultiplier,
							isPublic: true,
							acceptedTerms: acceptedTerms,
						}
					: undefined,
			};

			console.log("[AICampaignGenerator] Calling onCampaignGenerated");

			// Store in localStorage for audit
			try {
				const history = JSON.parse(
					localStorage.getItem("ai_campaign_generations") || "[]",
				);
				history.unshift({
					id: templateId,
					title,
					prompt,
					timestamp: new Date().toISOString(),
					channels: campaignConfig.channels,
				});
				// Keep last 50
				localStorage.setItem(
					"ai_campaign_generations",
					JSON.stringify(history.slice(0, 50)),
				);
			} catch (e) {
				console.warn("Failed to save to localStorage:", e);
			}

			onCampaignGenerated(createdTemplate);

			toast.success("Campaign Template Generated!", {
				description: `Created ${title} with AI assistance`,
				duration: 3000,
			});

			onOpenChange(false);
		} catch (error) {
			console.error(
				"[AICampaignGenerator] Failed to generate campaign:",
				error,
			);
			toast.error("Generation Failed", {
				description: "Could not create campaign template. Please try again.",
			});
		}
	};

	return (
		<AIPromptGenerator
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title="AI Campaign Generator"
			description="Create optimized multi-channel campaigns with AI assistance"
			icon={<Megaphone className="h-5 w-5" />}
			promptValue={prompt}
			onPromptChange={setPrompt}
			titleValue={title}
			onTitleChange={setTitle}
			promptLabel="Campaign Prompt"
			titleLabel="Campaign Name"
			customSections={[
				<MonetizationToggle
					key="monetization"
					enabled={monetizationEnabled}
					onEnabledChange={setMonetizationEnabled}
					priceMultiplier={priceMultiplier}
					onPriceMultiplierChange={setPriceMultiplier}
					acceptedTerms={acceptedTerms}
					onAcceptedTermsChange={setAcceptedTerms}
					itemType="template"
				/>,
			]}
			promptPlaceholder={`<poml>
  <context>
    <role>You are a DealScale Campaign Architect.</role>
    <goal>Design a multi-channel outreach campaign targeting {{leadList}} in {{location}}.</goal>
  </context>
  
  <variables>
    {{campaignName}}
    {{leadList}}
    {{location}}
    {{budget}}
  </variables>
  
  <agents>
    {{CallQualifier}} — Voice outreach
    {{TextNurturer}} — SMS follow-up
  </agents>
  
  <workflow>
    <phase id="1" label="Initial Contact">
      <call agent="CallQualifier" function="callOutreach" with="leadList={{leadList}}" />
    </phase>
    <phase id="2" label="Follow-Up">
      <call agent="TextNurturer" function="textOutreach" />
    </phase>
  </workflow>
</poml>`}
			titlePlaceholder="e.g., Q1 Investor Outreach"
			variables={chipContext.variables}
			tools={chipContext.tools}
			agents={chipContext.agents}
			scripts={salesScriptsChips}
			resources={chipContext.resources}
			automations={chipContext.automations}
			showQuickActions={true}
			prioritizeCategory="campaign"
			filterCategories={["campaign", "audience_search", "outreach", "workflow"]}
			onGenerate={async (data) => {
				// Map the data to the expected format
				await handleGenerate();
			}}
			generateButtonText="Generate Campaign"
			minPromptLength={10}
			minTitleLength={3}
			maxHeight="85vh"
			showAILearning={true}
			aiLearningEnabled={aiLearningEnabled}
			onAILearningChange={setAILearningEnabled}
		/>
	);
}
