import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import type { Row, Table } from "@tanstack/react-table";
import { act } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CallCampaign } from "@/types/_dashboard/campaign";
import { useCampaignRowFocus } from "@/components/campaigns/utils/useCampaignRowFocus";
import CampaignPage from "@/components/campaigns/campaignPage";
import { useCampaignStore } from "@/lib/stores/campaigns";
import { createLaunchCampaign } from "./helpers/campaignFactories";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
        useRouter: () => ({
                push: pushMock,
        }),
        usePathname: () => "/dashboard/campaigns",
        useSearchParams: () => new URLSearchParams() as unknown as ReadonlyURLSearchParams,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/skipTrace/SkipTraceModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("lottie-react", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/campaigns/modal/CampaignModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/social-campaigns-demo-table", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/direct-mail-campaigns-demo-table", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("lottie-web", () => ({
        __esModule: true,
        default: {
                loadAnimation: vi.fn(() => ({ destroy: vi.fn() })),
        },
}));

vi.mock("lottie-web/build/player/lottie", () => ({
        __esModule: true,
        default: {
                loadAnimation: vi.fn(() => ({ destroy: vi.fn() })),
        },
        loadAnimation: vi.fn(() => ({ destroy: vi.fn() })),
}));

vi.mock("external/shadcn-table/src/examples/call-campaigns-demo-table", () => ({
        __esModule: true,
        default: createMockCampaignTable("call-table"),
}));

vi.mock("external/shadcn-table/src/examples/text-campaigns-demo-table", () => ({
        __esModule: true,
        default: createMockCampaignTable("text-table"),
}));

vi.mock("external/shadcn-table/src/nuqs-shared", () => ({
        __esModule: true,
        NuqsAdapter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/access/FeatureGuard", () => ({
        __esModule: true,
        FeatureGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

Object.defineProperty(window.HTMLCanvasElement.prototype, "getContext", {
        value: vi.fn(() => ({
                fillRect: vi.fn(),
                clearRect: vi.fn(),
                getImageData: vi.fn(() => ({ data: [] })),
                putImageData: vi.fn(),
                createImageData: vi.fn(() => []),
                setTransform: vi.fn(),
                drawImage: vi.fn(),
                save: vi.fn(),
                fillText: vi.fn(),
                restore: vi.fn(),
                beginPath: vi.fn(),
                closePath: vi.fn(),
                stroke: vi.fn(),
                translate: vi.fn(),
                scale: vi.fn(),
                rotate: vi.fn(),
                arc: vi.fn(),
                fill: vi.fn(),
                measureText: vi.fn(() => ({ width: 0 })),
                transform: vi.fn(),
                rect: vi.fn(),
                clip: vi.fn(),
        })),
        configurable: true,
});

interface MockCampaignTableProps {
        campaignId?: string | null;
        initialCampaigns?: CallCampaign[];
        onCampaignSelect?: (id: string) => void;
}

function createMockCampaignTable(testId: string) {
        return function MockCampaignTable({
                campaignId,
                initialCampaigns = [],
                onCampaignSelect,
        }: MockCampaignTableProps) {
                const table = React.useMemo(
                        () => ({
                                getRowModel: () => ({
                                        rows: initialCampaigns.map((campaign, index) => ({
                                                id: `row-${index}`,
                                                original: campaign,
                                        })),
                                }),
                                setRowSelection: vi.fn(),
                        }),
                        [initialCampaigns],
                );

                const { focusedRowId, status } = useCampaignRowFocus<CallCampaign>({
                        campaignId: campaignId ?? null,
                        table: table as unknown as Table<CallCampaign>,
                        resolveRowId: (row: Row<CallCampaign>) => row.original.id,
                        onRowFocused: (row: Row<CallCampaign>) => {
                                onCampaignSelect?.(row.original.id);
                        },
                });

                return (
                        <div
                                data-focused-id={focusedRowId ?? ""}
                                data-status={status}
                                data-testid={testId}
                        >
                                {initialCampaigns.map((campaign) => (
                                        <div key={campaign.id} data-row-id={campaign.id}>
                                                {campaign.name}
                                        </div>
                                ))}
                        </div>
                );
        };
}

describe("Campaign tables integration", () => {
        beforeEach(() => {
                pushMock.mockClear();
                act(() => {
                        const store = useCampaignStore.getState();
                        if ("reset" in store && typeof store.reset === "function") {
                                store.reset();
                        }
                });
        });

        test("highlights a newly launched call campaign", async () => {
                const launchedId = "campaign-test";

                act(() => {
                        useCampaignStore.getState().registerLaunchedCampaign({
                                channel: "call",
                                campaign: createLaunchCampaign(launchedId),
                        });
                });

                render(
                        <CampaignPage
                                urlParams={{ type: "call", campaignId: launchedId }}
                        />,
                );

                const table = await screen.findByTestId("call-table");

                await waitFor(() => {
                        const row = table.querySelector(`[data-row-id="${launchedId}"]`);
                        expect(row).not.toBeNull();
                        expect(table.getAttribute("data-focused-id")).toBe(launchedId);
                        expect(table.getAttribute("data-status")).toBe("found");
                });

                expect(screen.queryByText(/campaign not found/i)).toBeNull();
        });

        test("highlights a newly launched text campaign", async () => {
                const launchedId = "text-campaign";

                act(() => {
                        useCampaignStore.getState().registerLaunchedCampaign({
                                channel: "text",
                                campaign: createLaunchCampaign(launchedId),
                        });
                });

                render(
                        <CampaignPage
                                urlParams={{ type: "text", campaignId: launchedId }}
                        />,
                );

                const table = await screen.findByTestId("text-table");

                await waitFor(() => {
                        const row = table.querySelector(`[data-row-id="${launchedId}"]`);
                        expect(row).not.toBeNull();
                        expect(table.getAttribute("data-focused-id")).toBe(launchedId);
                        expect(table.getAttribute("data-status")).toBe("found");
                });

                expect(screen.queryByText(/campaign not found/i)).toBeNull();
        });
});
