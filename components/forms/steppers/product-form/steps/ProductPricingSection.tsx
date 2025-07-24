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

interface ProductPricingSectionProps {
	form: UseFormReturn<ProductFormValues>;
	loading: boolean;
}

export const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
	form,
	loading,
}) => (
	<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
		<FormField
			control={form.control}
			name="price"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Price</FormLabel>
					<FormControl>
						<Input
							type="number"
							disabled={loading}
							placeholder="Price"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
);
