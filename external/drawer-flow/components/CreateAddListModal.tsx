"use client";
import React, { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";
import type { ListService } from "../types";

interface CreateAddListModalProps {
	listService: ListService;
}

export const CreateAddListModal: React.FC<CreateAddListModalProps> = ({
	listService,
}) => {
	const { modal, closeModal, setModalPending, selectedIds, items, listNames } =
		useDrawerFlowStore();
	const [listName, setListName] = useState("");
	const [selectedList, setSelectedList] = useState<string>("");

	const selectedItems = useMemo(
		() => items.filter((i) => selectedIds.includes(i.id)),
		[items, selectedIds],
	);

	const onConfirm = async () => {
		if (selectedItems.length === 0) return;
		setModalPending(true);
		try {
			if (modal.mode === "create") {
				const name = listName.trim();
				if (!name) return;
				await listService.createList(name, selectedItems);
			} else {
				const id = selectedList.trim();
				if (!id) return;
				await listService.addToList(id, selectedItems);
			}
			closeModal();
			setListName("");
			setSelectedList("");
		} finally {
			setModalPending(false);
		}
	};

	return (
		<Dialog open={modal.open} onOpenChange={(o) => !o && closeModal()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{modal.mode === "create"
							? "Create New List"
							: "Add to Existing List"}
					</DialogTitle>
				</DialogHeader>

				{modal.mode === "create" ? (
					<div className="space-y-2">
						<label htmlFor="df-list-name" className="text-sm">
							List name
						</label>
						<Input
							id="df-list-name"
							placeholder="e.g., Phoenix Absentee Owners"
							value={listName}
							onChange={(e) => setListName(e.target.value)}
						/>
					</div>
				) : (
					<div className="space-y-2">
						<label htmlFor="df-list-select" className="text-sm">
							Select a list
						</label>
						<select
							id="df-list-select"
							value={selectedList}
							onChange={(e) => setSelectedList(e.target.value)}
							className="w-full rounded border border-border bg-background px-2 py-2"
						>
							<option value="" disabled>
								Select list
							</option>
							{listNames.map((name) => (
								<option key={name} value={name}>
									{name}
								</option>
							))}
						</select>
					</div>
				)}

				<div className="text-muted-foreground text-sm">
					{selectedItems.length} item(s) selected
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => closeModal()}
						disabled={modal.pending}
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						disabled={
							modal.pending ||
							(modal.mode === "create"
								? listName.trim().length === 0
								: selectedList.trim().length === 0)
						}
					>
						{modal.pending
							? "Working..."
							: modal.mode === "create"
								? "Create List"
								: "Add to List"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
