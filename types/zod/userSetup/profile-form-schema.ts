import * as z from "zod";
import { oAuthDataSchema } from "./connect-needed-accounts";

export const htmlRegex = /<\/?[a-z][\s\S]*>/i; // Matches basic HTML tags
export const markdownRegex = /(\#|\*|_|`|\[|\]|!|\(|\))/; // Matches basic Markdown symbols
export const validateImageDimensions = (
	file: File,
	minWidth: number,
	minHeight: number,
	maxWidth: number,
	maxHeight: number,
) => {
	return new Promise<boolean>((resolve) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);

		img.onload = () => {
			const { width, height } = img;
			if (
				width >= minWidth &&
				height >= minHeight &&
				width <= maxWidth &&
				height <= maxHeight
			) {
				resolve(true);
			} else {
				resolve(false);
			}
		};

		img.onerror = () => {
			resolve(false);
		};
	});
};
const providerEnum = z.enum([
	"google",
	"github",
	"facebook",
	"twitter",
	"discord",
	"twitch",
	"gitlab",
	"bitbucket",
	"linkedin",
	"slack",
	"spotify",
	"workos",
	"zoom",
	"azure",
	"apple",
	"notion",
	"figma",
	"tiktok",
	"salesforce",
]);

export const profileSchema = z.object({
	firstName: z
		.string()
		.min(3, { message: "First name must be at least 3 characters long." })
		.max(50, { message: "First name cannot exceed 50 characters." }),
	companyName: z
		.string()
		.min(3, { message: "Company name must be at least 3 characters long." })
		.max(50, { message: "Company name cannot exceed 50 characters." }),
	companyLogo: z
		.any()
		.refine((file) => file === undefined || file instanceof File, {
			message: "You must upload a file.",
		})
		.refine(
			(file) =>
				file === undefined ||
				(file && ["image/jpeg", "image/png", "image/webp"].includes(file.type)),
			{
				message: "Logo must be a JPEG, PNG, or WebP image.",
			},
		)
		.refine(
			(file) => file === undefined || (file && file.size <= 5 * 1024 * 1024),
			{
				message: "Logo must be less than 5MB in size.",
			},
		)
		.refine(
			async (file) => {
				if (!file) return true; // Allow undefined, skip dimension check
				const isValidDimensions = await validateImageDimensions(
					file,
					100,
					100,
					1000,
					1000,
				); // e.g., min 100x100, max 1000x1000
				return isValidDimensions;
			},
			{
				message:
					"Logo dimensions must be between 100x100 and 1000x1000 pixels.",
			},
		)
		.optional(),
	lastName: z
		.string()
		.min(3, { message: "Last name must be at least 3 characters long." })
		.max(50, { message: "Last name cannot exceed 50 characters." }),

	email: z
		.string()
		.email({ message: "Please enter a valid email address." })
		.max(100, { message: "Email cannot exceed 100 characters." }),

	personalNum: z
		.string()
		.min(10, { message: "Contact number must be at least 10 digits." })
		.max(10, { message: "Contact number cannot exceed 10 digits." })
		.refine((value) => /^[0-9]+$/.test(value), {
			message: "Contact number can only contain numbers.",
		}),
	twoFactorAuth: z.object({
		methods: z.object({
			sms: z.boolean().default(false), // Default to false
			email: z.boolean().default(false), // Default to false
			authenticatorApp: z.boolean().default(false), // Default to false
			isEnabled: z.boolean().default(false), // Default to false
		}),
		lastUpdatedAt: z.date().optional(), // Timestamp of last update
	}),
	// Notifications Schema (Optional Fields)
	notifications: z.object({
		emailNotifications: z.boolean().optional(), // Whether the user wants to receive email notifications
		smsNotifications: z.boolean().optional(), // Whether the user wants SMS notifications
		notifyForNewLeads: z.boolean().optional(), // Notify when new leads are available
		notifyForCampaignUpdates: z.boolean().optional(), // Notify when campaigns are updated
	}),

	state: z
		.string()
		.min(1, { message: "Please select a country." })
		.max(100, { message: "Country name cannot exceed 100 characters." }),

	city: z
		.string()
		.min(1, { message: "Please select a city." })
		.max(100, { message: "City name cannot exceed 100 characters." }),

	companyBanner: z
		.any()
		.refine((file) => file instanceof File, {
			message: "You must upload a file.",
		})
		.refine(
			(file) =>
				file && ["image/jpeg", "image/png", "image/webp"].includes(file.type),
			{
				message: "Banner must be a JPEG, PNG, or WebP image.",
			},
		)
		.refine((file) => file && file.size <= 5 * 1024 * 1024, {
			message: "Banner must be less than 5MB in size.",
		})
		.refine(
			async (file) => {
				if (!file) return false;
				const isValidDimensions = await validateImageDimensions(
					file,
					1200,
					400,
					1200,
					400,
				); // Banner dimensions fixed to 1200x400 pixels
				return isValidDimensions;
			},
			{
				message: "Banner dimensions must be 1200x400 pixels.",
			},
		),

	companyExplainerVideoUrl: z
		.string()
		.url({ message: "Please enter a valid URL for the explainer video." }),

	companyAssets: z
		.array(
			z.object({
				id: z.string(),
				file: z
					.instanceof(File)
					.refine(
						(file) =>
							["image/jpeg", "image/png", "image/webp"].includes(file.type),
						{
							message: "Asset must be a JPEG, PNG, or WebP image.",
						},
					)
					.refine((file) => file.size <= 5 * 1024 * 1024, {
						message: "Asset must be less than 5MB in size.",
					}),
			}),
		)
		.min(3, { message: "You must upload at least 3 assets." }) // Minimum of 3 assets required
		.max(15, { message: "You can upload up to 15 assets." }), // Maximum of 15 files allowed
	// outreachEmailAddress: z
	// 	.string()
	// 	.email({ message: "Please enter a valid email address." })
	// 	.max(100, { message: "Email cannot exceed 100 characters." }),

	leadForwardingNumber: z
		.string()
		.min(10, { message: "Contact number must be at least 10 digits." })
		.max(12, { message: "Contact number cannot exceed 12 digits." })
		.refine((value) => /^[0-9]+$/.test(value), {
			message: "Contact number can only contain numbers.",
		}),
	selectedVoice: z
		.string()
		.max(100, { message: "Voice selection cannot exceed 100 characters." })
		.optional()
		.nullable(), // Allows the field to be null or not provided
	clonedVoiceId: z
		.string()
		.min(1, { message: "Voice ID is required if provided." })
		.max(100, { message: "Voice ID cannot exceed 100 characters." })
		.optional(),
	voicemailRecordingId: z
		.string()
		.min(1, { message: "VoiceMail ID is required if provided." })
		.max(100, { message: "Voice ID cannot exceed 100 characters." })
		.optional(),
	createdVoiceId: z
		.string()
		.min(1, { message: "Voice ID is required if provided." })
		.max(100, { message: "Voice ID cannot exceed 100 characters." })
		.optional(),
	// Optional metadata about the user signup
	meta: z.record(z.any()).optional().nullable(),

	// Required sales script field
	exampleSalesScript: z
		.string()
		.min(10, { message: "Sales script must be at least 10 characters long." })
		.max(1000, { message: "Sales script cannot exceed 1000 characters." })
		.optional(),
	// exampleEmailBody: z
	// 	.string()
	// 	// .min(10, { message: "Email body must be at least 10 characters long." })
	// 	.max(5000, { message: "Email body cannot exceed 5000 characters." }) // Optional, adjust as needed
	// 	.refine((value) => htmlRegex.test(value) || markdownRegex.test(value), {
	// 		message: "Email body must be valid Markdown or HTML.",
	// 	})
	// 	.optional(),

	socialMediaCampaignAccounts: z.object({
		oauthData: z.record(oAuthDataSchema),
		facebook: providerEnum.optional(),
		twitter: providerEnum.optional(),
		instagram: providerEnum.optional(),
		linkedIn: providerEnum.optional(),
	}),
	socialMediatags: z
		.array(
			z.string().refine((tag) => /^#/.test(tag), {
				message: "Each hashtag must start with a '#' symbol.",
			}),
		)
		.optional(),
});

// Export the inferred form values type for use in React Hook Form
export type ProfileFormValues = z.infer<typeof profileSchema>;
