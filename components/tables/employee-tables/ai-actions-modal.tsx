"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMember } from "@/types/userProfile";
import { Mail, MessageSquare, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface AIActionsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selected: TeamMember[];
}

type AiCard = {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	action: () => Promise<void> | void;
};

export function AIActionsModal({
	open,
	onOpenChange,
	selected,
}: AIActionsModalProps) {
	const [busy, setBusy] = useState<"idle" | "running">("idle");
	const names = useMemo(
		() => selected.map((s) => `${s.firstName} ${s.lastName}`.trim()),
		[selected],
	);
	const scrollerRef = useRef<HTMLUListElement | null>(null);
	const [canLeft, setCanLeft] = useState(false);
	const [canRight, setCanRight] = useState(false);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const update = () => {
			setCanLeft(el.scrollLeft > 0);
			setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
		};
		update();
		el.addEventListener("scroll", update);
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => {
			el.removeEventListener("scroll", update);
			ro.disconnect();
		};
	}, []);

	const runAction = async (id: string) => {
		setBusy("running");
		try {
			// TODO: hook this to your API. For now we just simulate.
			await new Promise((r) => setTimeout(r, 700));
		} finally {
			setBusy("idle");
			onOpenChange(false);
		}
	};

	const cards: AiCard[] = [
		{
			id: "intro-email",
			title: "Intro Email",
			description: "Draft a warm introduction for selected members",
			icon: Mail,
			action: () => runAction("intro-email"),
		},
		{
			id: "sms-followup",
			title: "SMS Follow‑up",
			description: "Compose a concise text follow‑up",
			icon: MessageSquare,
			action: () => runAction("sms-followup"),
		},
		{
			id: "summarize",
			title: "Summarize Activity",
			description: "Generate a brief activity summary",
			icon: Sparkles,
			action: () => runAction("summarize"),
		},
		{
			id: "toggle-ai",
			title: "Toggle AI Access",
			description: "Enable or disable AI access",
			icon: Shield,
			action: () => runAction("toggle-ai"),
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="mx-4 max-w-3xl sm:mx-auto">
				<DialogHeader>
					<DialogTitle>AI Actions</DialogTitle>
					<DialogDescription>
						Apply AI-powered actions to the selected team members.
					</DialogDescription>
				</DialogHeader>

				{/* Scroll Area (only this section scrolls vertically) */}
				<div
					className="relative max-h-[60vh] overflow-y-auto"
					style={{ touchAction: "pan-y" }}
				>
					{/* Sticky, scrollable selected chips bar (horizontal) */}
					<div className="sticky top-0 z-10 mb-3 rounded-md border bg-muted/40 p-2">
						<div className="flex overflow-x-auto whitespace-nowrap">
							{names.length === 0 ? (
								<span className="text-muted-foreground text-sm">
									No members selected
								</span>
							) : (
								names.map((n) => (
									<Badge
										key={n}
										className="mr-2 align-middle"
										variant="secondary"
									>
										{n}
									</Badge>
								))
							)}
						</div>
					</div>

					{/* Horizontal cards carousel with scroll buttons */}
					<ul
						ref={scrollerRef}
						className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
						aria-label="AI action cards"
					>
						{cards.map(({ id, title, description, icon: Icon, action }) => (
							<li key={id} className="snap-start">
								<button
									type="button"
									onClick={() => void action()}
									disabled={busy === "running" || names.length === 0}
									className="min-w-[220px] rounded-md border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
									aria-label={title}
								>
									<div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border bg-muted">
										<Icon className="h-4 w-4" />
									</div>
									<div className="font-medium text-sm">{title}</div>
									<div className="text-muted-foreground text-xs">
										{description}
									</div>
								</button>
							</li>
						))}
					</ul>

					{/* Edge fades */}
					<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
					<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />

					{/* Scroll controls */}
					{canLeft && (
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
							<Button
								size="sm"
								variant="outline"
								className="pointer-events-auto h-7 px-2"
								aria-label="Scroll left"
								onClick={() =>
									scrollerRef.current?.scrollBy({
										left: -260,
										behavior: "smooth",
									})
								}
							>
								←
							</Button>
						</div>
					)}
					{canRight && (
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
							<Button
								size="sm"
								variant="outline"
								className="pointer-events-auto h-7 px-2"
								aria-label="Scroll right"
								onClick={() =>
									scrollerRef.current?.scrollBy({
										left: 260,
										behavior: "smooth",
									})
								}
							>
								→
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
