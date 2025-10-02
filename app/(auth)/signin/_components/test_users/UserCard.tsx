"use client";

import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";
import { useTheme } from "next-themes";
import { COMMON_PERMISSIONS } from "./userHelpers";
import { updateCredits, formatCreditsDisplay } from "./creditUtils";
import type { EditableUser } from "./userHelpers";
import type { Credits } from "./creditUtils";
import type { CreditsProps } from "./CreditsComponent";
import type { PermissionsEditorProps } from "./PermissionsEditor";
import { CreditsComponent } from "./CreditsComponent";
import { PermissionsEditor } from "./PermissionsEditor";

interface UserCardProps {
	user: EditableUser;
	onUpdateUser: (
		id: string,
		updater: (user: EditableUser) => EditableUser,
	) => void;
	onLogin: (user: EditableUser) => void;
}

export function UserCard({ user, onUpdateUser, onLogin }: UserCardProps) {
	const { theme } = useTheme();

	const handleRoleChange = (role: "admin" | "member") => {
		onUpdateUser(user.id, (u: EditableUser) => ({
			...u,
			role,
			// Adjust permissions based on role selection
			permissionList:
				role === "admin"
					? ["users:create", "users:read", "users:update", "users:delete"]
					: ["users:read"],
		}));
	};

	const handleTierChange = (tier: "Free" | "Starter" | "Enterprise") => {
		onUpdateUser(user.id, (u: EditableUser) => ({
			...u,
			tier,
		}));
	};

	const handleCreditsChange: CreditsProps["onChange"] = (
		field: "allotted" | "used" | "resetInDays",
		value: number,
	) => {
		onUpdateUser(user.id, (u: EditableUser) => {
			const next = updateCredits(u.aiCredits, field, value);
			return { ...u, aiCredits: next };
		});
	};

	const handleLeadsChange: CreditsProps["onChange"] = (
		field: "allotted" | "used" | "resetInDays",
		value: number,
	) => {
		onUpdateUser(user.id, (u: EditableUser) => {
			const next = updateCredits(u.leadsCredits, field, value);
			return { ...u, leadsCredits: next };
		});
	};

	const handleSkipTracesChange: CreditsProps["onChange"] = (
		field: "allotted" | "used" | "resetInDays",
		value: number,
	) => {
		onUpdateUser(user.id, (u: EditableUser) => {
			const next = updateCredits(u.skipTracesCredits, field, value);
			return { ...u, skipTracesCredits: next };
		});
	};

	return (
		<Card key={user.id} className="w-full border-border shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div
						className={`h-3 w-3 rounded-full ${
							user.role === "admin" ? "bg-green-500" : "bg-blue-500"
						}`}
					/>
					{user.name}
				</CardTitle>
				<CardDescription>{user.email}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm">
						<span className="font-medium">Role:</span>
						<select
							value={user.role}
							onChange={(e) =>
								handleRoleChange(e.target.value as "admin" | "member")
							}
							className="rounded-md border bg-background"
						>
							<option value="admin">admin</option>
							<option value="member">member</option>
						</select>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<span className="font-medium">Tier:</span>
						<Select value={user.tier} onValueChange={handleTierChange}>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Free">Free</SelectItem>
								<SelectItem value="Starter">Starter</SelectItem>
								<SelectItem value="Enterprise">Enterprise</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<CreditsComponent
						credits={user.aiCredits}
						onChange={handleCreditsChange}
						title="AI"
					/>
					<CreditsComponent
						credits={user.leadsCredits}
						onChange={handleLeadsChange}
						title="Leads"
					/>
					<CreditsComponent
						credits={user.skipTracesCredits}
						onChange={handleSkipTracesChange}
						title="Skip Traces"
					/>
					<PermissionsEditor
						user={user}
						onUpdateUser={(updater) =>
							onUpdateUser(
								user.id,
								updater as (user: EditableUser) => EditableUser,
							)
						}
					/>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					type="button"
					onClick={() => onLogin(user)}
					className="w-full"
					variant={theme === "dark" ? "outline" : "default"}
				>
					{user.role === "admin"
						? `Login as Admin (${user.tier})`
						: `Login as Regular (${user.tier})`}
				</Button>
			</CardFooter>
		</Card>
	);
}
