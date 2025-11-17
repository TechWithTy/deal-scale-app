import React from "react";
import {
        act,
        cleanup,
        fireEvent,
        render,
        screen,
        waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import CampaignPage from "@/components/campaigns/campaignPage";
import { useCampaignRowFocus } from "@/components/campaigns/utils/useCampaignRowFocus";
import { useCampaignStore } from "@/lib/stores/campaigns";
import type { createLaunchCampaign } from "@/tests/dashboard/campaigns/helpers/campaignFactories";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
const routerPushMock = vi.fn();
const LAUNCHED_CAMPAIGN_ID = "campaign-launch-integration";
const LAUNCHED_CHANNEL = "call";

vi.mock("next/navigation", () => ({
        useRouter: () => ({
                push: routerPushMock,
        }),
        usePathname: () => "/dashboard/campaigns",
        useSearchParams: () => new URLSearchParams() as unknown as ReadonlyURLSearchParams,
}));

vi.mock("@/components/quickstart/QuickStartHeader", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartBadgeList", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartHelp", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/quickstart/QuickStartActionsGrid", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadBulkSuiteModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/quickstart/useQuickStartCards", () => ({
        useQuickStartCards: () => [],
}));

vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/savedSearch/SavedSearchModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/campaign/CampaignModalMain", async () => {
        const React = await import("react");
        const { useCampaignStore } = await import("@/lib/stores/campaigns");
        const {
                createLaunchCampaign,
        } = await import("@/tests/dashboard/campaigns/helpers/campaignFactories");

        return {
                __esModule: true,
                default: ({
                        onOpenChange,
                        onCampaignLaunched,
                }: {
                        onOpenChange: (open: boolean) => void;
                        onCampaignLaunched?: (payload: {
                                campaignId: string;
                                channelType: string;
                        }) => void;
                }) => {
                        const handleLaunch = () => {
                                onOpenChange?.(true);
                                const store = useCampaignStore.getState();
                                store.registerLaunchedCampaign({
                                        channel: "call",
                                        campaign: createLaunchCampaign(LAUNCHED_CAMPAIGN_ID),
                                });
                                onCampaignLaunched?.({
                                        campaignId: LAUNCHED_CAMPAIGN_ID,
                                        channelType: LAUNCHED_CHANNEL,
                                });
                                onOpenChange?.(false);
                        };

                        return (
                                <div data-testid="campaign-modal-mock">
                                        <button
                                                type="button"
                                                data-testid="campaign-launch-trigger"
                                                onClick={handleLaunch}
                                        >
                                                Launch Campaign
                                        </button>
                                </div>
                        );
                },
        };
});

vi.mock("external/shadcn-table/src/examples/campaigns/modal/CampaignModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/direct-mail-campaigns-demo-table", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/social-campaigns-demo-table", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/text-campaigns-demo-table", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("external/shadcn-table/src/examples/call-campaigns-demo-table", () => ({
        __esModule: true,
        default: createMockCampaignTable("call-table"),
}));

vi.mock("external/shadcn-table/src/nuqs-shared", () => ({
        __esModule: true,
        NuqsAdapter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/access/FeatureGuard", () => ({
        __esModule: true,
        FeatureGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function createMockCampaignTable(testId: string) {
        return function MockCampaignTable({
                campaignId,
                initialCampaigns = [],
        }: {
                campaignId?: string | null;
                initialCampaigns?: ReturnType<typeof createLaunchCampaign>[];
        }) {
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

                const { focusedRowId, status } = useCampaignRowFocus({
                        campaignId: campaignId ?? null,
                        table: table as never,
                        resolveRowId: (row: { original: { id: string } }) => row.original.id,
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

describe("QuickStart campaign launch flow", () => {
        beforeEach(() => {
                routerPushMock.mockReset();
                act(() => {
                        useCampaignStore.getState().reset();
                });
        });

        afterEach(() => {
                cleanup();
        });

        it("redirects to campaigns and focuses launched record", async () => {
                const { getByTestId, unmount } = renderWithNuqs(<QuickStartPage />);

                await waitFor(() => {
                        expect(getByTestId("campaign-launch-trigger")).toBeInTheDocument();
                });

                act(() => {
                        fireEvent.click(getByTestId("campaign-launch-trigger"));
                });

                expect(routerPushMock).toHaveBeenCalledWith(
                        `/dashboard/campaigns?campaignId=${LAUNCHED_CAMPAIGN_ID}&type=${LAUNCHED_CHANNEL}`,
                );

                const campaigns = useCampaignStore.getState().campaignsByType.call;
                expect(campaigns.some((campaign) => campaign.id === LAUNCHED_CAMPAIGN_ID)).toBe(
                        true,
                );

                unmount();

                render(
                        <CampaignPage
                                urlParams={{ type: LAUNCHED_CHANNEL, campaignId: LAUNCHED_CAMPAIGN_ID }}
                        />,
                );

                const table = await screen.findByTestId("call-table");

                await waitFor(() => {
                        expect(table.getAttribute("data-focused-id")).toBe(LAUNCHED_CAMPAIGN_ID);
                        expect(table.getAttribute("data-status")).toBe("found");
                        const focusedRow = table.querySelector(
                                `[data-row-id="${LAUNCHED_CAMPAIGN_ID}"]`,
                        );
                        expect(focusedRow).not.toBeNull();
                });
        });
});

