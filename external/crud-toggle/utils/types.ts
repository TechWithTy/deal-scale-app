export type CrudKey = "create" | "read" | "update" | "delete";

export type CrudFlags = Record<CrudKey, boolean>;

export interface PermissionItem {
	id: string;
	label: string;
	flags: CrudFlags;
}

export const emptyCrud = (): CrudFlags => ({
	create: false,
	read: false,
	update: false,
	delete: false,
});

export const toggleFlag = (
	flags: CrudFlags,
	key: CrudKey,
	value: boolean,
): CrudFlags => ({
	...flags,
	[key]: value,
});
