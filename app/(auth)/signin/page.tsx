"use client";

import { FlameIcon } from "lucide-react";
import { useState } from "react";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "@/constants/data";
import { TestUsers } from "@/app/(auth)/(signin)/_components/TestUsers";
import AuthForm from "@/app/(auth)/(signin)/userAuth";
import AuthToggle from "@/app/(auth)/(signin)/authToggle";
import Carousel from "@/app/(auth)/(signin)/carousel";
import QuoteSection from "@/app/(auth)/(signin)/QuoteSection";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center font-medium text-lg">
					<FlameIcon className="mr-2 h-6 w-6" />
					Deal Scale
				</div>

				<Carousel />
				<QuoteSection />
			</div>

			<div className="flex h-full flex-col items-center p-4 lg:p-8">
				<AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
				{1 && (
					<>
						<div className="relative mt-4 flex w-full max-w-md items-center py-4">
							<div className="flex-grow border-border border-t" />
							<span className="flex-shrink px-4 text-muted-foreground text-sm">
								Or use test accounts
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
