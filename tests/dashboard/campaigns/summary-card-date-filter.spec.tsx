import React from "react";
import { render, screen } from "@testing-library/react";
import type { Column, Table } from "@tanstack/react-table";
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

describe("SummaryCard", () => {
        test("does not try to access missing startDate column", () => {
                const getColumn = vi.fn(() => {
                        throw new Error("startDate should not be requested");
                });

                const table = createTable({
                        rows: [
                                {
                                        id: "1",
                                        name: "Sample Campaign",
                                        status: "queued",
                                        calls: 10,
                                        leads: 2,
                                        inQueue: 5,
                                } as CallCampaign,
                        ],
                        onGetColumn: getColumn,
                        columns: [],
                });

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

        test("renders date filter when startDate column is present", () => {
                const setFilterValue = vi.fn();
                const startDateColumn = {
                        id: "startDate",
                        getFilterValue: vi.fn(() => undefined),
                        setFilterValue,
                } as unknown as Column<CallCampaign, unknown>;

                const table = createTable({
                        rows: [
                                {
                                        id: "99",
                                        name: "Another Campaign",
                                        status: "queued",
                                        calls: 3,
                                        leads: 1,
                                        inQueue: 0,
                                } as CallCampaign,
                        ],
                        columns: [startDateColumn],
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

                expect(screen.getByTestId("date-filter")).toBeDefined();
        });
});
