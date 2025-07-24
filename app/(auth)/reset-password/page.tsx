"use client";

// import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";

const ResetPassword = () => {
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [loading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token"); // Extract token from URL

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsLoading(true);

		// const formData = new FormData(event.currentTarget);
		// const password = formData.get("password") as string;
		// const result = await resetPassword(
		// 	formData,
		// 	searchParams.get("code") as string,
		// );

		// if (result.status === "success") {
		// 	router.push("login");
		// }

		setIsLoading(false);
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
							name="password"
							type="password"
							placeholder="Enter new password"
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
