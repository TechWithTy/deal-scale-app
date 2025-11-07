/**
 * Campaign Prompt Generator
 * Specialized component for generating campaign prompts with copy-to-clipboard
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Megaphone, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ChipTextarea, type ChipItem } from "./ChipTextarea";
import { InsertableChips, type InsertableChip } from "./InsertableChips";
import type { ChipDefinition } from "./InlineChipEditor";
import {
	QuickActionTemplates,
	type QuickActionTemplate,
} from "./QuickActionTemplates";

interface CampaignPromptGeneratorProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	variables?: ChipDefinition[];
	tools?: ChipDefinition[];
	scripts?: ChipDefinition[];
	quickActions?: QuickActionTemplate[];
}

export function CampaignPromptGenerator({
	isOpen,
	onOpenChange,
	variables = [],
	tools = [],
	scripts = [],
	quickActions = [],
}: CampaignPromptGeneratorProps) {
	const [prompt, setPrompt] = useState("");

	// Combine all chips
	const allChips: ChipItem[] = [...variables, ...tools, ...scripts].map(
		(chip) => ({
			key: chip.key,
			label: chip.label,
			description: chip.description,
		}),
	);

	const allChipsWithType = [...variables, ...tools, ...scripts];

	// Convert to insertable format
	const insertableItems: InsertableChip[] = allChipsWithType.map((chip) => ({
		key: chip.key,
		label: chip.label,
		description: chip.description,
		icon: chip.icon,
	}));

	const handleCopyToClipboard = async () => {
		if (!prompt.trim()) {
			toast.error("Please create a prompt first");
			return;
		}

		try {
			await navigator.clipboard.writeText(prompt);
			toast.success("Campaign prompt copied!", {
				description: "Paste into your campaign builder or messaging app",
				duration: 3000,
				icon: <Copy className="h-4 w-4" />,
			});
		} catch (error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const handleTemplateSelect = (template: QuickActionTemplate) => {
		setPrompt(template.prompt);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="mx-4 max-w-2xl flex flex-col gap-0 p-0 h-[95vh] sm:mx-auto sm:h-auto max-h-[85vh]">
				{/* Header */}
				<DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 pb-3 border-b shrink-0">
					<DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
						<Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
						Campaign Prompt Generator
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm">
						Build campaign prompts with variables, tools, and scripts - then
						copy to clipboard
					</DialogDescription>
				</DialogHeader>

				{/* Content */}
				<div className="overflow-y-auto flex-1 min-h-0 px-4 sm:px-6 py-4">
					<div className="space-y-4">
						{/* Quick Actions */}
						{quickActions.length > 0 && (
							<QuickActionTemplates
								templates={quickActions}
								onTemplateSelect={handleTemplateSelect}
							/>
						)}

						{/* Insertable Items */}
						{(variables.length > 0 ||
							tools.length > 0 ||
							scripts.length > 0) && (
							<InsertableChips
								chips={insertableItems}
								onChipClick={(key) => {
									setPrompt((prev) => `${prev}{{${key}}}`);
								}}
								label="Available Items (Click to Insert)"
								helpText="Click to insert variables, tools, or scripts"
								searchPlaceholder="Search all items..."
								emptyMessage="No items available"
							/>
						)}

						{/* Prompt Editor */}
						<ChipTextarea
							id="campaign-prompt"
							label="Campaign Prompt"
							value={prompt}
							onChange={setPrompt}
							placeholder={`<poml>
  <role>Campaign strategist</role>
  <task>Create campaign for {{ leadList }}</task>
  <context>
    <var name="script">{{ script }}</var>
    <var name="leadList">{{ leadList }}</var>
  </context>
  <instructions>Execute campaign workflow</instructions>
</poml>`}
							availableChips={allChips}
							helpText="Type normally and use {{variable}} syntax. Backspace deletes entire chips."
							rows={6}
							showChipsBelow={false}
						/>

						{/* Preview of used context */}
						{prompt && (
							<div className="mt-2">
								<p className="mb-2 text-muted-foreground text-xs">
									Context in your prompt:
								</p>
								<div className="overflow-x-auto">
									<div className="flex min-w-max flex-nowrap gap-2 rounded-lg border bg-muted/30 p-2 sm:flex-wrap sm:min-w-0">
										{allChipsWithType
											.filter((chip) => prompt.includes(`{{${chip.key}}}`))
											.map((chip) => {
												// Color by type
												let bgColor = "rgba(59, 130, 246, 0.35)";
												let textColor = "rgb(29, 78, 216)";
												let borderColor = "rgba(59, 130, 246, 0.6)";

												if (chip.type === "tool") {
													bgColor = "rgba(34, 197, 94, 0.35)";
													textColor = "rgb(21, 128, 61)";
													borderColor = "rgba(34, 197, 94, 0.6)";
												} else if (chip.type === "function") {
													bgColor = "rgba(168, 85, 247, 0.35)";
													textColor = "rgb(126, 34, 206)";
													borderColor = "rgba(168, 85, 247, 0.6)";
												} else if (chip.type === "script") {
													bgColor = "rgba(244, 63, 94, 0.35)";
													textColor = "rgb(190, 18, 60)";
													borderColor = "rgba(244, 63, 94, 0.6)";
												}

												const isDark =
													document.documentElement.classList.contains("dark");
												if (isDark) {
													if (chip.type === "tool")
														textColor = "rgb(134, 239, 172)";
													else if (chip.type === "function")
														textColor = "rgb(216, 180, 254)";
													else if (chip.type === "script")
														textColor = "rgb(251, 113, 133)";
													else textColor = "rgb(147, 197, 253)";
												}

												return (
													<div
														key={chip.key}
														className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold"
														style={{
															backgroundColor: bgColor,
															color: textColor,
															borderColor: borderColor,
															borderWidth: "2px",
														}}
													>
														{chip.icon && (
															<span className="shrink-0">{chip.icon}</span>
														)}
														<span className="font-mono">{`{{${chip.key}}}`}</span>
													</div>
												);
											})}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="border-t px-4 py-3 sm:px-6 sm:py-4 bg-background shrink-0 safe-bottom">
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="h-11 sm:h-10 flex-1 text-sm font-medium"
						>
							Close
						</Button>
						<Button
							type="button"
							onClick={handleCopyToClipboard}
							disabled={!prompt.trim()}
							className="h-11 sm:h-10 flex-1 gap-2 text-sm font-medium"
						>
							<Copy className="h-4 w-4 shrink-0" />
							<span className="truncate">Copy to Clipboard</span>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
