import React from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@root/components/ui/popover";
import { Button } from "@root/components/ui/button";
import { Input } from "@root/components/ui/input";
import { Label } from "@root/components/ui/label";
import { toast } from "@root/components/ui/use-toast";
import { HandIcon, Send } from "lucide-react";
import type { Player } from "../realtime/WebSocketProvider";
import { buildRequestButtonLabel } from "./utils";

interface CreditRequestPopoverProps {
	player: Player;
}

export const CreditRequestPopover = ({ player }: CreditRequestPopoverProps) => {
	const [open, setOpen] = React.useState(false);
	const [creditsRequested, setCreditsRequested] = React.useState<string>("");
	const [markupPercentage, setMarkupPercentage] = React.useState<string>("");
	const [paybackDate, setPaybackDate] = React.useState<string>("");
	const [termsLink, setTermsLink] = React.useState<string>("");

	const requestButtonLabel = buildRequestButtonLabel(player.creditType ?? "");

	const handleSubmit = () => {
		const amount = Number(creditsRequested);
		const markup = Number(markupPercentage);
		// creditType provided by backend via player.creditType; no selection required in UI
		if (!Number.isFinite(amount) || amount <= 0) {
			toast({
				title: "Invalid amount",
				description: "Please enter a valid Credits Requested amount (> 0).",
				variant: "destructive",
			});
			return;
		}
		if (!Number.isFinite(markup) || markup <= 0) {
			toast({
				title: "Markup must be greater than 0",
				description: "Please enter a markup percentage greater than 0.",
				variant: "destructive",
			});
			return;
		}
		if (!paybackDate) {
			toast({
				title: "Payback Date required",
				description: "Please select a payback date.",
				variant: "destructive",
			});
			return;
		}

		try {
			const key = "leaderboard:creditRequests";
			const raw = window.localStorage.getItem(key);
			const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
			const payload = {
				userId: player.id,
				username: player.username,
				creditType: player.creditType ?? null,
				creditsRequested: amount,
				markupPercentage: markup,
				paybackDate: paybackDate || null,
				termsLink: termsLink || null,
				createdAt: new Date().toISOString(),
			};
			(existing as Record<string, unknown>)[player.id] = payload;
			window.localStorage.setItem(key, JSON.stringify(existing));

			toast({
				title: "Your request has been submitted",
				description: `Saved under ${player.username}.`,
			});
			setOpen(false);
			setCreditsRequested("");
			setMarkupPercentage("");
			setPaybackDate("");
			setTermsLink("");
		} catch (e) {
			toast({
				title: "Unable to save request",
				description: "Please try again later.",
				variant: "destructive",
			});
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="h-7 gap-1 rounded-full px-3 text-xs shadow-none hover:bg-secondary/80"
					aria-label={requestButtonLabel}
				>
					<HandIcon className="h-3.5 w-3.5" />
					<span>{requestButtonLabel}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-3">
					<p className="text-muted-foreground text-xs">
						Leaders are requesting credits. Fill in the details below to submit
						your request.
					</p>
					{/* Credit Type UI removed per spec; button label shows type */}
					<div>
						<Label htmlFor={`credits-${player.id}`}>Credits Requested</Label>
						<Input
							id={`credits-${player.id}`}
							type="number"
							inputMode="numeric"
							value={creditsRequested}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setCreditsRequested(e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor={`markup-${player.id}`}>Markup Percentage</Label>
						<Input
							id={`markup-${player.id}`}
							type="number"
							inputMode="numeric"
							step="0.01"
							value={markupPercentage}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setMarkupPercentage(e.target.value)}
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Must be greater than 0
						</p>
					</div>
					<div>
						<Label htmlFor={`payback-${player.id}`}>Payback Date</Label>
						<Input
							id={`payback-${player.id}`}
							type="date"
							value={paybackDate}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setPaybackDate(e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor={`terms-${player.id}`}>Terms (optional link)</Label>
						<Input
							id={`terms-${player.id}`}
							type="url"
							placeholder="https://example.com/terms"
							value={termsLink}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setTermsLink(e.target.value)}
						/>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							size="default"
							variant="default"
							className="shadow"
							onClick={handleSubmit}
						>
							<Send className="mr-2 h-4 w-4" /> Submit
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
