import * as z from "zod";

export const teamMemberFormSchema = z.object({
	id: z.string().optional(),
	firstName: z
		.string()
		.min(2, { message: "First name must be at least 2 characters" }),
	lastName: z
		.string()
		.min(2, { message: "Last name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	phone: z
		.string()
		.min(7, { message: "Phone must be at least 7 digits" })
		.max(20)
		.optional()
		.or(z.literal("")),
	role: z.enum(
		["admin", "member", "support", "platform_support", "platform_admin"],
		{
			errorMap: () => ({ message: "Role is required" }),
		},
	),
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
	platformIntegration: z
		.object({
			callTransferBufferTime: z
				.number()
				.min(0, { message: "Buffer time must be positive" })
				.max(300, { message: "Buffer time cannot exceed 300 seconds" }),
			textBufferPeriod: z
				.number()
				.min(0, { message: "Buffer period must be positive" })
				.max(1440, {
					message: "Buffer period cannot exceed 1440 minutes (24 hours)",
				}),
			autoResponseEnabled: z.boolean(),
			workingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: "Start time must be in HH:mm format (e.g., 09:00)",
			}),
			workingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: "End time must be in HH:mm format (e.g., 17:00)",
			}),
			timezone: z.string().min(1, { message: "Timezone is required" }),
			maxConcurrentConversations: z
				.number()
				.min(1, { message: "Must allow at least 1 conversation" })
				.max(50, { message: "Cannot exceed 50 concurrent conversations" }),
			enableCallRecording: z.boolean(),
			enableTextNotifications: z.boolean(),
			enableEmailNotifications: z.boolean(),
		})
		.optional(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

export type TeamMemberResetPasswordFormValues = TeamMemberFormValues & {
	resetPassword: {
		newPassword: string;
		confirmPassword: string;
	};
};

export type TeamMemberUpdatePasswordFormValues = TeamMemberFormValues & {
	updatePassword: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	};
};
