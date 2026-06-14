import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCampaignRowFocus } from "@/components/campaigns/utils/useCampaignRowFocus";

function createTable(rowSelection: Record<string, boolean> = {}) {
	const setRowSelection = vi.fn();
	return {
		getState: () => ({ rowSelection }),
		getRowModel: () => ({ rows: [] }),
		setRowSelection,
	};
}

describe("useCampaignRowFocus", () => {
	it("does not reset row selection on every render when no campaign is selected", () => {
		const table = createTable();
		const resolveRowId = vi.fn();

		const { result, rerender } = renderHook(() =>
			useCampaignRowFocus({
				campaignId: null,
				table,
				resolveRowId,
			}),
		);

		rerender();
		rerender();

		expect(result.current).toEqual({ focusedRowId: null, status: "idle" });
		expect(table.setRowSelection).not.toHaveBeenCalled();
	});

	it("clears existing row selection once when campaign focus is removed", () => {
		const table = createTable({ rowA: true });
		const resolveRowId = vi.fn();

		renderHook(() =>
			useCampaignRowFocus({
				campaignId: null,
				table,
				resolveRowId,
			}),
		);

		expect(table.setRowSelection).toHaveBeenCalledTimes(1);
		expect(table.setRowSelection).toHaveBeenCalledWith({});
	});
});
