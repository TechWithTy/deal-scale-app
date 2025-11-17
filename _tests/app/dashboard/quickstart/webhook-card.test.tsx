import React from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import { useModalStore } from "@/lib/stores/dashboard";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

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

const routerPushMock = vi.fn();

vi.mock("next/navigation", () => ({
        __esModule: true,
        useRouter: () => ({ push: routerPushMock }),
}));

describe("QuickStartPage webhook setup card", () => {
        beforeEach(() => {
                act(() => {
                        useCampaignCreationStore.getState().reset();
                        useQuickStartWizardStore.getState().reset();
                        useQuickStartWizardDataStore.getState().reset();
                        useModalStore.setState({
                                isWebhookModalOpen: false,
                                webhookModalDirection: "incoming",
                                openWebhookModal: useModalStore.getState().openWebhookModal,
                        } as any);
                });
                routerPushMock.mockReset();
        });

        afterEach(async () => {
                // Close any open wizards
                act(() => {
                        useQuickStartWizardStore.getState().reset();
                });
                // Wait for any pending React updates
                await act(async () => {
                        await new Promise((resolve) => setTimeout(resolve, 0));
                });
                cleanup();
        });

        it("renders a card for webhook and feed setup", () => {
                renderWithNuqs(<QuickStartPage />);

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

        it("defers incoming webhook setup until the plan is confirmed", async () => {
                const openWebhookModalMock = vi.fn();

                act(() => {
                        useModalStore.setState({
                                openWebhookModal: openWebhookModalMock,
                        } as any);
                });

                renderWithNuqs(<QuickStartPage />);

                const [incomingQuickAction] = screen.getAllByRole("button", {
                        name: /setup incoming/i,
                });

                act(() => {
                        fireEvent.click(incomingQuickAction);
                });
                expect(openWebhookModalMock).not.toHaveBeenCalled();

                await waitFor(() => {
                        const wizards = screen.queryAllByTestId("quickstart-wizard");
                        expect(wizards.length).toBeGreaterThan(0);
                });
                // Get the first (most recent) wizard instance
                const wizards = screen.getAllByTestId("quickstart-wizard");
                const wizard = wizards[wizards.length - 1];
                let wizardQueries = within(wizard);

                const completeButton = wizardQueries.getByRole("button", {
                        name: /close & start plan/i,
                });

                act(() => {
                        fireEvent.click(completeButton);
                });

                expect(openWebhookModalMock).toHaveBeenCalledWith("incoming");
        });
});
