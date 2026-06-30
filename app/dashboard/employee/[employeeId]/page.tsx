"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { TeamMemberRoleForm } from "@/components/tables/employee-tables/TeamMemberRoleForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTeamMembers } from "@/constants/_faker/profile/team/members";
import { usePublicApiTeamMembers } from "@/hooks/usePublicApiTeamMembers";
import type { TeamMember } from "@/types/userProfile";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Employee", link: "/dashboard/employee" },
	{ title: "Edit", link: "/dashboard/employee/:employeeId" },
];

export default function Page() {
	const { employeeId } = useParams();
	const { data: session } = useSession();
	const teamMembers = usePublicApiTeamMembers(
		mockTeamMembers,
		session?.publicApi?.accessToken,
	);
	const teamMember = teamMembers.members.find(
		(member: TeamMember) => String(member.id) === String(employeeId),
	);

	return (
		<ScrollArea className="h-full">
			<div className="flex-1 space-y-4 p-8">
				<Breadcrumbs items={breadcrumbItems} />
				<div className="text-muted-foreground text-xs">
					{teamMembers.source === "live"
						? "Team member loaded from the public API."
						: teamMembers.source === "error"
							? `Using fallback team member: ${teamMembers.error}`
							: "Using fallback team member until a public API token exists."}
				</div>
				{teamMembers.isLoading ? (
					<p className="text-muted-foreground text-sm">Loading team member…</p>
				) : teamMember ? (
					<TeamMemberRoleForm
						member={teamMember}
						token={session?.publicApi?.accessToken}
					/>
				) : (
					<p className="text-destructive text-sm">
						Team member {String(employeeId)} was not found.
					</p>
				)}
			</div>
		</ScrollArea>
	);
}
