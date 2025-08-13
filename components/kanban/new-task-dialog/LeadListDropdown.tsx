"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockLeadListData } from "@/constants/dashboard/leadList";

interface LeadListDropdownProps {
	selectedLeadListId: number | null;
	setSelectedLeadListId: (id: number) => void;
}

export function LeadListDropdown({
	selectedLeadListId,
	setSelectedLeadListId,
}: LeadListDropdownProps) {
	// Ensure we always operate on an array; mockLeadListData can be false when testing is off
	const lists = Array.isArray(mockLeadListData) ? mockLeadListData : [];

	const selectedList = lists.find(
		(l) => String(l.id) === String(selectedLeadListId),
	);

	return (
		<div className="mt-2 grid grid-cols-4 items-center gap-4">
			<label className="col-span-1 font-semibold" htmlFor="lead-list-select">
				Lead List
			</label>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="col-span-3"
						id="lead-list-select"
						aria-haspopup="listbox"
					>
						{selectedList ? selectedList.listName : "Select Lead List"}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{lists.map((list) => (
						<DropdownMenuItem
							key={list.id}
							onSelect={() => setSelectedLeadListId(Number(list.id))}
						>
							{list.listName}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
