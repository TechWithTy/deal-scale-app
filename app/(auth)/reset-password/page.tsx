"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { setPasswordPublicApi } from "@/lib/api/public-api-client";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";

const ResetPassword = () => {
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const emailParam = searchParams.get("email") ?? "";

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const password = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");

		if (!token) {
			setError("Reset token is missing or expired.");
			return;
		}
		if (!email) {
			setError("Email is required.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setIsPending(true);
		try {
			await setPasswordPublicApi({
				confirm_password: confirmPassword,
				email,
				new_password: password,
				token,
			});
			toast({
				title: "Password updated",
				variant: "default",
				description: "Sign in with your new password.",
			});
			router.push("/signin");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to update password.",
			);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-xl">Reset Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							name="email"
							type="email"
							placeholder="Enter your email"
							defaultValue={emailParam}
							disabled={isPending}
							required
						/>
						<Input
							name="password"
							type="password"
							placeholder="Enter new password"
							disabled={isPending}
							required
						/>
						<Input
							name="confirmPassword"
							type="password"
							placeholder="Confirm new password"
							disabled={isPending}
							required
						/>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<Button disabled={isPending} className="w-full" type="submit">
							{isPending ? "Processing..." : "Update Password"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ResetPassword;
