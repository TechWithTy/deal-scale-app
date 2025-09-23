"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";
import type { DrawerItem } from "../types";

interface ControlsBarProps {
	listSizeCalc?: (items: DrawerItem[]) => { label: string; progress: number };
	onCreateList: () => void;
	onAddToList: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
	listSizeCalc,
	onCreateList,
	onAddToList,
}) => {
	const {
		items,
		searchTerm,
		setSearch,
		selectedIds,
		selectAll,
		clearSelected,
	} = useDrawerFlowStore();

	const filteredItems = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		if (!q) return items;
		return items.filter(
			(it) =>
				it.display.title.toLowerCase().includes(q) ||
				(it.display.subtitle?.toLowerCase().includes(q) ?? false),
		);
	}, [items, searchTerm]);

	const listMeta = useMemo(() => {
		if (listSizeCalc) return listSizeCalc(filteredItems);
		// default: simple proportional bar
		const count = filteredItems.length;
		const progress = Math.max(
			0,
			Math.min(100, Math.round((count / 1000) * 100)),
		);
		return { label: `${count} items`, progress };
	}, [filteredItems, listSizeCalc]);

	const filteredIds = filteredItems.map((i) => i.id);
	const allSelected =
		selectedIds.length > 0 &&
		filteredIds.every((id) => selectedIds.includes(id));

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="space-y-2">
				<h3 className="font-semibold text-lg">List Size ({listMeta.label})</h3>
				<div className="flex items-center gap-4">
					<span>Specific</span>
					<Progress value={listMeta.progress} className="flex-1" />
					<span>Broad</span>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
				<input
					type="text"
					placeholder="Search..."
					value={searchTerm}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full max-w-xs rounded-md border border-border bg-background px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>

				<div className="flex items-center gap-2">
					{selectedIds.length > 0 ? (
						<Button
							variant="secondary"
							onClick={clearSelected}
							aria-label="Clear selected"
						>
							Clear Selected
						</Button>
					) : (
						<Button
							variant="outline"
							onClick={() => selectAll(filteredIds)}
							disabled={filteredIds.length === 0}
							aria-label="Select all"
						>
							Select All
						</Button>
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={onCreateList}
						disabled={selectedIds.length === 0}
						aria-disabled={selectedIds.length === 0}
						className={
							selectedIds.length === 0 ? "opacity-60 cursor-not-allowed" : ""
						}
					>
						Create List
						{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
					</Button>
					<Button
						variant="secondary"
						onClick={onAddToList}
						disabled={selectedIds.length === 0}
						aria-disabled={selectedIds.length === 0}
						className={
							selectedIds.length === 0 ? "opacity-60 cursor-not-allowed" : ""
						}
					>
						Add to List
					</Button>
				</div>
			</div>
		</div>
	);
};
