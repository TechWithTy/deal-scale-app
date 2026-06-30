"use client";

import { Button } from "@/components/ui/button";
import { updateTeamMember } from "@/lib/api/public-api-dashboard";
import type { TeamMember } from "@/types/userProfile";
import { useState } from "react";
import { toast } from "sonner";

export function TeamMemberRoleForm({
	member,
	token,
}: {
	member: TeamMember;
	token?: string;
}) {
	const [role, setRole] = useState<"admin" | "member">(
		member.role === "admin" ? "admin" : "member",
	);
	const [isSaving, setIsSaving] = useState(false);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!token) return;
		setIsSaving(true);
		try {
			await updateTeamMember(String(member.id), { role }, token);
			toast.success("Team member role updated");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to update team member",
			);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<form
			onSubmit={submit}
			className="max-w-lg space-y-4 rounded-md border p-4"
		>
			<div>
				<h2 className="font-semibold">
					{member.firstName} {member.lastName}
				</h2>
				<p className="text-muted-foreground text-sm">{member.email}</p>
			</div>
			<label className="block text-sm">
				<span className="mb-1 block font-medium">Team role</span>
				<select
					value={role}
					onChange={(event) =>
						setRole(event.target.value as "admin" | "member")
					}
					className="h-10 w-full rounded-md border bg-background px-3"
				>
					<option value="member">Member</option>
					<option value="admin">Admin</option>
				</select>
			</label>
			<p className="text-muted-foreground text-xs">
				The public API currently supports role and status changes only.
			</p>
			<Button type="submit" disabled={!token || isSaving}>
				{isSaving ? "Saving…" : "Save role"}
			</Button>
		</form>
	);
}
