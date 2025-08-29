"use client";

import type React from "react";

interface LeadListSelectStepProps {
	mode: "select" | "create";
	onModeChange: (mode: "select" | "create") => void;
	listName: string;
	onListNameChange: (name: string) => void;
	selectedListId: string;
	onSelectedListIdChange: (id: string) => void;
	existingLists?: Array<{ id: string; name: string }>; // optional
	errors?: Record<string, string>;
}

const LeadListSelectStep: React.FC<LeadListSelectStepProps> = ({
	mode,
	onModeChange,
	listName,
	onListNameChange,
	selectedListId,
	onSelectedListIdChange,
	existingLists = [],
	errors = {},
}) => {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="font-semibold text-lg">Choose Lead List</h2>
				<p className="text-muted-foreground text-sm">
					Add this lead to an existing list, or create a new one.
				</p>
			</div>

			<div className="flex gap-4">
				<label className="inline-flex items-center gap-2">
					<input
						type="radio"
						name="list-mode"
						className="h-4 w-4"
						checked={mode === "create"}
						onChange={() => onModeChange("create")}
					/>
					<span>Create new list</span>
				</label>
				<label className="inline-flex items-center gap-2">
					<input
						type="radio"
						name="list-mode"
						className="h-4 w-4"
						checked={mode === "select"}
						onChange={() => onModeChange("select")}
					/>
					<span>Select existing list</span>
				</label>
			</div>

			{mode === "create" ? (
				<div>
					<label htmlFor="newListName" className="block font-medium text-sm">
						New List Name
					</label>
					<input
						id="newListName"
						type="text"
						value={listName}
						onChange={(e) => onListNameChange(e.target.value)}
						placeholder="e.g., August - High Equity"
						className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
						aria-invalid={Boolean(errors.list)}
					/>
					{errors.list && (
						<p className="mt-1 text-destructive text-sm">{errors.list}</p>
					)}
				</div>
			) : (
				<div>
					<label htmlFor="existingList" className="block font-medium text-sm">
						Existing Lists
					</label>
					<select
						id="existingList"
						value={selectedListId}
						onChange={(e) => onSelectedListIdChange(e.target.value)}
						className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
						aria-invalid={Boolean(errors.list)}
					>
						<option value="">Select a list...</option>
						{existingLists.map((l) => (
							<option key={l.id} value={l.id}>
								{l.name}
							</option>
						))}
					</select>
					{errors.list && (
						<p className="mt-1 text-destructive text-sm">{errors.list}</p>
					)}
					{existingLists.length === 0 && (
						<p className="mt-1 text-muted-foreground text-xs">
							No lists found. You can create a new list instead.
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default LeadListSelectStep;
