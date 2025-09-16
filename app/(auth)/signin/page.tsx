"use client";

import { useState } from "react";
import { TestUsers } from "@/app/(auth)/(signin)/_components/TestUsers";
import AuthForm from "@/app/(auth)/(signin)/userAuth";
import AuthToggle from "@/app/(auth)/(signin)/authToggle";

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
							<div className="border-border flex-grow border-t" />
							<span className="text-muted-foreground flex-shrink px-4 text-sm">
								Or use test accounts
							</span>
							<div className="border-border flex-grow border-t" />
						</div>
						<TestUsers />
					</>
				)}
			</div>
		</div>
	);
}
