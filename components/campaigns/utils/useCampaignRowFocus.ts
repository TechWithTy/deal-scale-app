"use client";

import * as React from "react";
import type { Row, Table } from "@tanstack/react-table";

type FocusStatus = "idle" | "found" | "not-found";

interface UseCampaignRowFocusProps<TData> {
	campaignId?: string | null;
	table: Pick<Table<TData>, "getRowModel" | "setRowSelection">;
	resolveRowId: (row: Row<TData>) => string | null | undefined;
	onRowFocused?: (row: Row<TData>) => void;
}

interface UseCampaignRowFocusResult {
	focusedRowId: string | null;
	status: FocusStatus;
}

export function useCampaignRowFocus<TData>(
	props: UseCampaignRowFocusProps<TData>,
): UseCampaignRowFocusResult {
	const { campaignId, table, resolveRowId, onRowFocused } = props;
	const [focusedRowId, setFocusedRowId] = React.useState<string | null>(null);
	const [status, setStatus] = React.useState<FocusStatus>("idle");

	React.useEffect(() => {
		const currentSelection = (table as any).getState?.().rowSelection as
			| Record<string, boolean>
			| undefined;

		if (!campaignId) {
			const hasAnySelected =
				currentSelection && Object.values(currentSelection).some(Boolean);
			if (hasAnySelected) {
				try {
					table.setRowSelection?.({});
				} catch (error) {
					console.warn(
						"Failed to reset row selection for campaign focus",
						error,
					);
				}
			}
			setFocusedRowId(null);
			setStatus("idle");
			return;
		}

		const rows = table.getRowModel().rows as Row<TData>[];
		const targetRow = rows.find((row) => resolveRowId(row) === campaignId);

		if (!targetRow) {
			setFocusedRowId(null);
			setStatus("not-found");
			return;
		}

		setFocusedRowId(campaignId);
		const desiredSelection: Record<string, boolean> = {
			[targetRow.id]: true,
		};
		const isSameSelection = (() => {
			const curr = currentSelection ?? {};
			const currKeys = Object.keys(curr);
			const desiredKeys = Object.keys(desiredSelection);
			if (currKeys.length !== desiredKeys.length) return false;
			return desiredKeys.every((k) => curr[k] === desiredSelection[k]);
		})();
		if (!isSameSelection) {
			try {
				table.setRowSelection?.(desiredSelection);
			} catch (error) {
				console.warn(
					"Failed to update row selection for campaign focus",
					error,
				);
			}
		}

		onRowFocused?.(targetRow);
		setStatus("found");
	}, [campaignId, table, resolveRowId, onRowFocused]);

	return { focusedRowId, status };
}
