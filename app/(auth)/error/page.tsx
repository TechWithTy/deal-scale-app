"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function AuthErrorPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const error = searchParams.get("error");
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	// Common error messages
	const errorMessages: Record<string, string> = {
		Configuration: "There is a problem with the server configuration.",
		AccessDenied: "You do not have permission to sign in.",
		Verification: "The sign in link is no longer valid or has expired.",
		Default: "An error occurred during sign in.",
	};

	// Get the error message or use the default
	const errorMessage = error
		? errorMessages[error] || errorMessages.Default
		: "An unknown error occurred.";

	// Log the error for debugging
	useEffect(() => {
		if (error) {
			console.error("Authentication error:", {
				error,
				errorMessage,
				callbackUrl,
				timestamp: new Date().toISOString(),
			});
		}
	}, [error, errorMessage, callbackUrl]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="flex flex-col items-center space-y-2 text-center">
					<AlertCircle className="h-12 w-12 text-destructive" />
					<h1 className="font-bold text-2xl tracking-tight">
						Authentication Error
					</h1>
					<p className="text-muted-foreground">{errorMessage}</p>
				</div>

				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error Details</AlertTitle>
					<AlertDescription className="break-all">
						{error || "No specific error code provided"}
					</AlertDescription>
				</Alert>

				<div className="flex flex-col space-y-2">
					<Button
						onClick={() => router.push("/auth/signin")}
						className="w-full"
						variant="outline"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Sign In
					</Button>
					<Button onClick={() => window.location.reload()} className="w-full">
						<RefreshCw className="mr-2 h-4 w-4" />
						Try Again
					</Button>
				</div>
			</div>
		</div>
	);
}
