import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { z } from "zod";

import {
	ChannelCustomizationStep,
	FormSchema,
} from "@/components/reusables/modals/user/campaign/steps/ChannelCustomizationStep";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

type FormValues = z.infer<typeof FormSchema>;

function TestHarness() {
	const form = useForm<FormValues>({
		defaultValues: {
			primaryPhoneNumber: "+15551234567",
			areaMode: "zip",
			selectedLeadListId: "",
		},
	});

	return (
		<ChannelCustomizationStep
			onBack={() => undefined}
			onNext={() => undefined}
			form={form}
		/>
	);
}

describe("ChannelCustomizationStep", () => {
	beforeEach(() => {
		useCampaignCreationStore.getState().reset();
	});

	afterEach(() => {
		useCampaignCreationStore.getState().reset();
		cleanup();
	});

	it("shows a channel selection message when no channel is selected", () => {
		render(<TestHarness />);
		expect(
			screen.getByText(/please select a channel first/i),
		).toBeInTheDocument();
	});

	it("renders the channel customization form when a channel is selected", () => {
		useCampaignCreationStore.setState({ primaryChannel: "call" });
		render(<TestHarness />);

		expect(
			screen.getAllByRole("heading", { name: /channel customization/i })[0],
		).toBeInTheDocument();
		expect(
			screen.getByText(/customize settings for your call campaign/i),
		).toBeInTheDocument();
	});
});
