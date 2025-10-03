"use client";

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
import { updateCredits } from "./creditUtils";
import type { EditableUser } from "./userHelpers";
import type { CreditsProps } from "./CreditsComponent";
import type { PermissionsEditorProps } from "./PermissionsEditor";
import { CreditsComponent } from "./CreditsComponent";
import { PermissionsEditor } from "./PermissionsEditor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { SubscriptionTier } from "@/constants/subscription/tiers";

interface UserCardProps {
	user: EditableUser;
	onUpdateUser: (
		id: string,
		updater: (user: EditableUser) => EditableUser,
	) => void;
	onLogin: (user: EditableUser) => void;
}

export function UserCard({ user, onUpdateUser, onLogin }: UserCardProps) {
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

	const handleTierChange = (tier: SubscriptionTier) => {
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
		<Card
			key={user.id}
			className="w-full border-border bg-card text-card-foreground shadow-sm"
		>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div
						aria-hidden
						className={`h-3 w-3 rounded-full ${
							user.role === "admin" ? "bg-primary" : "bg-accent"
						}`}
					/>
					{user.name}
				</CardTitle>
				<CardDescription>{user.email}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2 text-sm">
						<span className="font-medium">Role:</span>
						<Select
							aria-label="Select role"
							value={user.role}
							onValueChange={handleRoleChange}
						>
							<SelectTrigger className="w-32 bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="member">Member</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between gap-2 text-sm">
						<span className="font-medium">Tier:</span>
						<Select
							aria-label="Select subscription tier"
							value={user.tier}
							onValueChange={handleTierChange}
						>
							<SelectTrigger className="w-32 bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Basic">Basic</SelectItem>
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
					<div className="grid gap-3">
						<div className="flex items-center justify-between">
							<Label
								htmlFor={`beta-${user.id}`}
								className="text-sm font-medium"
							>
								Beta tester
							</Label>
							<Switch
								id={`beta-${user.id}`}
								checked={Boolean(user.isBetaTester)}
								onCheckedChange={(checked) =>
									onUpdateUser(user.id, (u: EditableUser) => ({
										...u,
										isBetaTester: checked,
									}))
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label
								htmlFor={`pilot-${user.id}`}
								className="text-sm font-medium"
							>
								Pilot tester
							</Label>
							<Switch
								id={`pilot-${user.id}`}
								checked={Boolean(user.isPilotTester)}
								onCheckedChange={(checked) =>
									onUpdateUser(user.id, (u: EditableUser) => ({
										...u,
										isPilotTester: checked,
									}))
								}
							/>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button type="button" onClick={() => onLogin(user)} className="w-full">
					{user.role === "admin"
						? `Login as Admin (${user.tier})`
						: `Login as Regular (${user.tier})`}
				</Button>
			</CardFooter>
		</Card>
	);
}
