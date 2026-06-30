"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTeamInvite } from "@/lib/api/public-api-dashboard";
import { useState } from "react";
import { toast } from "sonner";

export function TeamInviteForm({
	token,
	onSuccess,
}: {
	token?: string;
	onSuccess?: () => void;
}) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"admin" | "member">("member");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!token) {
			toast.error("Public API login required.");
			return;
		}
		setIsSubmitting(true);
		try {
			await createTeamInvite({ email, expires_in_days: 7, role }, token);
			toast.success("Team invitation sent");
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to send invitation",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={submit} className="space-y-4">
			<Input
				type="email"
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				placeholder="teammate@example.com"
				required
			/>
			<label className="block text-sm">
				<span className="mb-1 block font-medium">Role</span>
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
			<Button type="submit" disabled={!token || isSubmitting}>
				{isSubmitting ? "Sending…" : "Send invitation"}
			</Button>
		</form>
	);
}
