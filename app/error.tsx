"use client";

import { Button } from "@/components/ui/button";
import {
	AlertTriangle,
	Bug,
	ClipboardCopy,
	Home,
	RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
	const [browserLogs, setBrowserLogs] = useState<string>("");

	useEffect(() => {
		// Log error to error tracking service
		console.error("Application error:", error);

		// Collect browser information and error details
		const collectErrorInfo = () => {
			if (typeof window === "undefined") return "";

			// Build comprehensive error report
			const logContent = [
				"=== Error Report ===",
				`Timestamp: ${new Date().toISOString()}`,
				`URL: ${window.location.href}`,
				`User Agent: ${navigator.userAgent}`,
				`Viewport: ${window.innerWidth}x${window.innerHeight}`,
				`Screen: ${screen.width}x${screen.height}`,
				`Language: ${navigator.language}`,
				`Platform: ${navigator.platform}`,
				"",
				"=== Error Details ===",
				`Message: ${error.message}`,
				error.digest ? `Error ID: ${error.digest}` : "",
				error.stack ? `Stack Trace:\n${error.stack}` : "",
				"",
				"=== Browser Information ===",
				`Cookies Enabled: ${navigator.cookieEnabled}`,
				`Online: ${navigator.onLine}`,
				`Referrer: ${document.referrer || "N/A"}`,
			]
				.filter(Boolean)
				.join("\n");

			setBrowserLogs(logContent);
		};

		collectErrorInfo();

		// TODO: Send to error tracking service (Sentry, PostHog, etc.)
		// if (typeof window !== 'undefined' && window.posthog) {
		//   window.posthog.capture('error', {
		//     message: error.message,
		//     digest: error.digest,
		//     stack: error.stack,
		//   });
		// }
	}, [error]);

	const handleCopyLogs = async () => {
		try {
			const logContent =
				browserLogs ||
				"Error information not available. Please check the browser console for additional details.";
			await navigator.clipboard.writeText(logContent);
			toast.success("Error details copied to clipboard");
		} catch (err) {
			console.error("Failed to copy logs:", err);
			toast.error("Failed to copy to clipboard");
		}
	};

	const handleReportIssue = () => {
		const reportContent = browserLogs || "Error information not available.";
		const subject = encodeURIComponent(
			`Error Report: ${error.message.substring(0, 50)}`,
		);
		const body = encodeURIComponent(
			`Please describe what you were doing when this error occurred:\n\n\n\n---\n\nError Details:\n${reportContent}\n\n---\n\nNote: For additional debugging information, please check your browser's developer console (F12 or right-click > Inspect > Console tab) and include any relevant console errors or warnings.`,
		);
		window.location.href = `mailto:support@dealscale.app?subject=${subject}&body=${body}`;
	};

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

						{/* Debug Actions */}
						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
							<Button
								onClick={handleCopyLogs}
								variant="outline"
								size="lg"
								className="inline-flex items-center gap-2"
							>
								<ClipboardCopy className="h-5 w-5" aria-hidden="true" />
								<span>Copy Error Details</span>
							</Button>
							<Button
								onClick={handleReportIssue}
								variant="outline"
								size="lg"
								className="inline-flex items-center gap-2"
							>
								<Bug className="h-5 w-5" aria-hidden="true" />
								<span>Report Issue</span>
							</Button>
						</div>
						<p className="mt-4 text-muted-foreground text-xs">
							Tip: For additional debugging information, check your browser's
							developer console (F12 or right-click → Inspect → Console)
						</p>

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
