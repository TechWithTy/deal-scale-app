"use client";

import { useState } from "react";
import AuthForm from "./userAuth";
import AuthToggle from "./authToggle";
import { TestUsers } from "./_components/TestUsers";
import { APP_TESTING_MODE } from "@/constants/testingMode";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const testingMode = APP_TESTING_MODE;
	const showDemoConfigurator = testingMode === "dev";

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground">
			{showDemoConfigurator ? (
				<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
			) : null}

			<div className="flex w-full max-w-xl flex-col items-center">
				<AuthForm isSignUp={isSignUp} mode={testingMode} />

				{showDemoConfigurator && !isSignUp ? (
					<>
						<div className="relative mt-4 flex w-full items-center py-4">
							<div className="flex-grow border-border border-t" />
							<span className="flex-shrink px-4 text-muted-foreground text-sm">
								Or use test accounts
							</span>
							<div className="flex-grow border-border border-t" />
						</div>
						<TestUsers />
					</>
				) : null}
			</div>
		</div>
	);
}
