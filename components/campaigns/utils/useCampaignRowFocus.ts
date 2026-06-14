"use client";

import type { Row, Table } from "@tanstack/react-table";
import * as React from "react";

type FocusStatus = "idle" | "found" | "not-found";

interface UseCampaignRowFocusProps<TData> {
	campaignId?: string | null;
	table: Pick<Table<TData>, "getRowModel" | "getState" | "setRowSelection">;
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
	const lastFocusedCampaignId = React.useRef<string | null>(null);

	React.useEffect(() => {
		const currentSelection = table.getState().rowSelection as
			| Record<string, boolean>
			| undefined;

		if (!campaignId) {
			if (Object.keys(currentSelection ?? {}).length > 0) {
				try {
					table.setRowSelection?.({});
				} catch (error) {
					console.warn(
						"Failed to reset row selection for campaign focus",
						error,
					);
				}
			}
			lastFocusedCampaignId.current = null;
			setFocusedRowId((current) => (current === null ? current : null));
			setStatus((current) => (current === "idle" ? current : "idle"));
			return;
		}

		const rows = table.getRowModel().rows as Row<TData>[];
		const targetRow = rows.find((row) => resolveRowId(row) === campaignId);

		if (!targetRow) {
			lastFocusedCampaignId.current = null;
			setFocusedRowId((current) => (current === null ? current : null));
			setStatus((current) => (current === "not-found" ? current : "not-found"));
			return;
		}

		setFocusedRowId((current) =>
			current === campaignId ? current : campaignId,
		);
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

		if (lastFocusedCampaignId.current !== campaignId) {
			lastFocusedCampaignId.current = campaignId;
			onRowFocused?.(targetRow);
		}
		setStatus((current) => (current === "found" ? current : "found"));
	}, [campaignId, table, resolveRowId, onRowFocused]);

	return { focusedRowId, status };
}
