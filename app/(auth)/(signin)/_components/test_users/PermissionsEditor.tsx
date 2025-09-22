"use client";

import type { EditableUser } from "./userHelpers";
import { CrudToggle } from "external/crud-toggle/components/CrudToggle";
import type { CrudFlags } from "external/crud-toggle/utils/types";

export interface PermissionsEditorProps {
	user: EditableUser;
	onUpdateUser: (updater: (user: EditableUser) => EditableUser) => void;
}

const ENTITIES = [
	"users",
	"leads",
	"campaigns",
	"reports",
	"team",
	"subscription",
	"ai",
	"tasks",
	"company",
] as const;

type Entity = (typeof ENTITIES)[number];

const toFlags = (perms: string[], entity: Entity): CrudFlags => ({
	create: perms.includes(`${entity}:create`),
	read: perms.includes(`${entity}:read`),
	update: perms.includes(`${entity}:update`),
	delete: perms.includes(`${entity}:delete`),
});

const fromFlags = (flags: CrudFlags, entity: Entity): string[] => {
	const next: string[] = [];
	if (flags.create) next.push(`${entity}:create`);
	if (flags.read) next.push(`${entity}:read`);
	if (flags.update) next.push(`${entity}:update`);
	if (flags.delete) next.push(`${entity}:delete`);
	return next;
};

export function PermissionsEditor({
	user,
	onUpdateUser,
}: PermissionsEditorProps) {
	const handleChange = (entity: Entity, flags: CrudFlags) => {
		onUpdateUser((u) => {
			// Remove existing entity permissions and add new from flags
			const filtered = u.permissions.filter((p) => !p.startsWith(`${entity}:`));
			const added = fromFlags(flags, entity);
			return { ...u, permissions: [...filtered, ...added] };
		});
	};

	return (
		<div className="mt-4">
			<div className="mb-2 font-medium text-sm">
				Edit Permissions: Create/Read/Update/Delete
			</div>
			<div className="max-h-64 space-y-3 overflow-y-auto rounded-md border border-border bg-card p-3 pr-1">
				{ENTITIES.map((entity) => {
					const flags = toFlags(user.permissions, entity);
					const label =
						entity === "ai"
							? "AI"
							: entity === "company"
								? "Company Profile"
								: entity.charAt(0).toUpperCase() + entity.slice(1);
					return (
						<div key={entity} className="flex items-center justify-between">
							<span className="text-foreground text-sm">{label}</span>
							<CrudToggle
								value={flags}
								onChange={(next) => handleChange(entity, next)}
								size="sm"
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
