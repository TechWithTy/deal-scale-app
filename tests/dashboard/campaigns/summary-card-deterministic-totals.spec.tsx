import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { Column, Table } from "@tanstack/react-table";
import { describe, expect, test, vi } from "vitest";

import type { CallCampaign } from "@/types/_dashboard/campaign";

const SUMMARY_CARD_MODULE =
        "external/shadcn-table/src/examples/Phone/call/components/SummaryCard";
const CALL_CAMPAIGN_MODULE = "@/constants/_faker/calls/callCampaign";

const configureSummaryCardMocks = () => {
        vi.doMock("external/shadcn-table/src/components/ui/badge", () => ({
                __esModule: true,
                Badge: ({ children }: { children?: React.ReactNode }) => (
                        <span data-testid="mock-badge">{children}</span>
                ),
        }));

        vi.doMock(
                "external/shadcn-table/src/components/data-table/data-table-date-filter",
                () => ({
                        __esModule: true,
                        DataTableDateFilter: function MockDataTableDateFilter() {
                                return <div data-testid="date-filter" />;
                        },
                }),
        );
};

const loadSummaryCard = async () => {
        configureSummaryCardMocks();
        const module = await import(SUMMARY_CARD_MODULE);
        return module.SummaryCard;
};

function createTable({
        rows,
        columns = [],
        onGetColumn,
}: {
        rows: CallCampaign[];
        columns?: Column<CallCampaign, unknown>[];
        onGetColumn?: (id: string) => never;
}) {
        return {
                getFilteredRowModel: () => ({
                        rows: rows.map((original) => ({ original })),
                }),
                getColumn:
                        onGetColumn ??
                        ((id: string) =>
                                columns.find((column) => column.id === id) as Column<
                                        CallCampaign,
                                        unknown
                                >),
                getAllColumns: () => columns,
                getAllLeafColumns: () => columns,
        } as unknown as Table<CallCampaign>;
}

const extractTotals = (primaryLabel: string) => {
        const rowsLabel = screen.getByText("Rows");
        const metricsGrid = rowsLabel.parentElement?.parentElement as
                | HTMLElement
                | null;

        if (!metricsGrid) {
                throw new Error("Unable to locate metrics grid");
        }

        const scope = within(metricsGrid);
        const parseValue = (label: string) => {
                const labelNode = scope.getByText(label);
                const valueNode = labelNode.nextElementSibling as HTMLElement | null;
                if (!valueNode) {
                        throw new Error(`Missing value node for label: ${label}`);
                }
                return Number.parseInt(valueNode.textContent ?? "0", 10);
        };

        return {
                rows: parseValue("Rows"),
                primary: parseValue(primaryLabel),
                leads: parseValue("Leads"),
                queued: parseValue("Queued"),
        };
};

describe("SummaryCard deterministic totals", () => {
        test(
                "summary totals remain stable across module reloads and time shifts",
                async () => {
                        vi.useFakeTimers();

                        const captureTotals = async (time: Date) => {
                                vi.resetModules();
                                vi.unstubAllEnvs();
                                vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");
                                vi.setSystemTime(time);

                                const SummaryCard = await loadSummaryCard();
                                const { fallbackCallCampaignData } = await import(
                                        CALL_CAMPAIGN_MODULE,
                                );

                                const table = createTable({
                                        rows: fallbackCallCampaignData.slice(0, 12),
                                });

                                render(
                                        <SummaryCard
                                                table={table}
                                                campaignType="Calls"
                                                dateChip="today"
                                                setDateChip={() => {
                                                        /* noop */
                                                }}
                                        />,
                                );

                                const totals = extractTotals("Calls");
                                cleanup();
                                return totals;
                        };

                        try {
                                const first = await captureTotals(
                                        new Date("2020-01-01T00:00:00.000Z"),
                                );
                                const second = await captureTotals(
                                        new Date("2035-12-31T23:59:59.000Z"),
                                );

                                expect(second).toStrictEqual(first);
                        } finally {
                                cleanup();
                                vi.useRealTimers();
                                vi.unstubAllEnvs();
                        }
                },
                20000,
        );
});
