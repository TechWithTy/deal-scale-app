import React from "react";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	ChannelCustomizationStep,
} from "@/components/reusables/modals/user/campaign/steps/ChannelCustomizationStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

type FormValues = {
	primaryPhoneNumber: string;
	areaMode: "zip" | "leadList";
	selectedLeadListId?: string;
};

const Harness = ({
	onBack = vi.fn(),
	onNext = vi.fn(),
}: {
	onBack?: () => void;
	onNext?: () => void;
}) => {
	const form = useForm<FormValues>({
		defaultValues: {
			primaryPhoneNumber: "",
			areaMode: "zip",
			selectedLeadListId: "",
		},
	});

	return (
		<ChannelCustomizationStep
			onBack={onBack}
			onNext={onNext}
			form={form as never}
		/>
	);
};

describe("ChannelCustomizationStep", () => {
	beforeEach(() => {
		useCampaignCreationStore.getState().reset();
	});

	it("shows the channel guard when no primary channel is selected", () => {
		render(<Harness />);

		expect(
			screen.getByText(/please select a channel first/i),
		).toBeInTheDocument();
	});

	it("renders the customization form when a channel is selected", () => {
		useCampaignCreationStore.getState().setPrimaryChannel("text");

	render(<Harness />);

	expect(
		screen.getAllByRole("heading", { name: /channel customization/i })[0],
	).toBeInTheDocument();
	expect(
		screen.getAllByText(/customize settings for your text campaign/i)[0],
	).toBeInTheDocument();
	});
});
