"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/userStore";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";

export default function SessionSync() {
	const { data: session, status } = useSession();
	const setUser = useUserStore((state) => state.setUser);
	const hydrateImpersonation = useImpersonationStore(
		(state) => state.hydrateFromSession,
	);

	useEffect(() => {
		if (status === "authenticated") {
			setUser(session);
			hydrateImpersonation(session ?? null);
		} else if (status === "unauthenticated") {
			setUser(null);
			hydrateImpersonation(null);
		}
	}, [session, status, setUser, hydrateImpersonation]);

	return null;
}
