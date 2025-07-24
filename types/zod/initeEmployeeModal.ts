import { z } from 'zod';

// Define the form schema
export const initeEmployeeModal = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  permissions: z
    .object({
      canGenerateLeads: z.boolean(),
      canStartCampaigns: z.boolean(),
      canViewReports: z.boolean(),
      canManageTeam: z.boolean(),
      canManageSubscription: z.boolean(),
      canAccessAI: z.boolean(),
      canMoveCompanyTasks: z.boolean(),
      canEditCompanyProfile: z.boolean()
    })
    .refine((permissions) => Object.values(permissions).some(Boolean), {
      message: 'At least one permission must be enabled'
    })
});

// Example usage
