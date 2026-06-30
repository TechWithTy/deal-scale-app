"use client";

import { getTeamMembers } from "@/lib/api/public-api-dashboard";
import { TEAM_MEMBER_DELETED_EVENT } from "@/lib/team/member-events";
import { extractPublicApiTeamMembers } from "@/lib/team/public-api-team-members";
import type { TeamMember } from "@/types/userProfile";
import { useEffect, useState } from "react";

export type PublicApiTeamMembersSource =
	| "error"
	| "fallback"
	| "live"
	| "missing_token";

export function usePublicApiTeamMembers(
	fallbackMembers: TeamMember[],
	token?: string,
) {
	const [members, setMembers] = useState<TeamMember[]>(fallbackMembers);
	const [source, setSource] =
		useState<PublicApiTeamMembersSource>("missing_token");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function loadMembers() {
			if (!token) {
				setMembers(fallbackMembers);
				setSource("missing_token");
				setError(null);
				return;
			}

			setIsLoading(true);
			setError(null);
			try {
				const payload = await getTeamMembers(token);
				const nextMembers = extractPublicApiTeamMembers(payload);
				if (isMounted) {
					setMembers(nextMembers.length ? nextMembers : fallbackMembers);
					setSource(nextMembers.length ? "live" : "fallback");
				}
			} catch (caught) {
				if (isMounted) {
					setMembers(fallbackMembers);
					setSource("error");
					setError(
						caught instanceof Error
							? caught.message
							: "Unable to load team members",
					);
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		void loadMembers();
		return () => {
			isMounted = false;
		};
	}, [fallbackMembers, token]);

	useEffect(() => {
		const removeDeletedMember = (event: Event) => {
			const memberId = (event as CustomEvent<string>).detail;
			if (memberId) {
				setMembers((current) =>
					current.filter((member) => String(member.id) !== String(memberId)),
				);
			}
		};
		window.addEventListener(TEAM_MEMBER_DELETED_EVENT, removeDeletedMember);
		return () =>
			window.removeEventListener(
				TEAM_MEMBER_DELETED_EVENT,
				removeDeletedMember,
			);
	}, []);

	return { error, isLoading, members, source };
}
