import { TimingPreferencesStep } from "@/components/reusables/modals/user/campaign/steps/TimingPreferencesStep";
import { TimingPreferencesStep as ExternalTimingPreferencesStep } from "@/external/shadcn-table/src/examples/campaigns/modal/steps/TimingPreferencesStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("TimingPreferencesStep", () => {
	beforeEach(() => {
		useCampaignCreationStore.getState().reset();
	});

	afterEach(() => {
		cleanup();
	});

	function getNextButton() {
		const buttons = screen.getAllByRole("button", { name: /^next$/i });
		const nextButton = buttons[buttons.length - 1];
		expect(nextButton).toBeDefined();
		return nextButton as HTMLElement;
	}

	test("prevents advancing when end date is missing", async () => {
		const onNext = vi.fn();

		render(<TimingPreferencesStep onBack={vi.fn()} onNext={onNext} />);

		const nextButton = getNextButton();
		expect(nextButton).toHaveAttribute("disabled");

		fireEvent.click(nextButton);

		expect(onNext).not.toHaveBeenCalled();
	});

	test("allows advancing once a valid end date is set", async () => {
		const store = useCampaignCreationStore.getState();
		store.setEndDate(new Date(Date.now() + 86_400_000));

		const onNext = vi.fn();
		render(<TimingPreferencesStep onBack={vi.fn()} onNext={onNext} />);

		const nextButton = getNextButton();
		expect(nextButton).not.toHaveAttribute("disabled");

		fireEvent.click(nextButton);

		expect(onNext).toHaveBeenCalledTimes(1);
	});

	test("shows selected calendar days for campaign scheduling", async () => {
		const store = useCampaignCreationStore.getState();
		const runDate = new Date(2026, 5, 22);
		store.setScheduleMode("selected-days");
		store.setSelectedRunDates([runDate]);

		const { container } = render(
			<TimingPreferencesStep onBack={vi.fn()} onNext={vi.fn()} />,
		);

		expect(
			within(container).getByText("Campaign call schedule"),
		).toBeInTheDocument();
		expect(screen.getByText("Selected calendar days")).toBeInTheDocument();
		expect(
			screen.getByText("Run only on selected calendar days"),
		).toBeInTheDocument();
		expect(screen.getByText(/Selected weekdays: Monday/i)).toBeInTheDocument();
	});

	test("uses message schedule wording for text campaigns", async () => {
		const store = useCampaignCreationStore.getState();
		store.setPrimaryChannel("text");

		render(<TimingPreferencesStep onBack={vi.fn()} onNext={vi.fn()} />);

		expect(screen.getByText("Campaign message schedule")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Choose a start/stop window or pick exact calendar days for messages.",
			),
		).toBeInTheDocument();
	});

	test("uses interaction schedule wording for LinkedIn campaigns", async () => {
		const store = useCampaignCreationStore.getState();
		store.setPrimaryChannel("linkedin");

		render(<TimingPreferencesStep onBack={vi.fn()} onNext={vi.fn()} />);

		expect(
			screen.getByText("Campaign interaction schedule"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Choose a start/stop window or pick exact calendar days for interactions.",
			),
		).toBeInTheDocument();
	});

	test("uses messages per day labels for text campaign pacing", async () => {
		const store = useCampaignCreationStore.getState();
		store.setPrimaryChannel("text");

		render(<ExternalTimingPreferencesStep onBack={vi.fn()} onNext={vi.fn()} />);

		expect(screen.getByText("Text Message Settings")).toBeInTheDocument();
		expect(screen.getByText("Minimum messages per day")).toBeInTheDocument();
		expect(screen.getByText("Maximum messages per day")).toBeInTheDocument();
	});

	test("uses interactions per day labels for LinkedIn and Facebook pacing", async () => {
		const store = useCampaignCreationStore.getState();
		store.setPrimaryChannel("linkedin");
		const { rerender } = render(
			<ExternalTimingPreferencesStep onBack={vi.fn()} onNext={vi.fn()} />,
		);

		expect(
			screen.getByText("LinkedIn Interaction Settings"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Minimum interactions per day"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Maximum interactions per day"),
		).toBeInTheDocument();

		store.setPrimaryChannel("facebook");
		rerender(
			<ExternalTimingPreferencesStep onBack={vi.fn()} onNext={vi.fn()} />,
		);

		expect(
			screen.getByText("Facebook Interaction Settings"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Minimum interactions per day"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Maximum interactions per day"),
		).toBeInTheDocument();
	});

	test("blocks advancing when selected-days mode has no run dates", async () => {
		const store = useCampaignCreationStore.getState();
		store.setScheduleMode("selected-days");
		store.setSelectedRunDates([]);
		const onNext = vi.fn();

		const { container } = render(
			<TimingPreferencesStep onBack={vi.fn()} onNext={onNext} />,
		);

		const planner = within(container)
			.getByText("Campaign call schedule")
			.closest("section");
		expect(planner).not.toBeNull();
		expect(
			within(planner as HTMLElement).getByText(
				/Select at least one campaign run date/i,
			),
		).toBeInTheDocument();

		const nextButton = getNextButton();
		expect(nextButton).toHaveAttribute("disabled");
	});
});
