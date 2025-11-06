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
	const [netTerms, setNetTerms] = React.useState<string>("30");
	const [paybackDate, setPaybackDate] = React.useState<string>("");
	const [termsLink, setTermsLink] = React.useState<string>("");

	const requestButtonLabel = buildRequestButtonLabel(player.creditType ?? "");

	const handleSubmit = () => {
		const amount = Number(creditsRequested);
		const markup = Number(markupPercentage);
		// creditType provided by backend via player.creditType; no selection required in UI
		if (!Number.isFinite(amount) || amount <= 0) {
			toast({
				title: "Invalid credit amount",
				description: "Enter a valid amount greater than 0.",
				variant: "destructive",
			});
			return;
		}
		if (!Number.isFinite(markup) || markup <= 0) {
			toast({
				title: "Invalid interest rate",
				description: "Enter an interest rate greater than 0%.",
				variant: "destructive",
			});
			return;
		}
		if (!paybackDate) {
			toast({
				title: "Due date required",
				description: "Select a due date for payback.",
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
				netTerms: Number(netTerms),
				paybackDate: paybackDate || null,
				termsLink: termsLink || null,
				createdAt: new Date().toISOString(),
			};
			(existing as Record<string, unknown>)[player.id] = payload;
			window.localStorage.setItem(key, JSON.stringify(existing));

			toast({
				title: "Credit offer submitted",
				description: `Your ${player.creditType ?? "credit"} offer has been saved.`,
			});
			setOpen(false);
			setCreditsRequested("");
			setMarkupPercentage("");
			setNetTerms("30");
			setPaybackDate("");
			setTermsLink("");
		} catch (e) {
			toast({
				title: "Unable to save offer",
				description: "Please try again.",
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
					<div>
						<h3 className="font-semibold text-base text-foreground">Credits Offered</h3>
						<p className="mt-1 text-muted-foreground text-sm">
							Offer credits with interest terms below.
						</p>
					</div>
					{/* Credit Type UI removed per spec; button label shows type */}
					<div>
						<Label htmlFor={`credits-${player.id}`}>Credit Amount</Label>
						<Input
							id={`credits-${player.id}`}
							type="number"
							inputMode="numeric"
							placeholder="e.g., 100"
							value={creditsRequested}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setCreditsRequested(e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor={`markup-${player.id}`}>Interest Rate (%)</Label>
						<Input
							id={`markup-${player.id}`}
							type="number"
							inputMode="numeric"
							step="0.1"
							placeholder="e.g., 5.0"
							value={markupPercentage}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setMarkupPercentage(e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor={`net-terms-${player.id}`}>Net Terms (Days)</Label>
						<select
							id={`net-terms-${player.id}`}
							value={netTerms}
							onChange={(e) => setNetTerms(e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="15">Net 15</option>
							<option value="30">Net 30</option>
							<option value="45">Net 45</option>
							<option value="60">Net 60</option>
							<option value="90">Net 90</option>
						</select>
					</div>
					<div>
						<Label htmlFor={`payback-${player.id}`}>Due Date</Label>
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
						<Label htmlFor={`terms-${player.id}`}>Terms Link (optional)</Label>
						<Input
							id={`terms-${player.id}`}
							type="url"
							placeholder="https://terms-link.com"
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
