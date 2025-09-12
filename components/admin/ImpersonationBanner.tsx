"use client";

import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { Button } from "@/components/ui/button";

export default function ImpersonationBanner() {
	const { isImpersonating, userName, endImpersonation } =
		useImpersonationStore();
	if (!isImpersonating) return null;
	return (
		<div className="sticky top-0 z-50 w-full bg-amber-100 px-3 py-2 text-amber-800 text-sm shadow">
			<div className="mx-auto flex max-w-5xl items-center justify-between">
				<span>
					Impersonating <strong>{userName ?? "User"}</strong>
				</span>
				<Button size="sm" variant="outline" onClick={endImpersonation}>
					End Session
				</Button>
			</div>
		</div>
	);
}
