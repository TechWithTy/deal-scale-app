"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptTeamInvite } from "@/lib/api/public-api-dashboard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function AcceptInviteForm({ token }: { token: string }) {
	const router = useRouter();
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		try {
			await acceptTeamInvite({
				token,
				...(name.trim() ? { name: name.trim() } : {}),
				...(password ? { password } : {}),
			});
			toast.success("Invitation accepted");
			router.push("/signin");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to accept invitation",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={submit} className="space-y-4">
			<Input
				value={name}
				onChange={(event) => setName(event.target.value)}
				placeholder="Full name (new accounts)"
				autoComplete="name"
			/>
			<Input
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				placeholder="Password (new accounts)"
				type="password"
				minLength={8}
				autoComplete="new-password"
			/>
			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Accepting…" : "Accept invitation"}
			</Button>
		</form>
	);
}
