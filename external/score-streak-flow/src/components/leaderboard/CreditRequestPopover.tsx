import React from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@root/components/ui/popover";
import { Button } from "@root/components/ui/button";
import { Input } from "@root/components/ui/input";
import { Label } from "@root/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@root/components/ui/select";
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
	const [interestPeriod, setInterestPeriod] = React.useState<string>("monthly");
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
			// Calculate expiration (7 days from now)
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);

			const payload = {
				userId: player.id,
				username: player.username,
				creditType: player.creditType ?? null,
				creditsRequested: amount,
				markupPercentage: markup,
				interestPeriod,
				netTerms: Number(netTerms),
				paybackDate: paybackDate || null,
				termsLink: termsLink || null,
				visibilityPeriodDays: 7,
				expiresAt: expiresAt.toISOString(),
				offerType: "credit-loan",
				requiresPayback: true,
				createdAt: new Date().toISOString(),
			};
			(existing as Record<string, unknown>)[player.id] = payload;
			window.localStorage.setItem(key, JSON.stringify(existing));

			toast({
				title: "Credit offer posted",
				description: `Your ${player.creditType ?? "credit"} offer will be visible for 7 days.`,
			});
			setOpen(false);
			setCreditsRequested("");
			setMarkupPercentage("");
			setInterestPeriod("monthly");
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
						<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
							Offer credits with interest terms. Borrower pays back with interest.
						</p>
						<div className="mt-2 space-y-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 dark:bg-emerald-500/10">
							<p className="text-xs text-foreground leading-relaxed">
								<strong>Visibility:</strong> Your offer will be visible for 7 days.
							</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								💰 Interest earnings credited upon payback
							</p>
						</div>
						<div className="mt-2 space-y-1.5 rounded-md border border-orange-500/20 bg-orange-500/5 px-3 py-2 dark:bg-orange-500/10">
							<p className="text-xs text-foreground font-semibold">⚠️ Key Terms</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								If borrower's credits run out: Card will be charged automatically. If charge fails, balance goes negative and campaigns pause until resolved.
							</p>
						</div>
					</div>
					{/* Credit Amount */}
					<div>
						<Label htmlFor={`credits-${player.id}`}>
							Credit Amount <span className="text-xs text-muted-foreground">(required)</span>
						</Label>
						<Input
							id={`credits-${player.id}`}
							type="number"
							inputMode="numeric"
							placeholder="e.g., 100"
							min="1"
							value={creditsRequested}
							onChange={(e: {
								target: { value: React.SetStateAction<string> };
							}) => setCreditsRequested(e.target.value)}
						/>
					</div>

					{/* Interest Rate & Period */}
					<div className="grid grid-cols-2 gap-2">
						<div>
							<Label htmlFor={`markup-${player.id}`} className="text-xs">
								Interest Rate (%)
							</Label>
							<Input
								id={`markup-${player.id}`}
								type="number"
								inputMode="numeric"
								step="0.1"
								placeholder="5.0"
								min="0.1"
								value={markupPercentage}
								onChange={(e: {
									target: { value: React.SetStateAction<string> };
								}) => setMarkupPercentage(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor={`interest-period-${player.id}`} className="text-xs">
								Period
							</Label>
							<Select value={interestPeriod} onValueChange={setInterestPeriod}>
								<SelectTrigger id={`interest-period-${player.id}`} className="h-9">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="daily">Daily</SelectItem>
									<SelectItem value="weekly">Weekly</SelectItem>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="quarterly">Quarterly</SelectItem>
									<SelectItem value="annually">Annually</SelectItem>
									<SelectItem value="one-time">One-time</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Net Terms & Due Date */}
					<div className="grid grid-cols-2 gap-2">
						<div>
							<Label htmlFor={`net-terms-${player.id}`} className="text-xs">
								Net Terms
							</Label>
							<Select value={netTerms} onValueChange={setNetTerms}>
								<SelectTrigger id={`net-terms-${player.id}`} className="h-9">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="15">Net 15</SelectItem>
									<SelectItem value="30">Net 30</SelectItem>
									<SelectItem value="45">Net 45</SelectItem>
									<SelectItem value="60">Net 60</SelectItem>
									<SelectItem value="90">Net 90</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor={`payback-${player.id}`} className="text-xs">
								Due Date
							</Label>
							<Input
								id={`payback-${player.id}`}
								type="date"
								className="h-9"
								value={paybackDate}
								onChange={(e: {
									target: { value: React.SetStateAction<string> };
								}) => setPaybackDate(e.target.value)}
							/>
						</div>
					</div>

					{/* Terms Link */}
					<div>
						<Label htmlFor={`terms-${player.id}`} className="text-xs">
							Terms Link <span className="text-muted-foreground">(optional)</span>
						</Label>
						<Input
							id={`terms-${player.id}`}
							type="url"
							placeholder="https://your-terms.com"
							className="h-9"
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
