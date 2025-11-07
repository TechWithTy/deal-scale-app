"use client";

import { Button } from "@/components/ui/button";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { useUserStore } from "@/lib/stores/userStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export default function ImpersonationBanner() {
	const {
		isImpersonating,
		impersonatedUser,
		stopImpersonation,
		originalCredits,
	} = useImpersonationStore((state) => ({
		isImpersonating: state.isImpersonating,
		impersonatedUser: state.impersonatedUser,
		stopImpersonation: state.stopImpersonation,
		originalCredits: state.originalCredits,
	}));
	const currentCredits = useUserStore((state) => state.credits);
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
			console.log("=== IMPERSONATION STOP DEBUG ===");
			console.log("Original credits:", originalCredits);
			console.log("Current credits:", currentCredits);

			// Calculate credits used during impersonation
			let creditsUsedMessage = "";
			if (originalCredits) {
				const creditsUsed = {
					ai: Math.max(0, currentCredits.ai.used - originalCredits.ai.used),
					leads: Math.max(
						0,
						currentCredits.leads.used - originalCredits.leads.used,
					),
					skipTraces: Math.max(
						0,
						currentCredits.skipTraces.used - originalCredits.skipTraces.used,
					),
				};

				console.log("Credits used during impersonation:", creditsUsed);

				const totalUsed =
					creditsUsed.ai + creditsUsed.leads + creditsUsed.skipTraces;
				console.log("Total credits used:", totalUsed);

				if (totalUsed > 0) {
					creditsUsedMessage = ` Used: ${creditsUsed.ai} AI, ${creditsUsed.leads} Leads, ${creditsUsed.skipTraces} Skip Traces.`;
					console.log("Credits used message:", creditsUsedMessage);
				}
			} else {
				console.log("No original credits found - this shouldn't happen!");
			}

			// Stop impersonation first (this updates state)
			await stopImpersonation();

			// Log final state after refund
			const finalCredits = useUserStore.getState().credits;
			console.log("Final credits after refund:", finalCredits);
			console.log("=== IMPERSONATION STOP DEBUG END ===");

			// Defer toast and navigation to avoid React state update during render error
			setTimeout(() => {
				toast.success(
					`Impersonation session ended.${creditsUsedMessage} Credits refunded.`,
				);
				// Navigate to admin panel after stopping impersonation
				window.location.href = "/admin";
			}, 0);
		} catch (error) {
			console.error("Error stopping impersonation:", error);
			setTimeout(() => {
				const message =
					error instanceof Error
						? error.message
						: "Unable to stop impersonation";
				toast.error(message);
			}, 0);
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
