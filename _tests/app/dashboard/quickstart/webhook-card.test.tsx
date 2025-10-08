import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/quickstart/page";
import { useModalStore } from "@/lib/stores/dashboard";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadBulkSuiteModal", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/reusables/modals/user/campaign/CampaignModalMain", () => ({
        __esModule: true,
        default: () => null,
}));

vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
        __esModule: true,
        default: () => null,
}));

describe("QuickStartPage webhook setup card", () => {
        beforeEach(() => {
                act(() => {
                        useCampaignCreationStore.getState().reset();
                        useModalStore.setState({
                                isWebhookModalOpen: false,
                                webhookModalDirection: "incoming",
                                openWebhookModal: useModalStore.getState().openWebhookModal,
                        } as any);
                });
        });

        it("renders a card for webhook and feed setup", () => {
                render(<QuickStartPage />);

                expect(
                        screen.getByRole("heading", {
                                name: /webhooks & feeds/i,
                                level: 3,
                        }),
                ).toBeDefined();

                expect(
                        screen.getByText(/connect dealscale with your crm/i),
                ).toBeDefined();
        });

        it("opens the webhook modal with the requested direction when clicking quick actions", () => {
                const openWebhookModalMock = vi.fn();

                act(() => {
                        useModalStore.setState({
                                openWebhookModal: openWebhookModalMock,
                        } as any);
                });

                render(<QuickStartPage />);

                const [incomingQuickAction] = screen.getAllByRole("button", {
                        name: /configure incoming/i,
                });

                fireEvent.click(incomingQuickAction);
                expect(openWebhookModalMock).toHaveBeenCalledWith("incoming");

                const [outgoingQuickAction] = screen.getAllByRole("button", {
                        name: /configure outgoing/i,
                });

                fireEvent.click(outgoingQuickAction);
                expect(openWebhookModalMock).toHaveBeenLastCalledWith("outgoing");
        });
});
