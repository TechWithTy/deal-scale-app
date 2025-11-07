"use client";

import type { AppTestingMode } from "@/constants/testingMode";
import { users } from "@/lib/mock-db";
import Link from "next/link";
import { CredentialSignInForm } from "./_components/CredentialSignInForm";

interface AuthFormProps {
	isSignUp: boolean;
	mode: AppTestingMode;
}

const adminUser = users.find((user) => user.role === "admin");

export default function AuthForm({ isSignUp, mode }: AuthFormProps) {
	const isDemoMode = mode === "dev";

	const TermsNotice = () => (
		<p className="px-8 text-center text-muted-foreground text-sm">
			By clicking continue, you agree to our{" "}
			<Link
				href="/terms"
				className="underline underline-offset-4 hover:text-primary"
			>
				Terms of Service
			</Link>{" "}
			and{" "}
			<Link
				href="/privacy"
				className="underline underline-offset-4 hover:text-primary"
			>
				Privacy Policy
			</Link>
			.
		</p>
	);

	if (!isDemoMode) {
		return (
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="font-semibold text-2xl tracking-tight">
						Sign in to your account
					</h1>
					<p className="text-muted-foreground text-sm">
						Use the prefilled admin credentials below or adjust them before
						signing in.
					</p>
				</div>
				<CredentialSignInForm
					defaultEmail={adminUser?.email}
					defaultPassword={adminUser?.password}
					adminName={adminUser?.name}
				/>
				<TermsNotice />
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="font-semibold text-2xl tracking-tight">
					{isSignUp ? "Create an account" : "Demo sign in"}
				</h1>
				<p className="text-muted-foreground text-sm">
					{isSignUp
						? "Enter your details to sign up"
						: "Configure test users, select tiers, and update tester flags before logging in."}
				</p>
			</div>
			<TermsNotice />
		</div>
	);
}
