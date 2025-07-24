import * as z from "zod";

export const ImgSchema = z.object({
	fileName: z.string(),
	name: z.string(),
	fileSize: z.number(),
	size: z.number(),
	fileKey: z.string(),
	key: z.string(),
	fileUrl: z.string(),
	url: z.string(),
});

export const IMG_MAX_LIMIT = 3;

export const productFormSchema = z.object({
	name: z
		.string()
		.min(3, { message: "Product Name must be at least 3 characters" }),
	imgUrl: z
		.array(ImgSchema)
		.max(IMG_MAX_LIMIT, { message: "You can only add up to 3 images" })
		.min(1, { message: "At least one image must be added." }),
	description: z
		.string()
		.min(3, { message: "Product description must be at least 3 characters" }),
	price: z.coerce.number(),
	category: z.string().min(1, { message: "Please select a category" }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
