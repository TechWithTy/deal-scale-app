"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type {
	Property,
	RealtorProperty,
	RentCastProperty,
} from "@/types/_dashboard/property";
import type { LeadList } from "@/types/_dashboard/leadList";

// * Correct Type Guards for Property union type
const isRealtorProperty = (p: Property): p is RealtorProperty =>
	"property_id" in p;
const isRentCastProperty = (p: Property): p is RentCastProperty =>
	"id" in p && !("property_id" in p);

function propertyToLead(property: Property): LeadTypeGlobal {
	const details = property.details;

	let id: string;
	let summary: string;

	if (isRealtorProperty(property)) {
		id = property.property_id;
		summary =
			property.description ?? `Property at ${property.address.fullStreetLine}`;
	} else if (isRentCastProperty(property)) {
		id = property.id;
		summary = `Property at ${property.address.fullStreetLine}`;
	} else {
		// This should be unreachable if all property types are handled
		throw new Error("Unknown property type encountered.");
	}

	return {
		id,
		contactInfo: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			address: property.address.fullStreetLine,
			domain: "",
			social: "",
		},
		summary,
		bed: details.beds ?? 0,
		bath: details.fullBaths ?? 0,
		sqft: details.sqft ?? 0,
		status: "New Lead",
		followUp: null,
		lastUpdate: new Date().toISOString(),
		address1: property.address,
		// campaignID and socials are optional
	};
}

interface SaveToListModalProps {
	isOpen: boolean;
	onClose: () => void;
	property: Property;
	onSave: () => void;
}

export function SaveToListModal({
	isOpen,
	onClose,
	property,
	onSave,
}: SaveToListModalProps) {
	const { toast } = useToast();
	const { addLeadList, addLeadToList } = useUserProfileStore();
	const leadLists = useUserProfileStore(
		(state) => state.userProfile?.companyInfo?.leadLists || [],
	);

	const [newListName, setNewListName] = useState("");
	const [selectedListId, setSelectedListId] = useState<string | null>(null);

	// * This effect ensures the dropdown is populated and a default is selected
	useEffect(() => {
		if (isOpen && leadLists.length > 0 && !selectedListId) {
			setSelectedListId(leadLists[0].id);
		}
	}, [isOpen, leadLists, selectedListId]);

	const handleCreateList = () => {
		if (newListName.trim() !== "") {
			const newList: LeadList = {
				id: uuidv4(),
				listName: newListName.trim(),
				uploadDate: new Date().toISOString(),
				leads: [],
				records: 0,
				phone: 0,
				dataLink: "",
				socials: {},
				emails: 0,
			};
			const newListId = addLeadList(newList);
			setSelectedListId(newListId);
			setNewListName("");
			toast({
				title: "Success",
				description: `List "${newList.listName}" created.`,
			});
		}
	};

	const handleSave = () => {
		if (selectedListId) {
			const lead = propertyToLead(property);
			addLeadToList(selectedListId, lead);
			const listName = leadLists.find(
				(list) => list.id === selectedListId,
			)?.listName;
			toast({
				title: "Success",
				description: `Property saved to "${listName || "list"}"`,
			});
			onSave(); // Notify parent
			onClose();
		} else {
			toast({
				title: "Error",
				description: "Please select a list first.",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Save to List</DialogTitle>
					<DialogDescription>
						Add this property to an existing list or create a new one.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div>
						<h3 className="mb-2 font-medium text-sm">Create a New List</h3>
						<div className="flex gap-2">
							<Input
								placeholder="e.g., 'Hot Leads'"
								value={newListName}
								onChange={(e) => setNewListName(e.target.value)}
							/>
							<Button onClick={handleCreateList}>Create</Button>
						</div>
					</div>
					<div>
						<h3 className="mb-2 font-medium text-sm">
							Or Add to an Existing List
						</h3>
						<Select
							value={selectedListId ?? ""}
							onValueChange={(value) => setSelectedListId(value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a list" />
							</SelectTrigger>
							<SelectContent>
								{leadLists.length > 0 ? (
									leadLists.map((list) => (
										<SelectItem key={list.id} value={list.id}>
											{list.listName}
										</SelectItem>
									))
								) : (
									<div className="px-2 py-1.5 text-muted-foreground text-sm">
										No lists found. Create one above.
									</div>
								)}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="mt-4 flex justify-end">
					<Button onClick={handleSave} disabled={!selectedListId}>
						Save
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
