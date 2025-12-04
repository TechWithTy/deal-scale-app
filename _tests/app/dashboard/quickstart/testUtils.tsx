import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import React from "react";

const NuqsWrapper = withNuqsTestingAdapter({ searchParams: "" });

const mockSession: Session = {
	user: {
		id: "test-user",
		name: "QA Tester",
		email: "qa@example.com",
	},
	expires: "2999-12-31T23:59:59.999Z",
};

const QuickstartTestProviders: React.FC<React.PropsWithChildren> = ({
	children,
}) => (
	<SessionProvider
		session={mockSession}
		refetchInterval={0}
		refetchOnWindowFocus={false}
	>
		<NuqsWrapper>{children}</NuqsWrapper>
	</SessionProvider>
);

export function renderWithNuqs(
	ui: React.ReactElement,
	options?: RenderOptions,
) {
	return render(ui, {
		wrapper: QuickstartTestProviders,
		...options,
	});
}

