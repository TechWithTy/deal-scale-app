import { z } from "zod";

export const identitySchema = z.object({
	id: z.string().min(1, "Missing user identifier"),
	name: z.string().nullish(),
	email: z.string().email().nullish(),
});

const quotaBucketSchema = z.object({
	allotted: z.number(),
	used: z.number(),
	resetInDays: z.number().optional(),
});

const subscriptionBucketSchema = z.object({
	allotted: z.number(),
	used: z.number(),
	resetInDays: z.number(),
});

export const sessionUserSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		email: z.string().email(),
		role: z.string(),
		tier: z.string(),
		permissions: z.array(z.string()),
		permissionMatrix: z.record(z.array(z.string())),
		permissionList: z.array(z.string()),
		quotas: z.object({
			ai: quotaBucketSchema,
			leads: quotaBucketSchema,
			skipTraces: quotaBucketSchema,
		}),
		subscription: z.object({
			aiCredits: subscriptionBucketSchema,
			leads: subscriptionBucketSchema,
			skipTraces: subscriptionBucketSchema,
		}),
		isBetaTester: z.boolean().optional(),
		isPilotTester: z.boolean().optional(),
		isFreeTier: z.boolean().optional(),
	})
	.strict();

export const impersonationResponseSchema = z.object({
	impersonatedUser: identitySchema,
	impersonator: identitySchema,
	impersonatedUserData: sessionUserSchema,
	impersonatorUserData: sessionUserSchema,
});
