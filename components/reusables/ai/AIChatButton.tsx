/**
 * AI Chat Button
 * Tier-gated button that opens AI chat in new tab with context
 */

"use client";

import { Button } from "@/components/ui/button";
import FeatureGuard from "@/components/access/FeatureGuard";
import { MessageSquare, Sparkles } from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";
import { toast } from "sonner";
import BorderBeam from "@/components/magicui/border-beam";

interface AIChatButtonProps {
	promptValue?: string;
	titleValue?: string;
	disabled?: boolean;
	className?: string;
}

export function AIChatButton({
	promptValue,
	titleValue,
	disabled = false,
	className = "",
}: AIChatButtonProps) {
	const userId = useUserStore((state) => state.userProfile?.id);
	const agentId = useUserStore(
		(state) => state.userProfile?.aIKnowledgebase?.assignedAssistantID,
	);

	const normalizePrompt = (prompt: string): string => {
		// Normalize {{ variable }} to {{variable}} (remove spaces around variable names)
		return prompt.replace(/\{\{\s*(\w+)\s*\}\}/g, "{{$1}}");
	};

	const handleChatClick = () => {
		// Normalize prompt before sending
		const normalizedPrompt = normalizePrompt(promptValue);

		// Build URL params for chat
		const params = new URLSearchParams();

		// Core params
		if (userId) params.set("userId", userId);
		if (agentId) params.set("agentId", agentId);
		params.set("mode", "chat-only");

		// Context params - use normalized prompt
		if (normalizedPrompt) params.set("context", normalizedPrompt);
		if (titleValue) params.set("title", titleValue);

		// AI params
		params.set("aiAssist", "true");
		params.set("contextAware", "true");

		// Build URL - replace with your actual chat domain
		const chatUrl = `https://chat.dealscale.io?${params.toString()}`;

		// Open in new tab
		window.open(chatUrl, "_blank", "noopener,noreferrer");

		toast.success("AI Chat Opened", {
			description: "Chat opened in new tab with your context",
			duration: 2000,
		});
	};

	return (
		<FeatureGuard
			featureKey="ai-chat"
			fallbackTier="starter"
			fallbackMode="overlay"
			overlayContent={() => null}
			showPopover={true}
			iconOnly={true}
		>
			<div className="relative w-full h-full">
				<Button
					type="button"
					variant="secondary"
					onClick={handleChatClick}
					disabled={disabled}
					title="Opens AI chat in new tab with your context"
					className={`relative h-11 sm:h-10 w-full gap-1.5 text-sm font-semibold overflow-hidden bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 hover:from-secondary/95 hover:via-secondary/85 hover:to-secondary/75 shadow-md hover:shadow-lg transition-all ${className}`}
				>
					<MessageSquare className="h-4 w-4 shrink-0" />
					<span className="truncate">Chat with AI</span>
					<Sparkles className="h-3 w-3 shrink-0 absolute top-1 right-1 text-primary animate-pulse" />
				</Button>
				{/* Border Beam Animation - Theme Adaptive */}
				<BorderBeam
					size={100}
					duration={12}
					delay={0}
					colorFrom="hsl(var(--primary))"
					colorTo="hsl(var(--accent))"
				/>
			</div>
		</FeatureGuard>
	);
}
