import { z } from "zod";

const booleanAttr = z.preprocess((value) => {
	if (typeof value !== "string") return value;
	const normalized = value.trim().toLowerCase();
	if (["true", "1", "yes", "on"].includes(normalized)) return true;
	if (["false", "0", "no", "off"].includes(normalized)) return false;
	return value;
}, z.boolean().optional());

const playlistSchema = z
	.string()
	.trim()
	.refine((value) => value.length > 0, { message: "Playlist cannot be empty" })
	.refine(
		(value) => value.startsWith("spotify:playlist:") || value.startsWith("http"),
		{
			message: "Playlist must be a Spotify URI or HTTPS URL",
		},
	);

const urlSchema = z
	.string()
	.trim()
	.refine(
		(value) => {
			if (value.length === 0) return true;
			try {
				new URL(value);
				return true;
			} catch {
				return false;
			}
		},
		{ message: "voice webhook must be an absolute URL" },
	)
	.optional();

const advancedConfigSchema = z
	.object({
		title: z.string().optional(),
		subtitle: z.string().optional(),
		openLabel: z.string().optional(),
		closeLabel: z.string().optional(),
		agentLimit: z.number().int().min(1).max(12).optional(),
		showCloseButton: z.boolean().optional(),
	})
	.default({});

const hostConfigSchema = z.object({
	mode: z.enum(["music", "voice"]).optional(),
	theme: z.enum(["light", "dark"]).optional(),
	playlist: playlistSchema.optional(),
	openOnLoad: booleanAttr,
	voiceWebhook: urlSchema,
	voiceToken: z.string().optional(),
	config: z
		.string()
		.transform((value, ctx) => {
			try {
				return JSON.parse(value) as unknown;
			} catch {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Invalid JSON in data-config",
				});
				return z.NEVER;
			}
		})
		.optional(),
});

export type FocusEmbedConfig = {
	mode: "music" | "voice";
	theme: "light" | "dark";
	playlist: string;
	openOnLoad: boolean;
	voiceWebhook?: string;
	voiceToken?: string;
	advancedConfig: z.infer<typeof advancedConfigSchema>;
};

export function parseFocusHost(element: Element): FocusEmbedConfig {
	const raw = {
		mode: element.getAttribute("data-mode") ?? undefined,
		theme: element.getAttribute("data-theme") ?? undefined,
		playlist: element.getAttribute("data-playlist") ?? undefined,
		openOnLoad: element.getAttribute("data-open-on-load") ?? undefined,
		voiceWebhook: element.getAttribute("data-voice-webhook") ?? undefined,
		voiceToken: element.getAttribute("data-voice-token") ?? undefined,
		config: element.getAttribute("data-config") ?? undefined,
	};

	const parsed = hostConfigSchema.safeParse(raw);
	if (!parsed.success) {
		throw parsed.error;
	}

	const advanced = advancedConfigSchema.parse(parsed.data.config ?? {});

	return {
		mode: parsed.data.mode ?? "music",
		theme: parsed.data.theme ?? "light",
		playlist:
			parsed.data.playlist ??
			"spotify:playlist:37i9dQZF1DX8Uebhn9wzrS",
		openOnLoad: parsed.data.openOnLoad ?? false,
		voiceWebhook: parsed.data.voiceWebhook,
		voiceToken: parsed.data.voiceToken,
		advancedConfig: advanced,
	};
}

