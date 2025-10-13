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
		if (!campaignId) {
			try {
				table.setRowSelection?.({});
			} catch (error) {
				console.warn("Failed to reset row selection for campaign focus", error);
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
		try {
			table.setRowSelection?.({ [targetRow.id]: true });
		} catch (error) {
			console.warn("Failed to update row selection for campaign focus", error);
		}

		onRowFocused?.(targetRow);
		setStatus("found");
	}, [campaignId, table, resolveRowId, onRowFocused]);

	return { focusedRowId, status };
}
