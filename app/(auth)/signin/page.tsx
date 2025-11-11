"use client";

import { APP_TESTING_MODE } from "@/constants/testingMode";
import { useState } from "react";
import { TestUsers } from "./_components/TestUsers";
import AuthToggle from "./authToggle";
import AuthForm from "./userAuth";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const testingMode = APP_TESTING_MODE;
	const showDemoConfigurator = testingMode === "dev";

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
			{/* Skip to main content for keyboard navigation */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-ring"
			>
				Skip to main content
			</a>

			{showDemoConfigurator ? (
				<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
			) : null}

			<main
				id="main-content"
				className="flex w-full max-w-xl flex-col items-center"
				role="main"
			>
				<AuthForm isSignUp={isSignUp} mode={testingMode} />

				{showDemoConfigurator && !isSignUp ? (
					<section aria-label="Test account options">
						<div className="relative mt-4 flex w-full items-center py-4">
							<div
								className="flex-grow border-border border-t"
								aria-hidden="true"
							/>
							<span className="flex-shrink px-4 text-muted-foreground text-sm">
								Or use test accounts
							</span>
							<div
								className="flex-grow border-border border-t"
								aria-hidden="true"
							/>
						</div>
						<TestUsers />
					</section>
				) : null}
			</main>
		</div>
	);
}
