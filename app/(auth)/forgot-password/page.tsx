"use client";

// import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type React from "react";
import { useState, useTransition } from "react";
import { useToast } from "../../../components/ui/use-toast";

const ForgotPassword = () => {
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		// const formData = new FormData(event.currentTarget);
		// const result = await forgotPassword(formData);

		// if (result.status === "success") {
		// 	setError(null);
		// 	toast({
		// 		title: "Email Sent",
		// 		variant: "default",
		// 		description: "Please Check Your Email",
		// 	});
		// } else {
		// 	setError(result.status);
		// }
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
