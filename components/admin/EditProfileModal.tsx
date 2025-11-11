"use client";

import type {
	AdminUser,
	AdminUserRole,
} from "@/components/tables/super-users/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface EditProfileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: AdminUser | null;
	onSave: (user: AdminUser) => void;
}

export default function EditProfileModal({
	open,
	onOpenChange,
	user,
	onSave,
}: EditProfileModalProps) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [role, setRole] = useState<AdminUserRole>("user");
	const [status, setStatus] = useState<
		"active" | "pending" | "disabled" | "failed" | "suspended" | "banned"
	>("active");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			setFirstName(user.firstName || "");
			setLastName(user.lastName || "");
			setEmail(user.email);
			setPhone(user.phone || "");
			setRole(user.role);
			setStatus(user.status || "active");
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			const updatedUser: AdminUser = {
				...user,
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				email,
				phone: phone || undefined,
				role,
				status,
			};

			onSave(updatedUser);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="phone">Phone</Label>
						<Input
							id="phone"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="role">Role</Label>
						<select
							id="role"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							value={role}
							onChange={(e) => setRole(e.target.value as AdminUserRole)}
						>
							<option value="user">User</option>
							<option value="admin">Admin</option>
							<option value="support">Support</option>
						</select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<select
							id="status"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							value={status}
							onChange={(e) =>
								setStatus(
									e.target.value as
										| "active"
										| "pending"
										| "disabled"
										| "failed"
										| "suspended"
										| "banned",
								)
							}
						>
							<option value="active">Active</option>
							<option value="pending">Pending</option>
							<option value="disabled">Disabled</option>
							<option value="failed">Failed</option>
							<option value="suspended">Suspended</option>
							<option value="banned">Banned</option>
						</select>
					</div>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
