"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPasswordPublicApi } from "@/lib/api/public-api-client";
import type React from "react";
import { useState } from "react";
import { useToast } from "../../../components/ui/use-toast";

const ForgotPassword = () => {
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();

		if (!email) {
			setError("Email is required.");
			return;
		}

		setIsPending(true);
		try {
			await resetPasswordPublicApi(email);
			toast({
				title: "Email sent",
				variant: "default",
				description:
					"If the account exists, reset instructions will arrive shortly.",
			});
			event.currentTarget.reset();
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Unable to send reset instructions.",
			);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-xl">Forgot Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							name="email"
							type="email"
							placeholder="Enter your email"
							disabled={isPending}
							required
						/>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<Button disabled={isPending} className="w-full" type="submit">
							{isPending ? "Processing..." : "Send Reset Link"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ForgotPassword;
