/**
 * AI Campaign Prompt Generator
 * Context-aware version for campaign creation - prioritizes campaign templates
 */

"use client";

import { Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AIPromptGenerator } from "@/components/reusables/ai/AIPromptGenerator";

// Import the same templates and chip definitions
import type { ChipDefinition } from "@/components/reusables/ai/InlineChipEditor";

interface AICampaignPromptGeneratorProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onPromptGenerated: (prompt: string, title: string) => void;
	variables?: ChipDefinition[];
	tools?: ChipDefinition[];
	scripts?: ChipDefinition[];
	quickActions?: any[];
}

export function AICampaignPromptGenerator({
	isOpen,
	onOpenChange,
	onPromptGenerated,
	variables = [],
	tools = [],
	scripts = [],
	quickActions = [],
}: AICampaignPromptGeneratorProps) {
	const [title, setTitle] = useState("");
	const [prompt, setPrompt] = useState("");

	const handleGenerate = async () => {
		try {
			// For campaigns, we just use the prompt directly
			onPromptGenerated(prompt, title);
			toast.success("Campaign Prompt Ready!", {
				description: "Use this prompt for your campaign",
				duration: 2500,
			});
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to generate prompt");
		}
	};

	return (
		<AIPromptGenerator
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title="AI Campaign Prompt"
			description="Build campaign prompts with variables, tools, and scripts"
			icon={<Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />}
			variables={variables}
			tools={tools}
			scripts={scripts}
			quickActions={quickActions}
			showQuickActions={true}
			prioritizeCategory="campaign"
			filterCategories={["campaign"]}
			promptLabel="Campaign Prompt"
			promptPlaceholder="Create campaign for {{leadList}} using {{coldCallScript}}..."
			promptValue={prompt}
			onPromptChange={setPrompt}
			showTitleField={true}
			titleLabel="Campaign Name"
			titlePlaceholder="Spring 2025 Outreach"
			titleValue={title}
			onTitleChange={setTitle}
			onGenerate={async () => {
				await handleGenerate();
			}}
			generateButtonText="Use This Prompt"
			minPromptLength={10}
			minTitleLength={3}
			maxHeight="85vh"
		/>
	);
}
