"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { Button } from "@/components/ui/button";

export default function ImpersonationBanner() {
	const { isImpersonating, impersonatedUser, stopImpersonation } =
		useImpersonationStore((state) => ({
			isImpersonating: state.isImpersonating,
			impersonatedUser: state.impersonatedUser,
			stopImpersonation: state.stopImpersonation,
		}));
	const pathname = usePathname();
	if (!isImpersonating || !impersonatedUser) return null;

	const displayName =
		impersonatedUser.name?.trim() || impersonatedUser.email || "User";

	// Determine link text and href based on current route
	const isOnAdminRoute = pathname.startsWith("/admin");
	const linkText = isOnAdminRoute
		? "Go back to Dashboard"
		: "Go to Admin Panel";
	const linkHref = isOnAdminRoute ? "/dashboard" : "/admin";
	const handleStop = async () => {
		try {
			await stopImpersonation();
			toast.success("Impersonation session ended");
			// Navigate to admin panel after stopping impersonation
			window.location.href = "/admin";
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to stop impersonation";
			toast.error(message);
		}
	};

	return (
		<div className="sticky top-0 z-50 w-full border-border border-b bg-card px-3 py-2 text-foreground text-sm shadow">
			<div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<span>
					Impersonating <strong>{displayName}</strong>
				</span>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" variant="ghost">
						<Link href={linkHref}>{linkText}</Link>
					</Button>
					<Button size="sm" variant="outline" onClick={handleStop}>
						Stop Impersonating
					</Button>
				</div>
			</div>
		</div>
	);
}
