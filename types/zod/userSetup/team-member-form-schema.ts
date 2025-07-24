import * as z from "zod";

export const teamMemberFormSchema = z.object({
	firstName: z
		.string()
		.min(2, { message: "First name must be at least 2 characters" }),
	lastName: z
		.string()
		.min(2, { message: "Last name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	role: z.enum(["admin", "member"], {
		errorMap: () => ({ message: "Role is required" }),
	}),
	permissions: z
		.object({
			canGenerateLeads: z.boolean(),
			canStartCampaigns: z.boolean(),
			canViewReports: z.boolean(),
			canManageTeam: z.boolean(),
			canManageSubscription: z.boolean(),
			canAccessAI: z.boolean(),
			canMoveCompanyTasks: z.boolean(),
			canEditCompanyProfile: z.boolean(),
		})
		.refine((permissions) => Object.values(permissions).some(Boolean), {
			message: "At least one permission must be enabled",
		}),
	twoFactorAuth: z.object({
		isEnabled: z.boolean(),
		methods: z
			.object({
				sms: z.boolean(),
				email: z.boolean(),
				authenticatorApp: z.boolean(),
			})
			.refine((methods) => Object.values(methods).some(Boolean), {
				message: "At least one 2FA method must be enabled",
			}),
	}),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
