"use client";

import {
	type PublicApiAdminDetailSource,
	mapPublicApiAdminDirectoryUser,
} from "@/lib/admin/public-api-admin-users";
import {
	type AdminDirectoryUser,
	getAdminDirectoryUser,
} from "@/lib/admin/user-directory";
import { getAdminUserDetail } from "@/lib/api/public-api-dashboard";
import { useEffect, useState } from "react";

export function usePublicApiAdminUserDetail(
	userId: string | null,
	token?: string,
	enabled = true,
) {
	const [user, setUser] = useState<AdminDirectoryUser | null>(null);
	const [loading, setLoading] = useState(false);
	const [source, setSource] =
		useState<PublicApiAdminDetailSource>("missing_token");

	useEffect(() => {
		if (!enabled || !userId) {
			setUser(null);
			setLoading(false);
			setSource("missing_token");
			return;
		}

		let alive = true;
		const fallback = getAdminDirectoryUser(userId);
		setLoading(true);

		if (!token) {
			setUser(fallback);
			setSource("missing_token");
			setLoading(false);
			return;
		}

		getAdminUserDetail(userId, token)
			.then((payload) => {
				if (!alive) return;
				setUser(mapPublicApiAdminDirectoryUser(payload, fallback));
				setSource("live");
			})
			.catch(() => {
				if (!alive) return;
				setUser(fallback);
				setSource("fallback");
			})
			.finally(() => {
				if (alive) setLoading(false);
			});

		return () => {
			alive = false;
		};
	}, [enabled, token, userId]);

	return { loading, source, user, setUser };
}
