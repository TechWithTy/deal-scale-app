"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { users } from "@/lib/mock-db";
import { uuid } from "uuidv4";
import type { User as UserType } from "@/types/user";
import { signIn } from "next-auth/react";
import { useState } from "react";

// Extend the User type to ensure password is required for test users
type TestUser = Omit<UserType, "password"> & {
	password: string; // Make password required for test users
};

// Type assertion to ensure users from mock-db match our TestUser type
const testUsers = users as unknown as TestUser[];

export function TestUsers() {
	const { theme } = useTheme();
	const router = useRouter();

	// Local editable user shape including simple credit fields
	type Credits = { allotted: number; used: number; resetInDays: number };
	type EditableUser = TestUser & {
		aiCredits: Credits;
		leadsCredits: Credits;
		skipTracesCredits: Credits;
		newPermission?: string;
	};

	// Initialize with sensible defaults by role
	const [editableUsers, setEditableUsers] = useState<EditableUser[]>(() =>
		testUsers.map((u) => ({
			...u,
			aiCredits:
				// Prefer subscription credits if available (UserType includes subscription)
				u.subscription?.aiCredits ??
				(u.role === "admin"
					? { allotted: 1000, used: 250, resetInDays: 7 }
					: { allotted: 500, used: 100, resetInDays: 7 }),
			leadsCredits:
				u.subscription?.leads ??
				(u.role === "admin"
					? { allotted: 500, used: 120, resetInDays: 30 }
					: { allotted: 100, used: 20, resetInDays: 30 }),
			skipTracesCredits:
				u.subscription?.skipTraces ??
				(u.role === "admin"
					? { allotted: 200, used: 50, resetInDays: 30 }
					: { allotted: 50, used: 10, resetInDays: 30 }),
		})),
	);

	const updateUser = (
		id: string,
		updater: (u: EditableUser) => EditableUser,
	) => {
		setEditableUsers((prev) => prev.map((u) => (u.id === id ? updater(u) : u)));
	};

	const handleRoleChange = (id: string, role: "admin" | "user") => {
		updateUser(id, (u) => ({
			...u,
			role,
			// Adjust permissions based on role selection
			permissions:
				role === "admin"
					? ["users:create", "users:read", "users:update", "users:delete"]
					: ["users:read"],
		}));
	};

	const handleCreditsChange = (
		id: string,
		field: "allotted" | "used" | "resetInDays",
		value: number,
	) => {
		updateUser(id, (u) => {
			const next = {
				...u.aiCredits,
				[field]: Math.max(0, Number.isFinite(value) ? value : 0),
			} as Credits;
			// Ensure used never exceeds allotted
			if (field === "allotted" && next.used > next.allotted) {
				next.used = next.allotted;
			}
			if (field === "used" && next.used > next.allotted) {
				next.used = next.allotted;
			}
			return { ...u, aiCredits: next };
		});
	};

	const handleLeadsChange = (
		id: string,
		field: "allotted" | "used" | "resetInDays",
		value: number,
	) => {
		updateUser(id, (u) => {
			const next = {
				...u.leadsCredits,
				[field]: Math.max(0, Number.isFinite(value) ? value : 0),
			} as Credits;
			if (field === "allotted" && next.used > next.allotted)
				next.used = next.allotted;
			if (field === "used" && next.used > next.allotted)
				next.used = next.allotted;
			return { ...u, leadsCredits: next };
		});
	};

	const handleSkipTracesChange = (
		id: string,
		field: "allotted" | "used" | "resetInDays",
		value: number,
	) => {
		updateUser(id, (u) => {
			const next = {
				...u.skipTracesCredits,
				[field]: Math.max(0, Number.isFinite(value) ? value : 0),
			} as Credits;
			if (field === "allotted" && next.used > next.allotted)
				next.used = next.allotted;
			if (field === "used" && next.used > next.allotted)
				next.used = next.allotted;
			return { ...u, skipTracesCredits: next };
		});
	};

	const handlePermissionInput = (id: string, value: string) => {
		updateUser(id, (u) => ({ ...u, newPermission: value }));
	};

	const addPermission = (id: string) => {
		updateUser(id, (u) => {
			const p = (u.newPermission ?? "").trim();
			if (!p) return u;
			if (u.permissions.includes(p)) return { ...u, newPermission: "" };
			return { ...u, permissions: [...u.permissions, p], newPermission: "" };
		});
	};

	const removePermission = (id: string, perm: string) => {
		updateUser(id, (u) => ({
			...u,
			permissions: u.permissions.filter((x) => x !== perm),
		}));
	};

	// Quick add common permissions via chips
	const COMMON_PERMISSIONS = [
		"users:create",
		"users:read",
		"users:update",
		"users:delete",
	] as const;

	const addPermissionDirect = (id: string, perm: string) => {
		updateUser(id, (u) =>
			u.permissions.includes(perm)
				? u
				: { ...u, permissions: [...u.permissions, perm] },
		);
	};

	const handleLogin = async (user: EditableUser) => {
		try {
			await signIn("credentials", {
				email: user.email,
				password: user.password,
				// propagate current UI selections into credentials for authorize()
				role: user.role,
				permissions: JSON.stringify(user.permissions),
				aiAllotted: String(user.aiCredits.allotted),
				aiUsed: String(user.aiCredits.used),
				leadsAllotted: String(user.leadsCredits.allotted),
				leadsUsed: String(user.leadsCredits.used),
				skipAllotted: String(user.skipTracesCredits.allotted),
				skipUsed: String(user.skipTracesCredits.used),
				callbackUrl: "/dashboard",
				redirect: true,
			});
		} catch (error) {
			toast.error("An error occurred during login");
			console.error("Login error:", error);
		}
	};

	return (
		<div className="mx-auto mt-8 w-full max-w-md">
			<h2 className="mb-6 text-center font-semibold text-xl">Test Users</h2>
			<div className="flex flex-col gap-6">
				{editableUsers.map((user) => (
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
											handleRoleChange(
												user.id,
												e.target.value as "admin" | "user",
											)
										}
										className="rounded-md border bg-background"
									>
										<option value="admin">admin</option>
										<option value="user">user</option>
									</select>
								</div>
								<div className="flex flex-col gap-2">
									<span className="font-medium text-sm">Permissions:</span>
									{user.permissions.map((permission, i) => (
										<span
											key={permission + uuid()}
											className="mr-1 mb-1 inline-block rounded-full bg-muted/80 px-2 py-0.5 text-xs"
										>
											{permission}
										</span>
									))}
								</div>

								<div className="mt-3 grid grid-cols-2 gap-3">
									<label className="flex flex-col gap-1 text-sm">
										<span className="font-medium">AI Allotted</span>
										<input
											type="number"
											min={0}
											value={user.aiCredits.allotted}
											onChange={(e) =>
												handleCreditsChange(
													user.id,
													"allotted",
													Number(e.target.value),
												)
											}
											className="rounded-md border bg-background px-2 py-1"
										/>
									</label>
									<label className="flex flex-col gap-1 text-sm">
										<span className="font-medium">AI Used</span>
										<input
											type="number"
											min={0}
											value={user.aiCredits.used}
											onChange={(e) =>
												handleCreditsChange(
													user.id,
													"used",
													Number(e.target.value),
												)
											}
											className="rounded-md border bg-background px-2 py-1"
										/>
									</label>
								</div>
								<div className="mt-2 text-sm">
									<span className="font-medium">AI Credits:</span>
									<span className="ml-2 text-muted-foreground">
										{user.aiCredits.used} / {user.aiCredits.allotted}
									</span>
								</div>

								{/* Leads Credits */}
								<div className="mt-4 grid grid-cols-2 gap-3">
									<label className="flex flex-col gap-1 text-sm">
										<span className="font-medium">Leads Allotted</span>
										<input
											type="number"
											min={0}
											value={user.leadsCredits.allotted}
											onChange={(e) =>
												handleLeadsChange(
													user.id,
													"allotted",
													Number(e.target.value),
												)
											}
											className="rounded-md border bg-background px-2 py-1"
										/>
									</label>
									<label className="flex flex-col gap-1 text-sm">
										<span className="font-medium">Leads Used</span>
										<input
											type="number"
											min={0}
											value={user.leadsCredits.used}
											onChange={(e) =>
												handleLeadsChange(
													user.id,
													"used",
													Number(e.target.value),
												)
											}
											className="rounded-md border bg-background px-2 py-1"
										/>
									</label>
								</div>
								<div className="mt-2 text-sm">
									<span className="font-medium">Leads:</span>
									<span className="ml-2 text-muted-foreground">
										{user.leadsCredits.used} / {user.leadsCredits.allotted}
									</span>
								</div>

								{/* Skip Traces Credits */}
								<div className="mt-4 grid grid-cols-2 gap-3">
									<label className="flex flex-col gap-1 text-sm">
										<span className="font-medium">Skip Traces Allotted</span>
										<input
											type="number"
											min={0}
											value={user.skipTracesCredits.allotted}
											onChange={(e) =>
												handleSkipTracesChange(
													user.id,
													"allotted",
													Number(e.target.value),
												)
											}
											className="rounded-md border bg-background px-2 py-1"
										/>
									</label>
									<label className="flex flex-col gap-1 text-sm">
										<span className="font-medium">Skip Traces Used</span>
										<input
											type="number"
											min={0}
											value={user.skipTracesCredits.used}
											onChange={(e) =>
												handleSkipTracesChange(
													user.id,
													"used",
													Number(e.target.value),
												)
											}
											className="rounded-md border bg-background px-2 py-1"
										/>
									</label>
								</div>
								<div className="mt-2 text-sm">
									<span className="font-medium">Skip Traces:</span>
									<span className="ml-2 text-muted-foreground">
										{user.skipTracesCredits.used} /{" "}
										{user.skipTracesCredits.allotted}
									</span>
								</div>

								{/* Permissions editor */}
								<div className="mt-4">
									<div className="mb-2 font-medium text-sm">
										Edit Permissions
									</div>
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="permission e.g. users:export"
											value={user.newPermission ?? ""}
											onChange={(e) =>
												handlePermissionInput(user.id, e.target.value)
											}
											className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
										/>
										<Button
											type="button"
											onClick={() => addPermission(user.id)}
											size="sm"
										>
											Add
										</Button>
									</div>
									{/* Quick-add chips */}
									<div className="mt-3 flex flex-wrap gap-2">
										{COMMON_PERMISSIONS.map((perm) => (
											<button
												key={`chip-${perm}`}
												type="button"
												onClick={() => addPermissionDirect(user.id, perm)}
												disabled={user.permissions.includes(perm)}
												className={`rounded-full px-2 py-0.5 text-xs border ${
													user.permissions.includes(perm)
														? "opacity-50 cursor-not-allowed"
														: "hover:bg-muted/70"
												}`}
												aria-disabled={user.permissions.includes(perm)}
												aria-label={`add ${perm}`}
											>
												{perm}
											</button>
										))}
									</div>
									<div className="mt-2 flex flex-wrap gap-2">
										{user.permissions.map((perm) => (
											<span
												key={perm}
												className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-xs"
											>
												{perm}
												<button
													type="button"
													aria-label={`remove ${perm}`}
													className="ml-1 rounded bg-destructive/10 px-1 text-destructive hover:bg-destructive/20"
													onClick={() => removePermission(user.id, perm)}
												>
													×
												</button>
											</span>
										))}
									</div>
									{user.permissions.length === 0 && (
										<div className="mt-2 text-xs text-muted-foreground">
											No permissions assigned. Use chips above to quickly add
											defaults.
										</div>
									)}
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								type="button"
								onClick={() => handleLogin(user)}
								className="w-full"
								variant={theme === "dark" ? "outline" : "default"}
							>
								{user.role === "admin" ? "Login as Admin" : "Login as Regular"}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
