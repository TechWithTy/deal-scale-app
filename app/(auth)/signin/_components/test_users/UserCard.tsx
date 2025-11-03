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
import {
	getPermissionsForRole,
	getRoleLabelForTestUser,
	ROLE_SELECT_OPTIONS,
} from "./userHelpers";
import type { EditableUser } from "./userHelpers";
import type { UserRole } from "@/types/user";
import type { CreditsProps } from "./CreditsComponent";
import type { PermissionsEditorProps } from "./PermissionsEditor";
import { CreditsComponent } from "./CreditsComponent";
import { PermissionsEditor } from "./PermissionsEditor";
import { DemoConfigEditor } from "./DemoConfigEditor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SubscriptionTier } from "@/constants/subscription/tiers";
import type { DemoConfig } from "@/types/user";

interface UserCardProps {
	user: EditableUser;
	onUpdateUser: (
		id: string,
		updater: (user: EditableUser) => EditableUser,
	) => void;
	onLogin: (user: EditableUser) => void;
}

export function UserCard({ user, onUpdateUser, onLogin }: UserCardProps) {
	const handleRoleChange = (role: UserRole) => {
		onUpdateUser(user.id, (u: EditableUser) => {
			const permissions = getPermissionsForRole(role);

			return {
				...u,
				role,
				// Adjust permissions based on role selection
				permissionList: permissions.list,
				permissions: permissions.matrix,
			};
		});
	};

	const roleLabel = getRoleLabelForTestUser(user.role);
	const roleAccentClass =
		user.role === "admin" || user.role === "platform_admin"
			? "bg-primary"
			: "bg-accent";

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
						className={`h-3 w-3 rounded-full ${roleAccentClass}`}
					/>
					{user.name}
				</CardTitle>
				<CardDescription>
					{user.email} · {roleLabel}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{/* Login Credentials */}
					<div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
						<Label className="text-xs font-semibold text-muted-foreground">
							Login Credentials
						</Label>
						<div className="space-y-2">
							<div className="space-y-1">
								<Label
									htmlFor={`email-${user.id}`}
									className="text-xs text-muted-foreground"
								>
									Email
								</Label>
								<Input
									id={`email-${user.id}`}
									type="email"
									value={user.email}
									onChange={(e) =>
										onUpdateUser(user.id, (u: EditableUser) => ({
											...u,
											email: e.target.value,
										}))
									}
									placeholder="user@example.com"
									className="h-8 text-sm"
								/>
							</div>
							<div className="space-y-1">
								<Label
									htmlFor={`password-${user.id}`}
									className="text-xs text-muted-foreground"
								>
									Password
								</Label>
								<Input
									id={`password-${user.id}`}
									type="text"
									value={user.password || "password123"}
									onChange={(e) =>
										onUpdateUser(user.id, (u: EditableUser) => ({
											...u,
											password: e.target.value,
										}))
									}
									placeholder="password123"
									className="h-8 font-mono text-sm"
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between gap-2 text-sm">
						<span className="font-medium">Role:</span>
						<Select
							aria-label="Select role"
							value={user.role}
							onValueChange={(value) => handleRoleChange(value as UserRole)}
						>
							<SelectTrigger className="w-32 bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ROLE_SELECT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
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

					<DemoConfigEditor
						demoConfig={user.demoConfig}
						userId={user.id}
						onUpdate={(config: DemoConfig) =>
							onUpdateUser(user.id, (u: EditableUser) => ({
								...u,
								demoConfig: config,
							}))
						}
					/>
				</div>
			</CardContent>
			<CardFooter>
				<Button type="button" onClick={() => onLogin(user)} className="w-full">
					{`Login as ${roleLabel} (${user.tier})`}
				</Button>
			</CardFooter>
		</Card>
	);
}
