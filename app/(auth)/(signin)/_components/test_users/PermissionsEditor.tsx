"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { COMMON_PERMISSIONS } from "./userHelpers";
import type { EditableUser } from "./userHelpers";

export interface PermissionsEditorProps {
	user: EditableUser;
	onUpdateUser: (updater: (user: EditableUser) => EditableUser) => void;
}

export function PermissionsEditor({
	user,
	onUpdateUser,
}: PermissionsEditorProps) {
	const handlePermissionInput = (value: string) => {
		onUpdateUser((u) => ({ ...u, newPermission: value }));
	};

	const addPermission = () => {
		onUpdateUser((u) => {
			const p = (u.newPermission ?? "").trim();
			if (!p) return u;
			if (u.permissions.includes(p)) return { ...u, newPermission: "" };
			return { ...u, permissions: [...u.permissions, p], newPermission: "" };
		});
	};

	const removePermission = (perm: string) => {
		onUpdateUser((u) => ({
			...u,
			permissions: u.permissions.filter((x) => x !== perm),
		}));
	};

	const addPermissionDirect = (perm: string) => {
		onUpdateUser((u) =>
			u.permissions.includes(perm)
				? u
				: { ...u, permissions: [...u.permissions, perm] },
		);
	};

	return (
		<div className="mt-4">
			<div className="mb-2 font-medium text-sm">Edit Permissions</div>
			<div className="flex gap-2">
				<input
					type="text"
					placeholder="permission e.g. users:export"
					value={user.newPermission ?? ""}
					onChange={(e) => handlePermissionInput(e.target.value)}
					className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
				/>
				<Button type="button" onClick={addPermission} size="sm">
					Add
				</Button>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				{COMMON_PERMISSIONS.map((perm) => (
					<button
						key={`chip-${perm}`}
						type="button"
						onClick={() => addPermissionDirect(perm)}
						disabled={user.permissions.includes(perm)}
						className={`rounded-full border px-2 py-0.5 text-xs ${
							user.permissions.includes(perm)
								? "cursor-not-allowed opacity-50"
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
							onClick={() => removePermission(perm)}
						>
							×
						</button>
					</span>
				))}
			</div>
			{user.permissions.length === 0 && (
				<div className="mt-2 text-muted-foreground text-xs">
					No permissions assigned. Use chips above to quickly add defaults.
				</div>
			)}
		</div>
	);
}
