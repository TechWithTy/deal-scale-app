import { z } from "zod";

// * Defines the validation schema for creating and updating an AI agent.
// ! This schema is crucial for maintaining data integrity.

const requireText = (
	value: string | undefined,
	field: "voice" | "campaignGoal" | "salesScript" | "persona",
	label: string,
	ctx: z.RefinementCtx,
) => {
	if (!value?.trim()) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: [field],
			message: `${label} is required for this agent type.`,
		});
	}
};

export const agentSchema = z
	.object({
		isPublic: z.boolean().default(false),
		isFree: z.boolean().default(false),
		priceMultiplier: z.number().min(1).max(5).default(1),
		billingCycle: z.enum(["monthly", "one-time"]).default("monthly"),
		id: z.string().optional(),
		image: z.string().optional(),
		name: z.string().min(1, { message: "Agent Name is required." }),
		type: z.enum(
			["phone-call", "text-message", "direct mail", "linkedin", "facebook"],
			{
				required_error: "Agent type is required.",
			},
		),
		description: z.string().optional(),
		// Phone-specific fields
		voice: z.string().optional(),
		backgroundNoise: z.string().optional(),
		voicemailScript: z.string().optional(),
		// Social-specific fields
		avatar: z.string().optional(),
		avatarImage: z.string().optional(),
		backgroundVideo: z.string().optional(),
		backgroundImage: z.string().optional(),
		color1: z
			.string()
			.regex(/^#[0-9a-fA-F]{6}$/, { message: "Must be a valid hex code" })
			.optional(),
		color2: z
			.string()
			.regex(/^#[0-9a-fA-F]{6}$/, { message: "Must be a valid hex code" })
			.optional(),
		color3: z
			.string()
			.regex(/^#[0-9a-fA-F]{6}$/, { message: "Must be a valid hex code" })
			.optional(),
		channelAssets: z.array(z.string()).max(8).optional(),
		// Common fields
		campaignGoal: z.string().optional(),
		salesScript: z.string().optional(),
		persona: z.string().optional(),

		// Direct Mail-specific fields
		directMailTemplates: z.array(z.any()).optional(),
	})
	.superRefine((agent, ctx) => {
		if (agent.type === "phone-call") {
			requireText(agent.voice, "voice", "Voice", ctx);
			requireText(agent.campaignGoal, "campaignGoal", "Campaign goal", ctx);
			requireText(agent.salesScript, "salesScript", "Call script", ctx);
			requireText(agent.persona, "persona", "Persona", ctx);
		}

		if (agent.type === "text-message") {
			requireText(agent.campaignGoal, "campaignGoal", "Campaign goal", ctx);
			requireText(agent.salesScript, "salesScript", "Text message script", ctx);
			requireText(agent.persona, "persona", "Persona", ctx);
		}
	});

export type Agent = z.infer<typeof agentSchema>;
