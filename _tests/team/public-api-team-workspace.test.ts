import {
	extractPublicApiTeamActivity,
	extractPublicApiTeamInvites,
	mapPublicApiOrganization,
} from "@/lib/team/public-api-team-workspace";
import { describe, expect, it } from "vitest";

describe("public API team workspace adapters", () => {
	it("maps organization details", () => {
		expect(
			mapPublicApiOrganization({
				id: "org-1",
				name: "Deal Scale",
				slug: "deal-scale",
				available_credits: 25,
				member_count: 3,
			}),
		).toEqual({
			id: "org-1",
			name: "Deal Scale",
			slug: "deal-scale",
			availableCredits: 25,
			memberCount: 3,
		});
	});

	it("extracts invitations", () => {
		expect(
			extractPublicApiTeamInvites([
				{
					id: "invite-1",
					email: "person@example.com",
					role: "member",
					status: "pending",
					expires_at: "2026-07-06T12:00:00Z",
				},
			]),
		).toHaveLength(1);
	});

	it("formats activity metadata without inventing member names", () => {
		expect(
			extractPublicApiTeamActivity([
				{
					id: "activity-1",
					type: "member_invited",
					user_id: "user-1",
					created_at: "2026-06-29T12:00:00Z",
					metadata: { email: "person@example.com" },
				},
			]),
		).toEqual([
			{
				id: "activity-1",
				type: "member_invited",
				userId: "user-1",
				createdAt: "2026-06-29T12:00:00Z",
				description: "member invited · person@example.com",
			},
		]);
	});
});
