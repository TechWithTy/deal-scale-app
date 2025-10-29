import React from "react";
import { render, screen } from "@testing-library/react";
import type { Table } from "@tanstack/react-table";
import { describe, expect, test, vi } from "vitest";

import type { CallCampaign } from "@/types/_dashboard/campaign";

vi.mock("external/shadcn-table/src/components/ui/badge", () => ({
        __esModule: true,
        Badge: ({ children }: { children?: React.ReactNode }) => (
                <span data-testid="mock-badge">{children}</span>
        ),
}));

vi.mock(
        "external/shadcn-table/src/components/data-table/data-table-date-filter",
        () => ({
                __esModule: true,
                DataTableDateFilter: function MockDataTableDateFilter() {
                        return <div data-testid="date-filter" />;
                },
        }),
);

// Load SummaryCard after mocks so it uses simplified dependencies in tests.
const { SummaryCard } = await import(
        "external/shadcn-table/src/examples/Phone/call/components/SummaryCard"
);

function createTable(rows: CallCampaign[], onGetColumn: () => never) {
        return {
                getFilteredRowModel: () => ({
                        rows: rows.map((original) => ({ original })),
                }),
                getColumn: onGetColumn,
                getAllColumns: () => [],
        } as unknown as Table<CallCampaign>;
}

describe("SummaryCard", () => {
        test("does not try to access missing startDate column", () => {
                const getColumn = vi.fn(() => {
                        throw new Error("startDate should not be requested");
                });

                const table = createTable(
                        [
                                {
                                        id: "1",
                                        name: "Sample Campaign",
                                        status: "queued",
                                        calls: 10,
                                        leads: 2,
                                        inQueue: 5,
                                } as CallCampaign,
                        ],
                        getColumn,
                );

                expect(() =>
                        render(
                                <SummaryCard
                                        table={table}
                                        campaignType="Calls"
                                        dateChip="today"
                                        setDateChip={() => {
                                                /* noop */
                                        }}
                                />,
                        ),
                ).not.toThrow();

                expect(getColumn).not.toHaveBeenCalled();
                expect(screen.getByText("Rows")).toBeDefined();
                expect(screen.queryByTestId("date-filter")).toBeNull();
        });
});
