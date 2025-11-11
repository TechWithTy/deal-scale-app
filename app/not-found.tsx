import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Link from "next/link";

/**
 * Custom 404 Not Found Page
 *
 * @description User-friendly 404 page with navigation options
 * @description Follows accessibility best practices with semantic HTML
 */
export default function NotFound() {
	return (
		<html lang="en">
			<body>
				<main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
					<div className="mx-auto max-w-md text-center">
						{/* Error Code */}
						<h1 className="mb-4 font-bold text-8xl text-primary">404</h1>

						{/* Error Message */}
						<h2 className="mb-2 font-semibold text-2xl">Page Not Found</h2>
						<p className="mb-8 text-muted-foreground">
							Sorry, we couldn't find the page you're looking for. It may have
							been moved or deleted.
						</p>

						{/* Navigation Options */}
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							<Button asChild size="lg">
								<Link
									href="/dashboard"
									className="inline-flex items-center gap-2"
								>
									<Home className="h-5 w-5" aria-hidden="true" />
									<span>Go to Dashboard</span>
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link
									href="/dashboard/lead"
									className="inline-flex items-center gap-2"
								>
									<Search className="h-5 w-5" aria-hidden="true" />
									<span>Search Properties</span>
								</Link>
							</Button>
						</div>

						{/* Additional Help */}
						<p className="mt-8 text-muted-foreground text-sm">
							Need help?{" "}
							<Link
								href="/dashboard"
								className="text-primary underline-offset-4 hover:underline"
							>
								Contact support
							</Link>
						</p>
					</div>
				</main>
			</body>
		</html>
	);
}
