"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { MainEmployeeForm } from "@/components/forms/steppers/employee-form/MainEmployeeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import React from "react";
import { teamMemberToUpdatePasswordFormValues } from "@/utils/teamMemberToFormValues";
import type { TeamMemberUpdatePasswordFormValues } from "@/types/zod/userSetup/team-member-form-schema";
import type { TeamMember } from "@/types/userProfile";
import { mockTeamMembers } from "@/constants/_faker/profile/team/members";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Employee", link: "/dashboard/employee" },
	{ title: "Edit", link: "/dashboard/employee/:employeeId" },
];

export default function Page() {
	const { employeeId } = useParams();
	const allMembers = mockTeamMembers;

	console.log("[DEBUG] employeeId param:", employeeId);
	console.log("[DEBUG] All team members:", allMembers);
	const teamMember = allMembers.find(
		(m: TeamMember) => String(m.id) === String(employeeId),
	);
	const memberIds = allMembers.map((m: TeamMember) => String(m.id)) || [];
	const hasMatch = memberIds.includes(String(employeeId));

	let initialData: TeamMemberUpdatePasswordFormValues | undefined = undefined;
	let error: string | null = null;
	if (teamMember) {
		try {
			initialData = teamMemberToUpdatePasswordFormValues(teamMember);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	// Loading state for async data
	if (!allMembers) {
		return (
			<ScrollArea className="h-full">
				<div className="flex-1 space-y-4 p-8">
					<Breadcrumbs items={breadcrumbItems} />
					<div className="font-semibold text-blue-600">
						Loading team members...
					</div>
				</div>
			</ScrollArea>
		);
	}

	if (!teamMember || !initialData || error) {
		return (
			<ScrollArea className="h-full">
				<div className="flex-1 space-y-4 p-8">
					<Breadcrumbs items={breadcrumbItems} />
					<div className="font-semibold text-red-600">
						{error ? (
							`Error: ${error}`
						) : !teamMember ? (
							<span>
								Team member not found.
								<br />
								<strong>Available member IDs:</strong> {memberIds.join(", ")}
								<br />
								<strong>Current employeeId:</strong> {String(employeeId)}
								<br />
								<strong>ID match found:</strong> {hasMatch ? "Yes" : "No"}
							</span>
						) : (
							"Invalid team member data."
						)}
					</div>
				</div>
			</ScrollArea>
		);
	}

	return (
		<ScrollArea className="h-full">
			<div className="flex-1 space-y-4 p-8">
				<Breadcrumbs items={breadcrumbItems} />
				<MainEmployeeForm mode="edit" initialData={initialData} />
			</div>
		</ScrollArea>
	);
}
