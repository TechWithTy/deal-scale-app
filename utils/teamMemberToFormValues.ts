import type { TeamMember } from "@/types/userProfile";
import type {
	TeamMemberFormValues,
	TeamMemberUpdatePasswordFormValues,
} from "@/types/zod/userSetup/team-member-form-schema";

/**
 * Maps a TeamMember (from mock/profile) to TeamMemberFormValues (for MainEmployeeForm)
 * Use for invite mode or where password fields are not needed.
 */
export function teamMemberToFormValues(
	member: TeamMember,
): TeamMemberFormValues {
	return {
		id: member.id,
		firstName: member.firstName,
		lastName: member.lastName,
		email: member.email,
		role: member.role,
		permissions: { ...member.permissions },
		twoFactorAuth: member.twoFactorAuth ?? {
			isEnabled: false,
			methods: { sms: false, email: false, authenticatorApp: false },
		},
	};
}

/**
 * Maps a TeamMember to TeamMemberUpdatePasswordFormValues for edit mode.
 * Ensures password fields are present and empty by default.
 */
export function teamMemberToUpdatePasswordFormValues(
	member: TeamMember,
): TeamMemberUpdatePasswordFormValues {
	return {
		...teamMemberToFormValues(member),
		updatePassword: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	};
}
