"use client";

import { FlameIcon } from "lucide-react";
import { useState } from "react";

import { Carousel } from "@/components/ui/carousel";

import { APP_TESTING_MODE } from "@/constants/testingMode";
import AuthToggle from "../signin/authToggle";
import AuthForm from "../signin/userAuth";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			{/* Skip to main content for keyboard navigation */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
			>
				Skip to main content
			</a>

			<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

			<aside
				className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r"
				aria-label="Marketing showcase"
			>
				<div className="absolute inset-0 bg-zinc-900" />
				<header className="relative z-20 flex items-center font-medium text-lg">
					<FlameIcon className="mr-2 h-6 w-6" aria-hidden="true" />
					<span>Deal Scale</span>
				</header>

				<Carousel />
			</aside>

			<main
				id="main-content"
				className="flex h-full items-center p-4 lg:p-8"
				role="main"
			>
				<AuthForm isSignUp={isSignUp} mode={APP_TESTING_MODE} />
			</main>
		</div>
	);
}
