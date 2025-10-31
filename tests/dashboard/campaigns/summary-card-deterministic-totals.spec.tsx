import React from "react";
import { render, screen, within } from "@testing-library/react";
import type { Table } from "@tanstack/react-table";
import { describe, expect, test, vi } from "vitest";

import { SummaryCard } from "external/shadcn-table/src/examples/Phone/call/components/SummaryCard";
import { fallbackCallCampaignData } from "@/constants/_faker/calls/callCampaign";
import type { CallCampaign } from "@/types/_dashboard/campaign";

vi.mock(
        "external/shadcn-table/src/components/data-table/data-table-date-filter",
        () => ({
                DataTableDateFilter: () => null,
        }),
);

vi.mock("external/shadcn-table/src/components/ui/badge", () => ({
        Badge: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("external/shadcn-table/src/components/ui/button", () => ({
        Button: ({
                children,
                onClick,
                type = "button",
        }: {
                children: React.ReactNode;
                onClick?: () => void;
                type?: "button" | "submit" | "reset";
        }) => (
                <button type={type} onClick={onClick}>
                        {children}
                </button>
        ),
}));

const createStubTable = (campaigns: CallCampaign[]): Table<CallCampaign> =>
        ({
                getFilteredRowModel: () => ({
                        rows: campaigns.map((campaign, index) => ({
                                id: `row-${index}`,
                                original: campaign,
                        })),
                }),
                getAllLeafColumns: () => [{ id: "startDate" }],
                getAllColumns: () => [{ id: "startDate" }],
        }) as unknown as Table<CallCampaign>;

const totals = fallbackCallCampaignData.reduce(
        (acc, campaign) => {
                acc.calls += campaign.calls ?? 0;
                acc.leads += campaign.leads ?? 0;
                acc.inQueue += campaign.inQueue ?? 0;
                return acc;
        },
        { calls: 0, leads: 0, inQueue: 0 },
);

describe("call summary card totals", () => {
        test("remain stable under significant system time shifts", () => {
                vi.useFakeTimers({ shouldAdvanceTime: false });

                const assertMetrics = () => {
                        const findMetricCard = (label: string): HTMLDivElement | null => {
                                const nodes = screen.getAllByText(label, {
                                        selector: "div.text-muted-foreground.text-xs",
                                });
                                const labelNode = nodes[0];
                                expect(labelNode).toBeTruthy();
                                return labelNode?.parentElement as HTMLDivElement | null;
                        };

                        const rowsCard = findMetricCard("Rows");
                        expect(rowsCard).not.toBeNull();
                        const rowsValue = within(rowsCard as HTMLDivElement).getByText(
                                String(fallbackCallCampaignData.length),
                        );
                        expect(rowsValue).toBeTruthy();

                        const callsCard = findMetricCard("Calls");
                        expect(callsCard).not.toBeNull();
                        const callsValue = within(callsCard as HTMLDivElement).getByText(
                                String(totals.calls),
                        );
                        expect(callsValue).toBeTruthy();

                        const leadsCard = findMetricCard("Leads");
                        expect(leadsCard).not.toBeNull();
                        const leadsValue = within(leadsCard as HTMLDivElement).getByText(
                                String(totals.leads),
                        );
                        expect(leadsValue).toBeTruthy();

                        const queueCard = findMetricCard("Queued");
                        expect(queueCard).not.toBeNull();
                        const queueValue = within(queueCard as HTMLDivElement).getByText(
                                String(totals.inQueue),
                        );
                        expect(queueValue).toBeTruthy();
                };

                try {
                        vi.setSystemTime(new Date("2040-07-04T12:00:00.000Z"));

                        const { rerender, unmount } = render(
                                <SummaryCard
                                        table={createStubTable(
                                                fallbackCallCampaignData.map((campaign) => ({
                                                        ...campaign,
                                                })),
                                        )}
                                        campaignType="Calls"
                                        dateChip="today"
                                        setDateChip={() => undefined}
                                />,
                        );

                        assertMetrics();

                        vi.setSystemTime(new Date("1990-03-01T12:00:00.000Z"));

                        rerender(
                                <SummaryCard
                                        table={createStubTable(
                                                fallbackCallCampaignData.map((campaign) => ({
                                                        ...campaign,
                                                })),
                                        )}
                                        campaignType="Calls"
                                        dateChip="today"
                                        setDateChip={() => undefined}
                                />,
                        );

                        assertMetrics();

                        unmount();
                } finally {
                        vi.useRealTimers();
                }
        });
});
