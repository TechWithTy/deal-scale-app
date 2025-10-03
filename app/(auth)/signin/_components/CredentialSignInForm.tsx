"use client";

import { useMemo, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CredentialSignInFormProps {
	defaultEmail?: string;
	defaultPassword?: string;
	adminName?: string;
}

export function CredentialSignInForm({
	defaultEmail = "",
	defaultPassword = "",
	adminName,
}: CredentialSignInFormProps) {
	const [email, setEmail] = useState(defaultEmail);
	const [password, setPassword] = useState(defaultPassword);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const searchParams = useSearchParams();

	const callbackUrl = useMemo(() => {
		return searchParams?.get("callbackUrl") ?? "/dashboard";
	}, [searchParams]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
				callbackUrl,
			});

			if (result?.error) {
				toast.error(result.error);
				setIsSubmitting(false);
				return;
			}

			if (result?.url) {
				window.location.href = result.url;
			} else {
				window.location.href = callbackUrl;
			}
		} catch (error) {
			console.error("Sign-in error", error);
			toast.error("Unable to sign in. Please try again.");
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={email}
					autoComplete="email"
					onChange={(event) => setEmail(event.target.value)}
					placeholder={adminName ? `${adminName} email` : "you@example.com"}
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					value={password}
					autoComplete="current-password"
					onChange={(event) => setPassword(event.target.value)}
					placeholder="••••••••"
					required
				/>
			</div>
			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Signing In..." : "Sign In"}
			</Button>
		</form>
	);
}
