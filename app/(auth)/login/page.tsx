"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/_utils/kanban/utils";
import { FlameIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import QuoteSection from "../(signin)/QuoteSection";
import AuthToggle from "../(signin)/authToggle";
import AuthForm from "../(signin)/userAuth";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center font-medium text-lg">
					<FlameIcon className="mr-2 h-6 w-6" />
					Lead Ignite
				</div>

				<Carousel />

				<QuoteSection />
			</div>

			<div className="flex h-full items-center p-4 lg:p-8">
				<AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
			</div>
		</div>
	);
}
