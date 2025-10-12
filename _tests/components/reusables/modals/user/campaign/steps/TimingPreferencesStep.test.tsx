import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimingPreferencesStep } from "@/components/reusables/modals/user/campaign/steps/TimingPreferencesStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { describe, beforeEach, expect, test, vi } from "vitest";

describe("TimingPreferencesStep", () => {
        beforeEach(() => {
                useCampaignCreationStore.getState().reset();
        });

        test("prevents advancing when end date is missing", async () => {
                const onNext = vi.fn();

                render(<TimingPreferencesStep onBack={vi.fn()} onNext={onNext} />);

                const nextButtons = screen.getAllByRole("button", { name: /next/i });
                const nextButton = nextButtons[nextButtons.length - 1];
                expect(nextButton.getAttribute("aria-disabled")).toBe("true");

                await userEvent.click(nextButton);

                expect(onNext).not.toHaveBeenCalled();
                await screen.findByText(/please select both a start and end date/i);
        });

        test("allows advancing once a valid end date is set", async () => {
                const store = useCampaignCreationStore.getState();
                store.setEndDate(new Date(Date.now() + 86_400_000));

                const onNext = vi.fn();
                render(<TimingPreferencesStep onBack={vi.fn()} onNext={onNext} />);

                const nextButtons = screen.getAllByRole("button", { name: /next/i });
                const nextButton = nextButtons[nextButtons.length - 1];
                expect(nextButton.getAttribute("aria-disabled")).toBe("false");

                await userEvent.click(nextButton);

                expect(onNext).toHaveBeenCalledTimes(1);
        });
});
