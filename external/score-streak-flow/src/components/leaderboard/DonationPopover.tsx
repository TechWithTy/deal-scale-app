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
import { Gift } from "lucide-react";
import type { Player } from "../realtime/WebSocketProvider";

interface DonationPopoverProps {
	player: Player;
}

export const DonationPopover = ({ player }: DonationPopoverProps) => {
	const [open, setOpen] = React.useState(false);
	const [donationType, setDonationType] = React.useState<
		"skip" | "ai" | "lead" | ""
	>("");
	const [message, setMessage] = React.useState<string>("");
	const [amount, setAmount] = React.useState<string>("");

	const label = donationType
		? `Requesting ${donationType} donation`
		: "Requesting donation";

	const handleSubmit = () => {
		if (!donationType) {
			toast({
				title: "Choose a donation type",
				description: "Select skip, ai, or lead.",
				variant: "destructive",
			});
			return;
		}
		const n = Number(amount);
		if (!Number.isFinite(n) || n <= 0) {
			toast({
				title: "Enter a valid amount",
				description: "Amount must be greater than 0.",
				variant: "destructive",
			});
			return;
		}

		try {
			const key = "leaderboard:donations";
			const raw = window.localStorage.getItem(key);
			const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
			const payload = {
				userId: player.id,
				username: player.username,
				donationType,
				amount: n,
				message: message.trim() || null,
				createdAt: new Date().toISOString(),
			};
			(existing as Record<string, unknown>)[player.id] = payload;
			window.localStorage.setItem(key, JSON.stringify(existing));

			toast({
				title: "Donation request submitted",
				description: `Saved under ${player.username}.`,
			});
			setOpen(false);
			setDonationType("");
			setMessage("");
			setAmount("");
		} catch (e) {
			toast({
				title: "Unable to save donation request",
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
					aria-label={label}
				>
					<Gift className="h-3.5 w-3.5" />
					<span>{label}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-3">
					<div>
						<Label>Donation Type</Label>
						<div className="mt-1 flex flex-wrap gap-2">
							{(["skip", "ai", "lead"] as const).map((type) => (
								<Button
									type="button"
									key={type}
									variant={donationType === type ? "default" : "outline"}
									size="sm"
									onClick={() => setDonationType(type)}
									aria-pressed={donationType === type}
								>
									{type}
								</Button>
							))}
							{donationType && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setDonationType("")}
									title="Clear type"
								>
									Clear
								</Button>
							)}
						</div>
					</div>
					<div>
						<Label htmlFor={`donation-amount-${player.id}`}>Amount</Label>
						<Input
							id={`donation-amount-${player.id}`}
							type="number"
							inputMode="numeric"
							min={1}
							placeholder="Enter amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor={`donation-note-${player.id}`}>
							Message (optional)
						</Label>
						<Input
							id={`donation-note-${player.id}`}
							type="text"
							placeholder="Add a short note"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
					</div>
					<div className="flex justify-end">
						<Button type="button" size="sm" onClick={handleSubmit}>
							Submit
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
