"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePublicApiTeamWorkspace } from "@/hooks/usePublicApiTeamWorkspace";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function TeamWorkspacePanel({ token }: { token?: string }) {
	const workspace = usePublicApiTeamWorkspace(token);
	const [name, setName] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setName(workspace.organization?.name ?? "");
	}, [workspace.organization?.name]);

	async function saveOrganization() {
		if (name.trim().length < 2) return;
		setIsSaving(true);
		try {
			await workspace.updateOrganizationName(name.trim());
			toast.success("Organization updated");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to update organization",
			);
		} finally {
			setIsSaving(false);
		}
	}

	if (!token) {
		return (
			<p className="rounded-md border p-4 text-muted-foreground text-sm">
				Public API login is required for organization, invitations, and team
				activity.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<section className="rounded-md border p-4">
				<div className="mb-3">
					<h3 className="font-semibold">Organization</h3>
					<p className="text-muted-foreground text-xs">
						{workspace.organization
							? `${workspace.organization.slug} · ${workspace.organization.memberCount ?? 0} members · ${workspace.organization.availableCredits} available credits`
							: "Organization details unavailable."}
					</p>
				</div>
				<div className="flex gap-2">
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Organization name"
						disabled={!workspace.organization || isSaving}
					/>
					<Button
						type="button"
						onClick={() => void saveOrganization()}
						disabled={
							!workspace.organization || name.trim().length < 2 || isSaving
						}
					>
						Save
					</Button>
				</div>
			</section>

			<div className="grid gap-4 lg:grid-cols-2">
				<section className="rounded-md border">
					<h3 className="border-b p-3 font-semibold">Invitations</h3>
					{workspace.invites.length ? (
						<ul className="divide-y">
							{workspace.invites.map((invite) => (
								<li key={invite.id} className="p-3 text-sm">
									<div className="font-medium">{invite.email}</div>
									<div className="text-muted-foreground text-xs">
										{invite.role} · {invite.status} · expires{" "}
										{new Date(invite.expiresAt).toLocaleDateString()}
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="p-3 text-muted-foreground text-sm">
							No invitations returned.
						</p>
					)}
				</section>

				<section className="rounded-md border">
					<h3 className="border-b p-3 font-semibold">Public API activity</h3>
					{workspace.activity.length ? (
						<ul className="max-h-72 divide-y overflow-y-auto">
							{workspace.activity.map((event) => (
								<li key={event.id} className="p-3 text-sm">
									<div>{event.description}</div>
									<div className="text-muted-foreground text-xs">
										{new Date(event.createdAt).toLocaleString()}
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="p-3 text-muted-foreground text-sm">
							No activity returned.
						</p>
					)}
				</section>
			</div>

			{workspace.isLoading && (
				<p className="text-muted-foreground text-xs">Loading team data…</p>
			)}
			{workspace.error && (
				<p className="text-destructive text-xs">{workspace.error}</p>
			)}
		</div>
	);
}
