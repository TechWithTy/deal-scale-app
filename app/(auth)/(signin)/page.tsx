"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/_utils";
import { FlameIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import QuoteSection from "./QuoteSection";
import AuthToggle from "./authToggle";
import Carousel from "./carousel";
import AuthForm from "./userAuth";
import { TestUsers } from "./_components/TestUsers";

export default function AuthenticationPage() {
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<div className="relative flex h-screen flex-col items-center justify-center">
			<AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

			<div className="flex h-full flex-col items-center p-4 lg:p-8">
				<AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
				{!isSignUp && (
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
