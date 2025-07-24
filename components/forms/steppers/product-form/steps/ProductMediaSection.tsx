// import FileUpload from "@/components/file-upload";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProductFormValues } from "@/types/zod/userSetup/product-form-schema";
import type { UseFormReturn } from "react-hook-form";

interface ProductMediaSectionProps {
	form: UseFormReturn<ProductFormValues>;
	loading: boolean;
}

export const ProductMediaSection: React.FC<ProductMediaSectionProps> = ({
	form,
	loading,
}) => (
	<FormField
		control={form.control}
		name="imgUrl"
		render={({ field }) => (
			<FormItem>
				<FormLabel>Product Images</FormLabel>
				<FormControl>
					{/* <FileUpload
						value={field.value}
						onChange={field.onChange}
						disabled={loading}
						maxFiles={3}
					/> */}
				</FormControl>
				<FormMessage />
			</FormItem>
		)}
	/>
);
