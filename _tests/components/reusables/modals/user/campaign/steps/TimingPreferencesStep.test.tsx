import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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

	const nextButton = screen.getAllByRole("button", { name: /^next$/i }).at(-1);
	expect(nextButton).toHaveAttribute("disabled");

	fireEvent.click(nextButton);

	expect(onNext).not.toHaveBeenCalled();
	});

        test("allows advancing once a valid end date is set", async () => {
                const store = useCampaignCreationStore.getState();
                store.setEndDate(new Date(Date.now() + 86_400_000));

                const onNext = vi.fn();
	render(<TimingPreferencesStep onBack={vi.fn()} onNext={onNext} />);

	const nextButton = screen.getAllByRole("button", { name: /^next$/i }).at(-1);
	expect(nextButton).not.toHaveAttribute("disabled");

                fireEvent.click(nextButton);

                expect(onNext).toHaveBeenCalledTimes(1);
        });
});
