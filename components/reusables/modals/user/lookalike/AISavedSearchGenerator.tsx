/**
 * AI Saved Search Generator
 * Creates optimized lookalike audience configurations using AI
 */

"use client";

import type { LookalikeConfig } from "@/types/lookalike";
import type { SavedSearch } from "@/types/userProfile";
import { Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
	AIPromptGenerator,
	type AIPromptField,
} from "@/components/reusables/ai/AIPromptGenerator";
import { MonetizationToggle } from "@/components/reusables/ai/shared/MonetizationToggle";
import { getChipsForContext } from "@/lib/config/ai/chipDefinitions";
import { getSalesScriptsChips } from "@/lib/config/ai/chipUtils";
import { useUserPromptsStore } from "@/lib/stores/user/prompts";
import { useSavedSearchesStore } from "@/lib/stores/user/leads/savedSearches";

interface AISavedSearchGeneratorProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSearchGenerated: (search: SavedSearch) => void;
	existingSearch?: SavedSearch;
	availableSeedLists?: Array<{ id: string; name: string; leadCount: number }>;
}

export function AISavedSearchGenerator({
	isOpen,
	onOpenChange,
	onSearchGenerated,
	existingSearch,
	availableSeedLists = [],
}: AISavedSearchGeneratorProps) {
	const [title, setTitle] = useState(existingSearch?.name || "");
	const [description, setDescription] = useState(
		existingSearch?.description || "",
	);
	const [referenceSeedList, setReferenceSeedList] = useState("");
	const [aiLearningEnabled, setAiLearningEnabled] = useState(true);

	// Monetization state
	const [monetizationEnabled, setMonetizationEnabled] = useState(false);
	const [priceMultiplier, setPriceMultiplier] = useState<number>(1);
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	// Get centralized chip definitions for search context
	const chipContext = useMemo(() => getChipsForContext("search"), []);
	const salesScriptsChips = useMemo(() => getSalesScriptsChips(), []);

	// Get user prompt templates
	const promptTemplates = useUserPromptsStore((state) => state.templates);

	// Saved searches store
	const { createSavedSearch } = useSavedSearchesStore();

	// No quick actions needed for search generator currently

	// Convert seed lists to dropdown format
	const seedListOptions = useMemo(
		() => [
			{ value: "", label: "None - Start Fresh" },
			...availableSeedLists.map((list) => ({
				value: list.id,
				label: `${list.name} (${list.leadCount} leads)`,
			})),
		],
		[availableSeedLists],
	);

	const customFields: AIPromptField[] = [
		{
			id: "referenceSeedList",
			label: "Reference Seed List (Optional)",
			type: "select",
			options: seedListOptions,
			defaultValue: "",
			helpText:
				"Optionally select a past lead list to learn from and build upon",
		},
	];

	const handleGenerate = async (data: {
		title?: string;
		prompt: string;
		customFields?: Record<string, any>;
	}) => {
		if (!data.title || !data.prompt) {
			toast.error("Missing required fields", {
				description: "Please provide both a title and prompt",
			});
			return;
		}

		// Validate monetization settings
		if (monetizationEnabled && !acceptedTerms) {
			toast.error("Please accept the Terms & Conditions", {
				description: "Required to make searches public and monetized",
			});
			return;
		}

		try {
			const refListId = data.customFields?.referenceSeedList;
			const refList = refListId
				? availableSeedLists.find((l) => l.id === refListId)
				: null;

			// TODO: Replace with actual AI API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Generate AI-optimized config
			const aiConfig: LookalikeConfig = {
				seedListId: refList?.id || `seed_ai_${Date.now()}`,
				seedListName: refList?.name || "AI Generated Seed",
				seedLeadCount: refList?.leadCount || 100,
				similarityThreshold: extractSimilarityFromDescription(data.prompt),
				targetSize: extractTargetSizeFromDescription(data.prompt),
				salesTargeting: {
					buyerPersona: extractPersonasFromDescription(data.prompt) as never,
					motivationLevel: extractMotivationFromDescription(
						data.prompt,
					) as never,
				},
				propertyFilters: {
					propertyTypes: extractPropertyTypesFromDescription(
						data.prompt,
					) as never,
				},
				geoFilters: {
					states: extractStatesFromDescription(data.prompt),
				},
				generalOptions: {
					dncCompliance: true,
					tcpaOptInRequired: true,
					requirePhone: true,
					requireEmail: true,
					enrichmentLevel: "premium",
					skipDuplicates: true,
					skipAlreadyTraced: true,
					socialEnrichment: true,
				},
			};

			// Save to Zustand store
			const searchId = createSavedSearch({
				name: data.title || "AI Generated Search",
				searchCriteria: {
					aiPrompt: data.prompt,
					referenceSeedList: refListId,
					aiLearningEnabled,
					generatedByAI: true,
					generatedAt: new Date().toISOString(),
					lookalikeConfig: aiConfig,
				},
				priority: false,
			});

			// Store metadata in localStorage
			try {
				const existingHistory = JSON.parse(
					localStorage.getItem("ai_generation_history") || "[]",
				);
				existingHistory.unshift({
					searchId: searchId,
					prompt: data.prompt,
					referenceSeedList: refListId,
					aiLearningEnabled,
					generatedAt: new Date().toISOString(),
				});
				localStorage.setItem(
					"ai_generation_history",
					JSON.stringify(existingHistory.slice(0, 50)),
				);
			} catch (e) {
				console.warn("Failed to save AI generation metadata:", e);
			}

			toast.success("AI search configuration generated!", {
				description: `Saved to your searches as "${data.title}"`,
			});

			const savedSearch: SavedSearch = {
				id: searchId,
				name: data.title || "AI Generated Search",
				description: data.prompt,
				searchCriteria: {
					aiPrompt: data.prompt,
					referenceSeedList: refListId,
					generatedByAI: true,
					generatedAt: new Date().toISOString(),
					lookalikeConfig: aiConfig,
				},
				createdAt: new Date(),
				updatedAt: new Date(),
				priority: false,
			};

			onSearchGenerated(savedSearch);
			onOpenChange(false);
		} catch (error) {
			console.error("AI generation error:", error);
			toast.error("Failed to generate search configuration");
			throw error;
		}
	};

	return (
		<AIPromptGenerator
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title="AI Search Generator"
			description="Describe your ideal audience and let AI create an optimized search configuration"
			icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
			variables={chipContext.variables}
			tools={chipContext.tools}
			agents={chipContext.agents}
			scripts={salesScriptsChips}
			resources={chipContext.resources}
			automations={chipContext.automations}
			showQuickActions={false}
			prioritizeCategory="search"
			showAILearning={true}
			aiLearningEnabled={aiLearningEnabled}
			onAILearningChange={setAiLearningEnabled}
			promptLabel="AI Prompt"
			promptPlaceholder={`<poml>
  <role>Expert real estate lead analyst</role>
  <task>Analyze {{leadSource}} and create optimized search</task>
  <instructions>
    Filter leads where {{skipTraceStatus}} equals complete
    Analyze {{propertyType}} in {{location}}
    Score using {{responseRate}} and {{contactStatus}}
  </instructions>
  <output-format>Return lead list with scores</output-format>
</poml>`}
			promptValue={description}
			onPromptChange={setDescription}
			showTitleField
			titleLabel="Search Title"
			titlePlaceholder="High-Intent Investors"
			titleValue={title}
			onTitleChange={setTitle}
			customSections={[
				<MonetizationToggle
					key="monetization"
					enabled={monetizationEnabled}
					onEnabledChange={setMonetizationEnabled}
					priceMultiplier={priceMultiplier}
					onPriceMultiplierChange={setPriceMultiplier}
					acceptedTerms={acceptedTerms}
					onAcceptedTermsChange={setAcceptedTerms}
					itemType="search"
				/>,
			]}
			customFields={customFields}
			customFieldValues={{ referenceSeedList }}
			onCustomFieldChange={(fieldId, value) => {
				if (fieldId === "referenceSeedList") {
					setReferenceSeedList(value);
				}
			}}
			onGenerate={handleGenerate}
			generateButtonText="Generate with AI"
			minPromptLength={10}
			minTitleLength={3}
			maxHeight="85vh"
		/>
	);
}

// Helper functions to extract info from AI prompt
function extractPersonasFromDescription(description: string): string[] {
	const lower = description.toLowerCase();
	const personas: string[] = [];

	if (lower.includes("investor")) personas.push("investor");
	if (lower.includes("wholesale")) personas.push("wholesaler");
	if (lower.includes("lender")) personas.push("lender");
	if (lower.includes("agent") || lower.includes("realtor"))
		personas.push("agent");
	if (lower.includes("owner") || lower.includes("occupant"))
		personas.push("owner-occupant");

	return personas.length > 0 ? personas : ["investor"];
}

function extractInterestsFromDescription(desc: string): string {
	const interests: string[] = [];
	const lower = desc.toLowerCase();

	if (lower.includes("fix") && lower.includes("flip"))
		interests.push("Fix and Flip");
	if (lower.includes("rental")) interests.push("Rental Properties");
	if (lower.includes("wholesale")) interests.push("Wholesaling");
	if (lower.includes("commercial")) interests.push("Commercial RE");

	return interests.join(", ");
}

function extractMotivationFromDescription(desc: string): string[] {
	const motivations: string[] = [];
	const lower = desc.toLowerCase();

	if (lower.includes("motivated") || lower.includes("urgent"))
		motivations.push("hot");
	if (lower.includes("interested") || lower.includes("engaged"))
		motivations.push("warm");
	if (lower.includes("potential") || lower.includes("prospect"))
		motivations.push("cold");

	return motivations.length > 0 ? motivations : ["warm"];
}

function extractPropertyTypesFromDescription(desc: string): string[] {
	const types: string[] = [];
	const lower = desc.toLowerCase();

	if (lower.includes("single") || lower.includes("sfr"))
		types.push("single-family");
	if (lower.includes("multi") || lower.includes("apartment"))
		types.push("multi-family");
	if (lower.includes("condo")) types.push("condo");
	if (lower.includes("townhouse")) types.push("townhouse");
	if (lower.includes("commercial")) types.push("commercial");

	return types.length > 0 ? types : ["single-family"];
}

function extractStatesFromDescription(desc: string): string[] {
	const stateAbbr = desc.match(/\b([A-Z]{2})\b/g) || [];
	return stateAbbr.filter((abbr) => abbr.length === 2);
}

function extractSimilarityFromDescription(desc: string): number {
	const lower = desc.toLowerCase();
	if (lower.includes("exact") || lower.includes("precise")) return 95;
	if (lower.includes("similar") || lower.includes("close")) return 85;
	if (lower.includes("broad") || lower.includes("wide")) return 70;
	return 80;
}

function extractTargetSizeFromDescription(desc: string): number {
	const match = desc.match(/(\d+)\s*(leads?|prospects?|contacts?)/i);
	if (match) return Number.parseInt(match[1], 10);
	return 500;
}
