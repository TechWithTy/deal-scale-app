"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDealRoomStore } from "@/lib/stores/dealRoom";
import { generateDealFromLead } from "@/lib/utils/dealGeneration";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ConvertLeadToDealDialogProps {
	isOpen: boolean;
	onClose: () => void;
	lead: LeadTypeGlobal;
	campaignId?: string;
	campaignName?: string;
}

export function ConvertLeadToDealDialog({
	isOpen,
	onClose,
	lead,
	campaignId,
	campaignName,
}: ConvertLeadToDealDialogProps) {
	const router = useRouter();
	const addDeal = useDealRoomStore((state) => state.addDeal);

	const [purchasePrice, setPurchasePrice] = useState(
		lead.propertyValue?.toString() || "",
	);

	const handleConvert = () => {
		if (!purchasePrice || Number(purchasePrice) <= 0) {
			toast.error("Please enter a valid purchase price");
			return;
		}

		const dealData = generateDealFromLead({
			lead,
			campaignId,
			campaignName,
			campaignType: "call", // Default, can be dynamic
			purchasePrice: Number(purchasePrice),
		});

		const dealId = addDeal(dealData);

		toast.success("Lead converted to deal!", {
			description: "Opening deal room...",
		});

		onClose();
		router.push(`/dashboard/deal-room/${dealId}`);
	};

	const fullName =
		`${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`.trim();
	const propertyAddress = lead.address1.fullStreetLine;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Convert Lead to Deal</DialogTitle>
					<DialogDescription>
						Create a deal room from this qualified lead
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="rounded-lg border bg-muted/50 p-3">
						<p className="mb-1 font-semibold text-sm">Lead Information</p>
						<p className="text-sm">{fullName}</p>
						<p className="text-muted-foreground text-xs">{propertyAddress}</p>
						<p className="text-muted-foreground text-xs">
							{lead.address1.city}, {lead.address1.state}
						</p>
					</div>

					{campaignName && (
						<div className="rounded-lg border bg-primary/5 p-3">
							<p className="mb-1 font-semibold text-sm">Source Campaign</p>
							<p className="text-sm">{campaignName}</p>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="price">Purchase Price *</Label>
						<Input
							id="price"
							type="number"
							value={purchasePrice}
							onChange={(e) => setPurchasePrice(e.target.value)}
							placeholder="Enter purchase price"
						/>
					</div>

					<div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
						<p className="text-sm">
							<span className="font-medium">Property Details:</span> {lead.bed}{" "}
							bed, {lead.bath} bath
							{lead.sqft > 0 && `, ${lead.sqft} sqft`}
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleConvert}>Convert to Deal</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
