import MainUserAuthForm from "@/components/forms/steppers/user-auth-forms/MainUserAuthForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

// Define the props type
interface AuthFormProps {
	isSignUp: boolean;
	setIsSignUp: (value: boolean) => void;
}

export default function AuthForm({ isSignUp, setIsSignUp }: AuthFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="font-semibold text-2xl tracking-tight">
					{isSignUp ? "Create an account" : "Sign In to your account"}
				</h1>
				<p className="text-muted-foreground text-sm">
					{isSignUp
						? "Enter your details to sign up"
						: "Enter your email to sign in"}
				</p>
			</div>

			<MainUserAuthForm />

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
		</div>
	);
}
