"use client";

import { useState } from "react";
import type { ElementType } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditTaskDialog from "./EditTaskDialog";
import {
	Sparkles,
	MessageSquare,
	Phone,
	Share2,
	Mail,
	CalendarClock,
} from "lucide-react";

interface SuggestModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface SuggestionItem {
	key: string;
	title: string;
	description: string;
	icon: ElementType;
	mode: "ai" | "manual";
	prefill: {
		assignType?: "lead" | "leadList" | "";
		title?: string;
		description?: string;
		dueDate?: string;
		scheduledDate?: string;
		scheduledTimezone?: string;
		appointmentDateTime?: string;
		appointmentTimezone?: string;
		youtubeUrl?: string;
	};
}

export default function SuggestModal({
	open,
	onOpenChange,
}: SuggestModalProps) {
	const [createOpen, setCreateOpen] = useState(false);
	const [createMode, setCreateMode] = useState<"ai" | "manual">("ai");
	const [prefill, setPrefill] = useState<SuggestionItem["prefill"] | undefined>(
		undefined,
	);

	const handlePick = (s: SuggestionItem) => {
		setCreateMode(s.mode);
		setPrefill(s.prefill);
		setCreateOpen(true);
		onOpenChange(false);
	};

	const today = new Date();
	const duePlus3 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);

	const suggestions: SuggestionItem[] = [
		{
			key: "sms-followup",
			title: "Follow up via SMS",
			description: "Send a personalized text to the lead",
			icon: MessageSquare,
			mode: "ai",
			prefill: {
				assignType: "lead",
				title: "Text follow-up",
				description:
					"Reach out with a friendly SMS to confirm interest and ask for best time to chat.",
				dueDate: duePlus3,
			},
		},
		{
			key: "call-checkin",
			title: "Schedule a call",
			description: "Plan a quick check-in call",
			icon: Phone,
			mode: "manual",
			prefill: {
				assignType: "lead",
				title: "Call check-in",
				description:
					"Schedule a 10-minute call to understand needs and timeline.",
				dueDate: duePlus3,
				appointmentDateTime: new Date(today.getTime() + 2 * 60 * 60 * 1000)
					.toISOString()
					.slice(0, 16),
			},
		},
		{
			key: "social-post",
			title: "Social media post",
			description: "Draft and schedule a post",
			icon: Share2,
			mode: "ai",
			prefill: {
				assignType: "leadList",
				title: "Draft social post",
				description:
					"Create a concise, engaging post highlighting new listings and CTAs.",
				dueDate: duePlus3,
			},
		},
		{
			key: "email-sequence",
			title: "Email outreach",
			description: "Prepare first email in sequence",
			icon: Mail,
			mode: "ai",
			prefill: {
				assignType: "lead",
				title: "Intro email",
				description: "Draft an email with value props and next steps.",
				dueDate: duePlus3,
			},
		},
		{
			key: "appointment",
			title: "Set appointment",
			description: "Propose a meeting time",
			icon: CalendarClock,
			mode: "manual",
			prefill: {
				assignType: "lead",
				title: "Propose appointment",
				description: "Offer 2–3 time slots and confirm availability.",
				dueDate: duePlus3,
				appointmentDateTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
					.toISOString()
					.slice(0, 16),
			},
		},
	];

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-xl">
					<DialogHeader>
						<DialogTitle className="inline-flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-primary" /> Suggestions
						</DialogTitle>
					</DialogHeader>
					<div className="flex gap-3 overflow-x-auto py-2 px-1">
						{suggestions.map((s) => {
							const Icon = s.icon;
							return (
								<button
									key={s.key}
									type="button"
									onClick={() => handlePick(s)}
									className="shrink-0 w-56 text-left rounded-lg border border-muted-foreground/20 hover:border-primary/40 hover:shadow-sm transition p-3 bg-background"
									aria-label={`Pick suggestion: ${s.title}`}
								>
									<div className="flex items-center gap-2 mb-2">
										<Icon className="h-4 w-4 text-foreground/80" />
										<span className="font-medium">{s.title}</span>
										<span className="ml-auto text-[10px] rounded px-1.5 py-0.5 border text-muted-foreground">
											{s.mode.toUpperCase()}
										</span>
									</div>
									<p className="text-sm text-muted-foreground line-clamp-3">
										{s.description}
									</p>
								</button>
							);
						})}
					</div>
					<div className="flex justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create dialog launched from a suggestion */}
			<EditTaskDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				initialTab={createMode}
				prefill={prefill}
			/>
		</>
	);
}
