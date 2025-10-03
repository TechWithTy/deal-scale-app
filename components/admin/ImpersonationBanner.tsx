"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { Button } from "@/components/ui/button";

export default function ImpersonationBanner() {
	const { isImpersonating, impersonatedUser } = useImpersonationStore(
		(state) => ({
			isImpersonating: state.isImpersonating,
			impersonatedUser: state.impersonatedUser,
		}),
	);
	const stopImpersonation = useImpersonationStore(
		(state) => state.stopImpersonation,
	);
	const router = useRouter();

	if (!isImpersonating || !impersonatedUser) return null;

	const displayName =
		impersonatedUser.name?.trim() || impersonatedUser.email || "User";

	const handleStop = async () => {
		try {
			await stopImpersonation();
			toast.success("Impersonation session ended");
			router.push("/admin");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to stop impersonation";
			toast.error(message);
		}
	};

	return (
		<div className="sticky top-0 z-50 w-full bg-amber-100 px-3 py-2 text-amber-900 text-sm shadow">
			<div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<span>
					Impersonating <strong>{displayName}</strong>
				</span>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" variant="ghost">
						<Link href="/admin">Go back to Admin Panel</Link>
					</Button>
					<Button size="sm" variant="outline" onClick={handleStop}>
						Stop Impersonating
					</Button>
				</div>
			</div>
		</div>
	);
}
