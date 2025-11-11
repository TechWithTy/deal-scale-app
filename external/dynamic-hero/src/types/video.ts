import { z } from "zod";

export const heroVideoProviderSchema = z.enum([
	"youtube",
	"supademo",
	"html5",
	"other",
]);

const urlOrPathSchema = z
	.string()
	.min(1)
	.refine(
		(value) =>
			value.startsWith("/") ||
			value.startsWith("http://") ||
			value.startsWith("https://") ||
			value.startsWith("data:"),
		{
			message: "Expected an absolute URL, data URI, or root-relative path.",
		},
	);

export const heroVideoConfigSchema = z.object({
	src: urlOrPathSchema,
	poster: urlOrPathSchema.optional(),
	thumbnailVideo: urlOrPathSchema.optional(),
	posterAlt: z.string().optional(),
	provider: heroVideoProviderSchema.default("youtube"),
	/**
	 * Optional caption/subtitle track (WebVTT)
	 */
	captions: z
		.object({
			src: urlOrPathSchema,
			kind: z.enum(["subtitles", "captions"]).default("subtitles"),
			label: z.string().optional(),
			srclang: z.string().optional(),
			default: z.boolean().optional(),
		})
		.optional(),
});

export type HeroVideoProvider = z.infer<typeof heroVideoProviderSchema>;
export type HeroVideoConfig = z.infer<typeof heroVideoConfigSchema>;
