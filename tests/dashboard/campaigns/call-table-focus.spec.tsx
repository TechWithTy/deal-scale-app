import React from "react";
import { renderHook } from "@testing-library/react";
import type { Row, Table } from "@tanstack/react-table";
import { describe, expect, test, vi } from "vitest";

import type { CallCampaign } from "@/types/_dashboard/campaign";
import { useCampaignRowFocus } from "@/components/campaigns/utils/useCampaignRowFocus";

const buildRow = (rowId: string, campaignId: string): Row<CallCampaign> => {
        const campaign: CallCampaign = {
                id: campaignId,
                name: campaignId,
                status: "queued",
                startDate: new Date().toISOString(),
                callInformation: [],
                callerNumber: "+1-555-000-0000",
                receiverNumber: "+1-555-000-0001",
                duration: 0,
                callType: "inbound",
                calls: 0,
                inQueue: 0,
                leads: 0,
                voicemail: 0,
                hungUp: 0,
                dead: 0,
                wrongNumber: 0,
                inactiveNumbers: 0,
                dnc: 0,
                endedReason: [],
        };

        return {
                id: rowId,
                index: Number(rowId.replace("row-", "")),
                original: campaign,
        } as unknown as Row<CallCampaign>;
};

describe("useCampaignRowFocus", () => {
        test("selects and focuses a matching row", () => {
                const rows = [
                        buildRow("row-0", "campaign-alpha"),
                        buildRow("row-1", "campaign-beta"),
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
                const rows = [buildRow("row-0", "campaign-alpha")];

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
