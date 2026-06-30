"use client";

import {
	getTeamActivity,
	getTeamInvites,
	getTeamOrganization,
	updateTeamOrganization,
} from "@/lib/api/public-api-dashboard";
import {
	type PublicApiOrganization,
	type PublicApiTeamActivity,
	type PublicApiTeamInvite,
	extractPublicApiTeamActivity,
	extractPublicApiTeamInvites,
	mapPublicApiOrganization,
} from "@/lib/team/public-api-team-workspace";
import { useCallback, useEffect, useState } from "react";

export function usePublicApiTeamWorkspace(token?: string) {
	const [organization, setOrganization] =
		useState<PublicApiOrganization | null>(null);
	const [invites, setInvites] = useState<PublicApiTeamInvite[]>([]);
	const [activity, setActivity] = useState<PublicApiTeamActivity[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		if (!token) {
			setOrganization(null);
			setInvites([]);
			setActivity([]);
			return;
		}

		setIsLoading(true);
		setError(null);
		const results = await Promise.allSettled([
			getTeamOrganization(token),
			getTeamInvites(token),
			getTeamActivity({ limit: 50 }, token),
		]);
		const [organizationResult, invitesResult, activityResult] = results;
		if (organizationResult.status === "fulfilled") {
			setOrganization(mapPublicApiOrganization(organizationResult.value));
		}
		if (invitesResult.status === "fulfilled") {
			setInvites(extractPublicApiTeamInvites(invitesResult.value));
		}
		if (activityResult.status === "fulfilled") {
			setActivity(extractPublicApiTeamActivity(activityResult.value));
		}
		if (results.every((result) => result.status === "rejected")) {
			setError("Unable to load team workspace data.");
		}
		setIsLoading(false);
	}, [token]);

	useEffect(() => {
		void load();
	}, [load]);

	const updateOrganizationName = useCallback(
		async (name: string) => {
			if (!token) throw new Error("Public API login required.");
			const payload = await updateTeamOrganization({ name }, token);
			const updated = mapPublicApiOrganization(payload);
			if (updated) setOrganization(updated);
			else
				setOrganization((current) => (current ? { ...current, name } : null));
		},
		[token],
	);

	return {
		activity,
		error,
		invites,
		isLoading,
		organization,
		reload: load,
		updateOrganizationName,
	};
}
