"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Error Boundary Component
 *
 * @description Catches and handles runtime errors in the application
 * @description Provides user-friendly error UI with recovery options
 */
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to error tracking service
		console.error("Application error:", error);

		// TODO: Send to error tracking service (Sentry, PostHog, etc.)
		// if (typeof window !== 'undefined' && window.posthog) {
		//   window.posthog.capture('error', {
		//     message: error.message,
		//     digest: error.digest,
		//     stack: error.stack,
		//   });
		// }
	}, [error]);

	return (
		<html lang="en">
			<body>
				<main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
					<div className="mx-auto max-w-md text-center">
						{/* Error Icon */}
						<div className="mb-6 flex justify-center">
							<div className="rounded-full bg-destructive/10 p-6">
								<AlertTriangle
									className="h-16 w-16 text-destructive"
									aria-hidden="true"
								/>
							</div>
						</div>

						{/* Error Message */}
						<h1 className="mb-2 font-semibold text-2xl">
							Something went wrong
						</h1>
						<p className="mb-8 text-muted-foreground">
							We encountered an unexpected error. Our team has been notified and
							is working on a fix.
						</p>

						{/* Error Details (Development only) */}
						{process.env.NODE_ENV === "development" && (
							<div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
								<p className="mb-2 font-mono text-destructive text-sm">
									{error.message}
								</p>
								{error.digest && (
									<p className="font-mono text-muted-foreground text-xs">
										Error ID: {error.digest}
									</p>
								)}
							</div>
						)}

						{/* Recovery Options */}
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							<Button
								onClick={reset}
								size="lg"
								className="inline-flex items-center gap-2"
							>
								<RefreshCcw className="h-5 w-5" aria-hidden="true" />
								<span>Try Again</span>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link
									href="/dashboard"
									className="inline-flex items-center gap-2"
								>
									<Home className="h-5 w-5" aria-hidden="true" />
									<span>Go Home</span>
								</Link>
							</Button>
						</div>

						{/* Support Contact */}
						<p className="mt-8 text-muted-foreground text-sm">
							Problem persists?{" "}
							<a
								href="mailto:support@dealscale.app"
								className="text-primary underline-offset-4 hover:underline"
							>
								Contact support
							</a>
						</p>
					</div>
				</main>
			</body>
		</html>
	);
}
