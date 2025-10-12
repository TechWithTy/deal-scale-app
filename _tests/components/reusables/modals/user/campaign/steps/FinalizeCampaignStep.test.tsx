import React from "react";
import { render, screen } from "@testing-library/react";
import FinalizeCampaignStep from "@/components/reusables/modals/user/campaign/steps/FinalizeCampaignStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { describe, beforeEach, test, expect, vi } from "vitest";

describe("FinalizeCampaignStep", () => {
        beforeEach(() => {
                const { reset } = useCampaignCreationStore.getState();
                reset();
        });

        test("shows missing requirement notice when launch is disabled", () => {
                render(
                        <FinalizeCampaignStep
                                estimatedCredits={0}
                                onLaunch={vi.fn()}
                                onBack={vi.fn()}
                        />,
                );

                expect(
                        screen.getByText(/Complete the following before launching:/i),
                ).toBeTruthy();
                expect(
                        screen.getByText("Campaign name must be at least 5 characters."),
                ).toBeTruthy();
                expect(screen.getByText("Please select an agent.")).toBeTruthy();
                expect(screen.getByText("Please select a workflow.")).toBeTruthy();
                expect(screen.getByText("Please select a sales script.")).toBeTruthy();
                expect(
                        screen.getByText("Campaign goal must be at least 10 characters."),
                ).toBeTruthy();
                const launchButton = screen.getByRole("button", {
                        name: /launch campaign/i,
                }) as HTMLButtonElement;
                expect(launchButton).toBeTruthy();
                expect(launchButton.disabled).toBe(true);
        });
});
