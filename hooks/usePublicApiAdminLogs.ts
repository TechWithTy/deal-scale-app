"use client";

import { extractPublicApiAdminLogs } from "@/lib/admin/public-api-admin-users";
import type { AdminActivityEvent } from "@/lib/admin/user-directory";
import { getAdminUserLogs } from "@/lib/api/public-api-dashboard";
import { useEffect, useState } from "react";

export function usePublicApiAdminLogs(
	userId: string,
	fallback: AdminActivityEvent[],
	token?: string,
	enabled = true,
) {
	const [logs, setLogs] = useState(fallback);
	const [source, setSource] = useState<"fallback" | "live">("fallback");

	useEffect(() => {
		let isMounted = true;
		if (!enabled || !token || !userId) {
			setLogs(fallback);
			setSource("fallback");
			return;
		}

		getAdminUserLogs(userId, token)
			.then((payload) => {
				if (!isMounted) return;
				const nextLogs = extractPublicApiAdminLogs(payload);
				setLogs(nextLogs.length ? nextLogs : fallback);
				setSource(nextLogs.length ? "live" : "fallback");
			})
			.catch(() => {
				if (isMounted) {
					setLogs(fallback);
					setSource("fallback");
				}
			});

		return () => {
			isMounted = false;
		};
	}, [enabled, fallback, token, userId]);

	return { logs, source };
}
