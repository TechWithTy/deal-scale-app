"use client";

import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionSync() {
	const { data: session, status } = useSession();
	const setUser = useUserStore((state) => state.setUser);
	const hydrateImpersonation = useImpersonationStore(
		(state) => state.hydrateFromSession,
	);
	const { setFromSession, clear } = useSessionStore((state) => ({
		setFromSession: state.setFromSession,
		clear: state.clear,
	}));

	useEffect(() => {
		if (status === "authenticated") {
			setUser(session);
			setFromSession(session ?? null);
			hydrateImpersonation(session ?? null);
		} else if (status === "unauthenticated") {
			setUser(null);
			clear();
			hydrateImpersonation(null);
		}
	}, [session, status, setUser, hydrateImpersonation, setFromSession, clear]);

	return null;
}
