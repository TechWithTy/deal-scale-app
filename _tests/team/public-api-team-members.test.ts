import {
	extractPublicApiTeamMembers,
	mapPublicApiTeamMember,
} from "@/lib/team/public-api-team-members";
import { describe, expect, it } from "vitest";

describe("public API team member adapter", () => {
	it("maps snake_case team members to frontend team members", () => {
		expect(
			mapPublicApiTeamMember({
				email: "team@example.com",
				first_name: "Team",
				id: "member-1",
				last_name: "Member",
				permissions: {
					can_access_ai: true,
					can_generate_leads: true,
					can_manage_team: true,
					can_view_reports: true,
				},
				phone_number: "+15550101",
				role: "support",
			}),
		).toMatchObject({
			email: "team@example.com",
			firstName: "Team",
			id: "member-1",
			lastName: "Member",
			permissions: {
				canAccessAI: true,
				canGenerateLeads: true,
				canManageTeam: true,
				canViewReports: true,
			},
			phone: "+15550101",
			role: "support",
		});
	});

	it("extracts valid members from common response shapes", () => {
		const members = extractPublicApiTeamMembers({
			data: {
				members: [
					{ email: "one@example.com", full_name: "One Member", user_id: "1" },
					{ email: "missing-id@example.com" },
					{ email: "two@example.com", name: "Two Member", id: "2" },
				],
			},
		});

		expect(members).toHaveLength(2);
		expect(members.map((member) => member.email)).toEqual([
			"one@example.com",
			"two@example.com",
		]);
		expect(members[0]?.firstName).toBe("One");
	});
});
