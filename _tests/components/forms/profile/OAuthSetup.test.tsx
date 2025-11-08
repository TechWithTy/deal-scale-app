import type React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { OAuthSetup } from "@/components/forms/steppers/profile-form/steps/Oauth/OAuthSetup";
import type { InitialOauthSetupData } from "@/components/forms/steppers/utils/const/connectedAccounts";
import { useUserStore } from "@/lib/stores/userStore";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";

const TestHarness: React.FC<{ initialData: InitialOauthSetupData }> = ({
	initialData,
}) => {
	const form = useForm<ProfileFormValues>({
		defaultValues: {} as ProfileFormValues,
	});

	return (
		<FormProvider {...form}>
			<OAuthSetup form={form} loading={false} initialData={initialData} />
		</FormProvider>
	);
};

describe("OAuthSetup beta integrations", () => {
	beforeEach(() => {
		useUserStore.getState().setUser(null);
	});

	it("renders Apple Health and Daylio cards as private beta with integration details", () => {
		const initialData: InitialOauthSetupData = {
			connectedAccounts: {},
			socialMediaTags: [],
			aiProvider: {
				primary: "dealscale",
				fallback: "none",
				routing: "balanced",
			},
		};

		render(<TestHarness initialData={initialData} />);

		const appleHealthCard = screen.getByTestId("oauth-card-appleHealth");
		expect(appleHealthCard).toBeInTheDocument();
		expect(
			within(appleHealthCard).getByText(/In Private Beta/i),
		).toBeInTheDocument();
		expect(
			within(appleHealthCard).getByText(
				/Apple HealthKit via DealScale iOS app bridge/i,
			),
		).toBeInTheDocument();
		expect(
			within(appleHealthCard).getByRole("button", { name: /Join Waitlist/i }),
		).toBeDisabled();
		expect(
			within(appleHealthCard).getByText(/Daily \(auto-sync\)/i),
		).toBeInTheDocument();

		const daylioCard = screen.getByTestId("oauth-card-daylio");
		expect(daylioCard).toBeInTheDocument();
		expect(
			within(daylioCard).getByText(/REST API \/ Zapier export/i),
		).toBeInTheDocument();
		expect(
			within(daylioCard).getByText(/Mood entries, activity tags, notes/i),
		).toBeInTheDocument();
		expect(
			within(daylioCard).getByRole("button", { name: /Join Waitlist/i }),
		).toBeDisabled();

		const makeCard = screen.getByTestId("oauth-card-make");
		expect(makeCard).toBeInTheDocument();
		expect(
			within(makeCard).getByText(/OAuth 2\.0 with scenario webhooks/i),
		).toBeInTheDocument();
		expect(
			within(makeCard).getByRole("button", { name: /Join Waitlist/i }),
		).toBeDisabled();

		const habiticaCard = screen.getByTestId("oauth-card-habitica");
		expect(habiticaCard).toBeInTheDocument();
		expect(
			within(habiticaCard).getByText(
				/Habit streaks, task completions, quest participation/i,
			),
		).toBeInTheDocument();
		expect(
			within(habiticaCard).getByRole("button", { name: /Join Waitlist/i }),
		).toBeDisabled();

		const metaCard = screen.getByTestId("oauth-card-meta");
		expect(metaCard).toBeInTheDocument();
		expect(
			within(metaCard).getByText(/Ad sets, lead forms, page engagement/i),
		).toBeInTheDocument();
	});
});
