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

interface BaseSetupLogoProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

export const BaseSetupLogo: React.FC<BaseSetupLogoProps> = ({
	form,
	loading,
}) => {
	const [isReplacingLogo, setIsReplacingLogo] = useState(false);
	const logoFromForm = form.watch("companyLogo");

	return (
		<FormField
			control={form.control}
			name="companyLogo"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Company Logo</FormLabel>
					<FormControl>
						{logoFromForm && !isReplacingLogo ? (
							<div className="relative flex flex-col items-center justify-center">
								{typeof logoFromForm === "string" ? (
									<Image
										src={logoFromForm}
										alt="Company Logo"
										className="mb-4 h-32 w-32 rounded-lg object-cover"
										width={300}
										height={300}
									/>
								) : (
									<p>No logo available</p>
								)}
								<button
									type="button"
									onClick={() => setIsReplacingLogo(true)}
									className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
								>
									Replace Logo
								</button>
							</div>
						) : (
							<div>
								<input
									type="file"
									accept="image/*"
									disabled={loading}
									onChange={(e) => {
										if (e.target.files?.[0]) {
											const file = e.target.files[0];
											field.onChange(file);
											setIsReplacingLogo(false);
										}
									}}
									className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
								/>
							</div>
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
