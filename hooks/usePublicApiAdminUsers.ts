"use client";

import type { AdminUser } from "@/components/tables/super-users/types";
import { searchAdminUsers } from "@/lib/api/public-api-dashboard";
import { extractPublicApiAdminUsers } from "@/lib/admin/public-api-admin-users";
import { useCallback, useEffect, useState } from "react";

export type PublicApiAdminUsersSource =
	| "error"
	| "fallback"
	| "live"
	| "missing_token";

function localSearch(users: AdminUser[], query: string) {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return users;
	return users.filter((user) => {
		const email = user.email.toLowerCase();
		const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`
			.trim()
			.toLowerCase();
		return email.includes(normalized) || name.includes(normalized);
	});
}

export function usePublicApiAdminUsers(
	fallbackUsers: AdminUser[],
	token?: string,
) {
	const [users, setUsers] = useState<AdminUser[]>(fallbackUsers);
	const [source, setSource] =
		useState<PublicApiAdminUsersSource>("missing_token");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const search = useCallback(
		async (query = "") => {
			if (!token) {
				const results = localSearch(fallbackUsers, query);
				setUsers(results);
				setSource("missing_token");
				setError(null);
				return results;
			}

			setIsLoading(true);
			setError(null);
			try {
				const payload = await searchAdminUsers(
					{ limit: 50, q: query.trim() || undefined },
					token,
				);
				const results = extractPublicApiAdminUsers(payload);
				setUsers(results);
				setSource("live");
				return results;
			} catch (caught) {
				const message =
					caught instanceof Error
						? caught.message
						: "Unable to load public API admin users";
				const results = localSearch(fallbackUsers, query);
				setUsers(results);
				setSource("error");
				setError(message);
				return results;
			} finally {
				setIsLoading(false);
			}
		},
		[fallbackUsers, token],
	);

	useEffect(() => {
		void search();
	}, [search]);

	return { error, isLoading, search, source, users };
}
