import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

interface BaseSetupAssetsProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

export const BaseSetupAssets: React.FC<BaseSetupAssetsProps> = ({
	form,
	loading,
}) => {
	const [isEditingAssets, setIsEditingAssets] = useState(false);
	const assetsFromForm: Array<File | string> =
		form.watch("companyAssets") || [];

	// ! Handle deleting an asset
	const handleDeleteAsset = (index: number) => {
		const updatedAssets = assetsFromForm.filter((_, i) => i !== index);
		// Only keep File objects when updating form state
		form.setValue(
			"companyAssets",
			updatedAssets.filter((asset) => asset instanceof File),
		);
	};

	return (
		<FormField
			control={form.control}
			name="companyAssets"
			render={({ field, fieldState: { error } }) => (
				<FormItem>
					<FormLabel>Company Assets</FormLabel>
					{!isEditingAssets && assetsFromForm.length > 0 ? (
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
							{assetsFromForm.map((asset: File | string, index: number) => {
								const assetKey =
									asset instanceof File
										? `${asset.name}-${index}`
										: `${asset as string}-${index}`;
								const assetSrc =
									asset instanceof File
										? URL.createObjectURL(asset)
										: (asset as string);
								return (
									<div key={assetKey} className="relative inline-block">
										<Image
											src={assetSrc}
											alt={`Asset ${index + 1}`}
											className="mb-4 rounded-lg object-cover"
											width={100}
											height={100}
										/>
										<button
											type="button"
											onClick={() => handleDeleteAsset(index)}
											className="absolute top-1 right-1 rounded bg-red-600 px-2 py-1 text-white text-xs hover:bg-red-700"
										>
											Delete
										</button>
									</div>
								);
							})}
						</div>
					) : (
						<div>
							<input
								type="file"
								accept="image/*"
								multiple
								disabled={loading}
								onChange={(e) => {
									if (e.target.files) {
										const files = Array.from(e.target.files);
										// Only pass File objects to form state
										field.onChange([
											...(assetsFromForm.filter(
												(asset) => asset instanceof File,
											) as File[]),
											...files,
										]);
									}
								}}
								className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
							/>
						</div>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
