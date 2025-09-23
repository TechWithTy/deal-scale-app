export type UserPermission =
	| "GenerateLeads"
	| "StartCampaigns"
	| "ViewReports"
	| "ManageTeam"
	| "ManageSubscription"
	| "AccessAI"
	| "EditCompanyProfile"
	| "MoveCompanyTasks";

export type PermissionSet = Partial<Record<UserPermission, boolean>>;

export function hasPermission(
	perms: PermissionSet,
	key: UserPermission,
): boolean {
	return Boolean(perms?.[key]);
}
