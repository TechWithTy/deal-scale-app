"use client";

import { useState } from "react";
import AuthToggle from "./authToggle";
import AuthForm from "./userAuth";
import { TestUsers } from "./_components/TestUsers";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
			<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

			<div className="flex w-full max-w-xl flex-col items-center">
				<AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
				{!isSignUp && (
					<>
						<div className="relative mt-4 flex w-full items-center py-4">
							<div className="flex-grow border-border border-t" />
							<span className="flex-shrink px-4 text-muted-foreground text-sm">
								use test accounts
							</span>
							<div className="flex-grow border-border border-t" />
						</div>
						<TestUsers />
					</>
				)}
			</div>
		</div>
	);
}
