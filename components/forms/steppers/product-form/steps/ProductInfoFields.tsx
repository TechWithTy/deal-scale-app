import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "@/types/zod/userSetup/product-form-schema";
import type { UseFormReturn } from "react-hook-form";

interface ProductInfoFieldsProps {
	form: UseFormReturn<ProductFormValues>;
	loading: boolean;
}

export const ProductInfoFields: React.FC<ProductInfoFieldsProps> = ({
	form,
	loading,
}) => (
	<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
		<FormField
			control={form.control}
			name="name"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Product Name</FormLabel>
					<FormControl>
						<Input disabled={loading} placeholder="Product name" {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name="description"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Description</FormLabel>
					<FormControl>
						<Input disabled={loading} placeholder="Description" {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
);
