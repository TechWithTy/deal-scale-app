import { renderHook } from "@testing-library/react";
import type { Row, Table } from "@tanstack/react-table";
import { describe, expect, test, vi } from "vitest";

import type { CallCampaign } from "@/types/_dashboard/campaign";
import { useCampaignRowFocus } from "@/components/campaigns/utils/useCampaignRowFocus";

import { buildCallCampaignRow } from "./helpers/campaignFactories";

describe("useCampaignRowFocus", () => {
        test("selects and focuses a matching row", () => {
                const rows = [
                        buildCallCampaignRow("row-0", "campaign-alpha"),
                        buildCallCampaignRow("row-1", "campaign-beta"),
                ];

                const setRowSelection = vi.fn();
                const onRowFocused = vi.fn();

                const table = {
                        getRowModel: () => ({ rows }),
                        setRowSelection,
                } as unknown as Table<CallCampaign>;

                const { result, rerender } = renderHook(
                        (props) => useCampaignRowFocus(props),
                        {
                                initialProps: {
                                        campaignId: "campaign-beta",
                                        table,
                                        resolveRowId: (row: Row<CallCampaign>) => row.original.id,
                                        onRowFocused,
                                },
                        },
                );

                expect(setRowSelection).toHaveBeenCalledWith({ "row-1": true });
                expect(onRowFocused).toHaveBeenCalledWith(rows[1]);
                expect(result.current.focusedRowId).toBe("campaign-beta");
                expect(result.current.status).toBe("found");

                rerender({
                        campaignId: undefined,
                        table,
                        resolveRowId: (row: Row<CallCampaign>) => row.original.id,
                        onRowFocused,
                });

                expect(setRowSelection).toHaveBeenCalledWith({});
                expect(result.current.status).toBe("idle");
        });

        test("reports not-found when campaign is missing", () => {
                const rows = [buildCallCampaignRow("row-0", "campaign-alpha")];

                const table = {
                        getRowModel: () => ({ rows }),
                        setRowSelection: vi.fn(),
                } as unknown as Table<CallCampaign>;

                const { result } = renderHook(() =>
                        useCampaignRowFocus({
                                campaignId: "missing",
                                table,
                                resolveRowId: (row: Row<CallCampaign>) => row.original.id,
                                onRowFocused: vi.fn(),
                        }),
                );

                expect(result.current.focusedRowId).toBeNull();
                expect(result.current.status).toBe("not-found");
        });
});
