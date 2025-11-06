import React from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@root/components/ui/popover";
import { Button } from "@root/components/ui/button";
import { Label } from "@root/components/ui/label";
import { Checkbox } from "@root/components/ui/checkbox";
import { toast } from "@root/components/ui/use-toast";
import { HandIcon, Coins, Check } from "lucide-react";

interface QuickCreditActionsProps {
	isTop10: boolean;
	currentUserRank?: number;
	currentUserId?: string;
	currentUserName?: string;
}

type CreditType = "skip-trace" | "ai" | "lead";

const creditTypeLabels: Record<CreditType, string> = {
	"skip-trace": "Skip Trace Credits",
	"ai": "AI Credits",
	"lead": "Lead Credits",
};

export const QuickCreditActions = ({
	isTop10,
	currentUserRank,
	currentUserId,
	currentUserName,
}: QuickCreditActionsProps) => {
	const [open, setOpen] = React.useState(false);
	const [selectedType, setSelectedType] = React.useState<CreditType | null>(null);
	const [giftCode, setGiftCode] = React.useState("");
	const [termsAccepted, setTermsAccepted] = React.useState(false);

	const handleSubmit = () => {
		if (!selectedType) {
			toast({
				title: "No credit type selected",
				description: "Please select a credit type to continue.",
				variant: "destructive",
			});
			return;
		}

		if (!termsAccepted) {
			toast({
				title: "Terms not accepted",
				description: "Please accept the terms and conditions to continue.",
				variant: "destructive",
			});
			return;
		}

		try {
			const key = isTop10 
				? "leaderboard:creditRequestsWithInterest" 
				: "leaderboard:donationRequests";
			
			const raw = window.localStorage.getItem(key);
			const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
			
			// Calculate expiration (7 days from now)
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);
			
			const payload = {
				userId: currentUserId ?? "unknown",
				username: currentUserName ?? "Anonymous",
				rank: currentUserRank,
				creditType: selectedType,
				actionType: isTop10 ? "request-payback" : "request-donation",
				requiresPayback: isTop10,
				visibilityPeriodDays: 7,
				expiresAt: expiresAt.toISOString(),
				monthlyLimit: isTop10 ? null : 2, // Gift requests limited to 2 per month
				earnableVia: isTop10 ? null : ["wheel_spins", "discord_help", "charitable_actions"],
				giftCode: !isTop10 && giftCode ? giftCode : null, // Track source of earned credits
				termsAccepted,
				createdAt: new Date().toISOString(),
			};
			
			const timestamp = Date.now();
			(existing as Record<string, unknown>)[`${currentUserId}_${timestamp}`] = payload;
			window.localStorage.setItem(key, JSON.stringify(existing));

			toast({
				title: isTop10 ? "Credit offer posted" : "Donation request posted",
				description: isTop10 
					? `Your ${creditTypeLabels[selectedType]} offer will be visible for 7 days. Payback with interest required.`
					: `Your ${creditTypeLabels[selectedType]} request will be visible for 7 days.`,
			});
			
			setOpen(false);
			setSelectedType(null);
			setGiftCode("");
			setTermsAccepted(false);
		} catch (e) {
			toast({
				title: "Unable to save",
				description: "Please try again later.",
				variant: "destructive",
			});
		}
	};

	const Icon = isTop10 ? HandIcon : Coins;
	const buttonLabel = isTop10 ? "Request" : "Ask";
	const popoverTitle = isTop10 
		? "Request Credits (Payback + Interest)" 
		: "Request Donation";

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="sm"
					variant={isTop10 ? "default" : "secondary"}
					className="h-9 gap-1.5 px-3 sm:h-8 sm:px-4"
					aria-label={buttonLabel}
					title={buttonLabel}
				>
					<Icon className="h-4 w-4" />
					<span className="hidden sm:inline">{buttonLabel}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-4">
					<div>
						<h3 className="font-semibold text-foreground text-base">{popoverTitle}</h3>
						<p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
							{isTop10 
								? "Select credits to request. You'll need to pay back with interest."
								: "Request donated credits from leaders. No payback required."
							}
						</p>
						<div className="mt-2 space-y-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 dark:bg-primary/10">
							<p className="text-xs text-foreground leading-relaxed">
								{isTop10 ? (
									<>
										<strong>Note:</strong> Your offer will be visible for 7 days.
									</>
								) : (
									<>
										<strong>Limit:</strong> 2 gift requests per month. Visible for 7 days.
									</>
								)}
							</p>
							{!isTop10 && (
								<p className="text-xs text-muted-foreground leading-relaxed">
									💡 Earn extra requests via wheel spins, helping in Discord, or charitable actions.
								</p>
							)}
						</div>
					</div>

					{/* Credit Type Selection */}
					<div className="space-y-2">
						<Label className="text-sm">Credit Type</Label>
					<div className="flex flex-col gap-2">
						{(Object.entries(creditTypeLabels) as [CreditType, string][]).map(([type, label]) => (
							<button
								key={type}
								type="button"
								onClick={() => setSelectedType(type)}
								className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
									selectedType === type
										? "border-primary bg-primary/10 text-primary shadow-sm dark:bg-primary/20"
										: "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
								}`}
							>
								<span className="font-medium">{label}</span>
								{selectedType === type && (
									<Check className="h-4 w-4 text-primary" />
								)}
							</button>
						))}
					</div>
					</div>

					{/* Gift Request Code - Only for non-top 10 */}
					{!isTop10 && (
						<div className="space-y-2">
							<Label htmlFor="gift-code" className="text-sm">
								Gift Request Code <span className="text-muted-foreground">(Optional)</span>
							</Label>
							<input
								id="gift-code"
								type="text"
								value={giftCode}
								onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
								placeholder="e.g., WHEEL2024, DISCORD-HELP, CHARITY-50"
								className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							/>
							<p className="text-xs text-muted-foreground">
								Enter code from wheel spin, Discord reward, or charitable action
							</p>
						</div>
					)}

					{/* Terms and Conditions */}
					<div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3 dark:bg-muted/20">
						<Checkbox
							id="terms-quick"
							checked={termsAccepted}
							onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
							className="mt-0.5"
						/>
						<label
							htmlFor="terms-quick"
							className="cursor-pointer text-sm text-foreground leading-relaxed"
						>
							I accept the{" "}
							<a
								href="/terms-and-conditions"
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary/80 hover:decoration-primary/60"
								onClick={(e) => e.stopPropagation()}
							>
								Terms and Conditions
							</a>
						</label>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setOpen(false);
								setSelectedType(null);
								setTermsAccepted(false);
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							size="sm"
							variant="default"
							className="shadow"
							onClick={handleSubmit}
							disabled={!selectedType || !termsAccepted}
						>
							{isTop10 ? <HandIcon className="mr-2 h-4 w-4" /> : <Coins className="mr-2 h-4 w-4" />}
							Submit
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

