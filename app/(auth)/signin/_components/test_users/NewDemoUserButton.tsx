"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { SubscriptionTier } from "@/constants/subscription/tiers";
import type { UserRole } from "@/types/user";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { EditableUser } from "./userHelpers";

interface NewDemoUserButtonProps {
	onCreateUser: (user: EditableUser) => void;
}

const fullCrud = ["create", "read", "update", "delete"] as const;

export function NewDemoUserButton({ onCreateUser }: NewDemoUserButtonProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "password123",
		role: "member" as UserRole,
		tier: "Starter" as SubscriptionTier,
	});

	const handleSubmit = () => {
		if (!formData.name || !formData.email) {
			return;
		}

		const newUser: EditableUser = {
			id: `custom-${Date.now()}`,
			name: formData.name,
			email: formData.email,
			password: formData.password,
			role: formData.role,
			tier: formData.tier,
			isBetaTester: true,
			isPilotTester: false,
			isFreeTier: false,
			permissions: {
				leads: fullCrud,
				campaigns: fullCrud,
			},
			permissionList: [
				"leads:create",
				"leads:read",
				"leads:update",
				"leads:delete",
				"campaigns:create",
				"campaigns:read",
				"campaigns:update",
				"campaigns:delete",
			],
			aiCredits: { allotted: 100, used: 0, resetInDays: 30 },
			leadsCredits: { allotted: 100, used: 0, resetInDays: 30 },
			skipTracesCredits: { allotted: 50, used: 0, resetInDays: 30 },
			demoConfig: {
				companyName: formData.name,
				email: formData.email,
			},
		};

		onCreateUser(newUser);
		setOpen(false);
		setFormData({
			name: "",
			email: "",
			password: "password123",
			role: "member",
			tier: "Starter",
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full">
					<Plus className="mr-2 h-4 w-4" />
					Create New Demo User
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Demo User</DialogTitle>
					<DialogDescription>
						Create a new demo user with custom credentials for testing.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="new-name">Name</Label>
						<Input
							id="new-name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="John Doe"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new-email">Email</Label>
						<Input
							id="new-email"
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							placeholder="john@example.com"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new-password">Password</Label>
						<Input
							id="new-password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							placeholder="password123"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new-role">Role</Label>
						<Select
							value={formData.role}
							onValueChange={(value) =>
								setFormData({ ...formData, role: value as UserRole })
							}
						>
							<SelectTrigger id="new-role">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="manager">Manager</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new-tier">Tier</Label>
						<Select
							value={formData.tier}
							onValueChange={(value) =>
								setFormData({ ...formData, tier: value as SubscriptionTier })
							}
						>
							<SelectTrigger id="new-tier">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Basic">Basic</SelectItem>
								<SelectItem value="Starter">Starter</SelectItem>
								<SelectItem value="Enterprise">Enterprise</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleSubmit}>
						Create User
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
