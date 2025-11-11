"use client";

import { AIPromptGenerator } from "@/components/reusables/ai/AIPromptGenerator";
import { MonetizationToggle } from "@/components/reusables/ai/shared/MonetizationToggle";
import { PlatformIntelligence } from "@/components/reusables/ai/shared/PlatformIntelligence";
import { getChipsForContext } from "@/lib/config/ai/chipDefinitions";
import { getSalesScriptsChips } from "@/lib/config/ai/chipUtils";
import { useState, useMemo } from "react";
import { Workflow } from "lucide-react";
import { toast } from "sonner";

interface AIWorkflowGeneratorProps {
	isOpen: boolean;
	onClose: () => void;
	onGenerate: (data: {
		title: string;
		prompt: string;
		monetizationEnabled: boolean;
		priceMultiplier: number;
	}) => Promise<void>;
}

export function AIWorkflowGenerator({
	isOpen,
	onClose,
	onGenerate,
}: AIWorkflowGeneratorProps) {
	const [promptValue, setPromptValue] = useState("");
	const [titleValue, setTitleValue] = useState("");
	const [monetizationEnabled, setMonetizationEnabled] = useState(false);
	const [priceMultiplier, setPriceMultiplier] = useState(1);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [aiLearningEnabled, setAILearningEnabled] = useState(false);

	// Get centralized chip definitions for workflow context
	const chipContext = useMemo(() => getChipsForContext("workflow"), []);
	const salesScripts = useMemo(() => getSalesScriptsChips(), []);

	// POML template placeholder for workflows
	const workflowPlaceholder = `<poml version="1.0">
  <workflow name="Lead Enrichment Pipeline">
    <trigger type="webhook">
      <event>lead.created</event>
    </trigger>
    
    <phase name="enrichment">
      <task>{{enrichLead}} with premium data</task>
      <task>Validate email and phone</task>
    </phase>
    
    <phase name="notification">
      <task>{{sendWebhook}} to {{webhookUrl}}</task>
      <task>{{updateCRM}} with enriched data</task>
    </phase>
    
    <output>
      <return>enriched_lead_data</return>
    </output>
  </workflow>
</poml>`;

	const handleGenerate = async (data: { title?: string; prompt: string }) => {
		if (!data.title) {
			toast.error("Workflow name is required");
			return;
		}

		// Validate monetization settings
		if (monetizationEnabled && !acceptedTerms) {
			toast.error("Please accept the Terms & Conditions", {
				description: "Required to make workflows public and monetized",
			});
			return;
		}

		await onGenerate({
			title: data.title,
			prompt: data.prompt,
			monetizationEnabled,
			priceMultiplier,
		});
	};

	return (
		<AIPromptGenerator
			isOpen={isOpen}
			onOpenChange={onClose}
			title="AI Workflow Generator"
			description="Generate powerful workflows with AI using POML markup"
			icon={<Workflow className="h-5 w-5" />}
			variables={chipContext.variables}
			tools={chipContext.tools}
			agents={chipContext.agents}
			scripts={salesScripts}
			resources={chipContext.resources}
			automations={chipContext.automations}
			showQuickActions={true}
			prioritizeCategory="workflow"
			filterCategories={["workflow", "audience_search", "campaign"]}
			showPromptTemplates={true}
			promptTemplateCategory="workflow"
			showFileUpload={false}
			showAILearning={true}
			aiLearningEnabled={aiLearningEnabled}
			onAILearningChange={setAILearningEnabled}
			promptLabel="Workflow Definition (POML)"
			promptPlaceholder={workflowPlaceholder}
			promptValue={promptValue}
			onPromptChange={setPromptValue}
			showTitleField={true}
			titleLabel="Workflow Name"
			titlePlaceholder="e.g., Lead Enrichment Pipeline"
			titleValue={titleValue}
			onTitleChange={setTitleValue}
			customSections={[
				<MonetizationToggle
					key="monetization"
					enabled={monetizationEnabled}
					onEnabledChange={setMonetizationEnabled}
					priceMultiplier={priceMultiplier}
					onPriceMultiplierChange={setPriceMultiplier}
					acceptedTerms={acceptedTerms}
					onAcceptedTermsChange={setAcceptedTerms}
					itemType="workflow"
				/>,
			]}
			onGenerate={handleGenerate}
			generateButtonText="Generate Workflow"
			cancelButtonText="Cancel"
			minPromptLength={20}
			minTitleLength={3}
		/>
	);
}
