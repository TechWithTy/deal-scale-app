"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Global Error Boundary
 *
 * @description Root-level error handler for catastrophic failures
 * @description Uses minimal dependencies to ensure it always renders
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-white">
					<div className="mx-auto max-w-md text-center">
						{/* Error Icon */}
						<div className="mb-6 flex justify-center">
							<AlertTriangle
								className="h-20 w-20 text-red-500"
								aria-hidden="true"
							/>
						</div>

						{/* Error Message */}
						<h1 className="mb-2 font-bold text-3xl">Critical Error</h1>
						<p className="mb-8 text-zinc-400">
							We're experiencing technical difficulties. Please try refreshing
							the page.
						</p>

						{/* Recovery Button */}
						<Button
							onClick={reset}
							size="lg"
							className="bg-red-600 hover:bg-red-700"
						>
							Reload Application
						</Button>

						{/* Support */}
						<p className="mt-8 text-zinc-500 text-sm">
							If the problem persists, please contact{" "}
							<a
								href="mailto:support@dealscale.app"
								className="text-red-400 underline-offset-4 hover:underline"
							>
								support@dealscale.app
							</a>
						</p>
					</div>
				</div>
			</body>
		</html>
	);
}
