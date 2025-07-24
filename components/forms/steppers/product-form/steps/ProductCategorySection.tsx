import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ProductFormValues } from "@/types/zod/userSetup/product-form-schema";
import type { UseFormReturn } from "react-hook-form";

interface ProductCategorySectionProps {
	form: UseFormReturn<ProductFormValues>;
	loading: boolean;
	categories: Array<{ value: string; label: string }>;
}

export const ProductCategorySection: React.FC<ProductCategorySectionProps> = ({
	form,
	loading,
	categories,
}) => (
	<FormField
		control={form.control}
		name="category"
		render={({ field }) => (
			<FormItem>
				<FormLabel>Category</FormLabel>
				<FormControl>
					<Select
						disabled={loading}
						onValueChange={field.onChange}
						value={field.value}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormControl>
				<FormMessage />
			</FormItem>
		)}
	/>
);
