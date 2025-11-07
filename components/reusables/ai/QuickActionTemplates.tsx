/**
 * Quick Action Templates
 * Pre-built prompt templates with variables, tools, and scripts
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/_utils";

export interface QuickActionTemplate {
	id: string;
	title: string;
	description: string;
	prompt: string;
	category: "search" | "campaign" | "workflow" | "kestra";
	tags: string[];
}

interface QuickActionTemplatesProps {
	templates: QuickActionTemplate[];
	onTemplateSelect: (template: QuickActionTemplate) => void;
	onCopyToClipboard?: (template: QuickActionTemplate) => void;
	className?: string;
}

export function QuickActionTemplates({
	templates,
	onTemplateSelect,
	onCopyToClipboard,
	className = "",
}: QuickActionTemplatesProps) {
	const handleCopy = async (template: QuickActionTemplate) => {
		try {
			await navigator.clipboard.writeText(template.prompt);
			toast.success(`Copied "${template.title}" to clipboard!`, {
				description: "Paste into any field to use this template",
				duration: 3000,
			});
			onCopyToClipboard?.(template);
		} catch (error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const handleUse = (template: QuickActionTemplate) => {
		onTemplateSelect(template);
		toast.success(`Applied "${template.title}"`, {
			description: "Template loaded into your prompt",
			duration: 2000,
		});
	};

	return (
		<div className={className}>
			<Label className="text-sm mb-3 block">Quick Actions</Label>
			<div className="space-y-2 max-h-[300px] overflow-y-auto">
				{templates.map((template) => (
					<div
						key={template.id}
						className="group rounded-lg border border-border bg-card hover:bg-accent/50 transition-all p-3 cursor-pointer"
						onClick={() => handleUse(template)}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
									<h4 className="font-semibold text-sm truncate">
										{template.title}
									</h4>
								</div>
								<p className="text-muted-foreground text-xs mb-2 line-clamp-2">
									{template.description}
								</p>
								<div className="flex flex-wrap gap-1">
									{template.tags.slice(0, 3).map((tag) => (
										<Badge
											key={tag}
											variant="outline"
											className="text-[10px] px-1.5 py-0"
										>
											{tag}
										</Badge>
									))}
									{template.tags.length > 3 && (
										<Badge
											variant="outline"
											className="text-[10px] px-1.5 py-0"
										>
											+{template.tags.length - 3}
										</Badge>
									)}
								</div>
							</div>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleCopy(template);
								}}
								className={cn(
									"shrink-0 h-8 w-8 rounded-md border border-border",
									"flex items-center justify-center",
									"opacity-0 group-hover:opacity-100 transition-opacity",
									"hover:bg-primary/10 hover:border-primary/50",
								)}
								title="Copy to clipboard"
							>
								<Copy className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
