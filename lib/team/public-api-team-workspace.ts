export interface PublicApiOrganization {
	availableCredits: number;
	id: string;
	memberCount: number | null;
	name: string;
	slug: string;
}

export interface PublicApiTeamInvite {
	email: string;
	expiresAt: string;
	id: string;
	role: string;
	status: string;
}

export interface PublicApiTeamActivity {
	createdAt: string;
	description: string;
	id: string;
	type: string;
	userId: string;
}

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asString(value: unknown) {
	return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function mapPublicApiOrganization(
	value: unknown,
): PublicApiOrganization | null {
	const record = asRecord(value);
	const id = asString(record.id);
	const name = asString(record.name);
	const slug = asString(record.slug);
	if (!id || !name || !slug) return null;
	return {
		availableCredits: asNumber(record.available_credits),
		id,
		memberCount:
			typeof record.member_count === "number" ? record.member_count : null,
		name,
		slug,
	};
}

export function extractPublicApiTeamInvites(
	payload: unknown,
): PublicApiTeamInvite[] {
	const record = asRecord(payload);
	const items = Array.isArray(payload)
		? payload
		: Array.isArray(record.invites)
			? record.invites
			: [];
	return items.flatMap((value) => {
		const invite = asRecord(value);
		const id = asString(invite.id);
		const email = asString(invite.email);
		const expiresAt = asString(invite.expires_at);
		if (!id || !email || !expiresAt) return [];
		return [
			{
				email,
				expiresAt,
				id,
				role: asString(invite.role) ?? "member",
				status: asString(invite.status) ?? "pending",
			},
		];
	});
}

export function extractPublicApiTeamActivity(
	payload: unknown,
): PublicApiTeamActivity[] {
	if (!Array.isArray(payload)) return [];
	return payload.flatMap((value) => {
		const activity = asRecord(value);
		const id = asString(activity.id);
		const type = asString(activity.type);
		const userId = asString(activity.user_id);
		const createdAt = asString(activity.created_at);
		if (!id || !type || !userId || !createdAt) return [];
		const metadata = asRecord(activity.metadata);
		const context = asString(
			metadata.email ?? metadata.name ?? metadata.campaign_name,
		);
		return [
			{
				createdAt,
				description: `${type.replaceAll("_", " ")}${context ? ` · ${context}` : ""}`,
				id,
				type,
				userId,
			},
		];
	});
}
