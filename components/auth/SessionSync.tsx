"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/userStore";

export default function SessionSync() {
	const { data: session, status } = useSession();
	const setUser = useUserStore((state) => state.setUser);

	useEffect(() => {
		if (status === "authenticated") {
			setUser(session);
		} else if (status === "unauthenticated") {
			// Reset store on sign out
			setUser(null);
		}
	}, [session, status, setUser]);

	return null;
}
