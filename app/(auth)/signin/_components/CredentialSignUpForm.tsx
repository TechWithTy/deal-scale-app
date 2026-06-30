"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupPublicApi } from "@/lib/api/public-api-client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function CredentialSignUpForm() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		try {
			await signupPublicApi({
				email,
				first_name: firstName.trim() || undefined,
				last_name: lastName.trim() || undefined,
				password,
			});
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
				callbackUrl: "/dashboard",
			});
			if (result?.error) throw new Error(result.error);
			window.location.href = result?.url ?? "/dashboard";
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to create account",
			);
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={submit} className="space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<Field
					id="first-name"
					label="First name"
					value={firstName}
					onChange={setFirstName}
					autoComplete="given-name"
				/>
				<Field
					id="last-name"
					label="Last name"
					value={lastName}
					onChange={setLastName}
					autoComplete="family-name"
				/>
			</div>
			<Field
				id="signup-email"
				label="Email"
				value={email}
				onChange={setEmail}
				type="email"
				autoComplete="email"
				required
			/>
			<Field
				id="signup-password"
				label="Password"
				value={password}
				onChange={setPassword}
				type="password"
				autoComplete="new-password"
				minLength={8}
				required
			/>
			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Creating account…" : "Create account"}
			</Button>
		</form>
	);
}

function Field({
	id,
	label,
	value,
	onChange,
	type = "text",
	...inputProps
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
} & Omit<
	React.ComponentProps<typeof Input>,
	"id" | "onChange" | "type" | "value"
>) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Input
				{...inputProps}
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	);
}
