"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ProductCategorySection } from "./steps/ProductCategorySection";
import { ProductInfoFields } from "./steps/ProductInfoFields";
import { ProductMediaSection } from "./steps/ProductMediaSection";
import { ProductPricingSection } from "./steps/ProductPricingSection";

const ImgSchema = z.object({
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
const formSchema = z.object({
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

export type ProductFormValues = z.infer<typeof formSchema>;

interface MainProductFormProps {
	initialData?: ProductFormValues | null;
	categories: Array<{ value: string; label: string }>;
}

export const MainProductForm: React.FC<MainProductFormProps> = ({
	initialData,
	categories,
}) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const title = initialData ? "Edit product" : "Create product";
	const description = initialData ? "Edit a product." : "Add a new product";
	const action = initialData ? "Save changes" : "Create";
	const defaultValues: ProductFormValues = initialData || {
		name: "",
		description: "",
		price: 0,
		imgUrl: [],
		category: "",
	};

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const onSubmit = async (data: ProductFormValues) => {
		try {
			setLoading(true);
			// TODO: API call for create/update
			router.push("/dashboard/products");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<Heading title={title} description={description} />
			</div>
			<Separator />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full space-y-8"
				>
					<ProductInfoFields form={form} loading={loading} />
					<ProductPricingSection form={form} loading={loading} />
					<ProductCategorySection
						form={form}
						loading={loading}
						categories={categories}
					/>
					<ProductMediaSection form={form} loading={loading} />
					<div className="flex justify-end">
						<Button type="submit" disabled={loading}>
							{action}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
