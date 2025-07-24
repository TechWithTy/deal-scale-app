"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Icons } from "./icons";
import { Button } from "./ui/button";

export default function GithubSignInButton() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");

	return (
		<Button
			className="w-full"
			variant="outline"
			type="button"
			onClick={() =>
				signIn("github", { callbackUrl: callbackUrl ?? "/dashboard" })
			}
		>
			<Icons.gitHub className="mr-2 h-4 w-4" />
			Continue with Github
		</Button>
	);
}
