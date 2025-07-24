import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import { LogoUploader } from "./utils/LogoUploader";
import { AssetsUploader } from "./utils/AssetsUploader";
import type React from "react";
import { useFormContext } from "react-hook-form";

// * Props only include loading; form state is managed via useFormContext
interface BaseSetupAssetsProps {
	loading: boolean;
}

export const BaseSetupAssets: React.FC<BaseSetupAssetsProps> = ({
	loading,
}) => {
	const { control, setValue, trigger } = useFormContext<ProfileFormValues>();

	return (
		<div className="flex w-full flex-col items-center">
			<div className="w-full max-w-xl space-y-8">
				<FormField
					control={control}
					name="companyLogo"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<LogoUploader
									value={field.value}
									onChange={async (file) => {
										setValue("companyLogo", file);
										await trigger("companyLogo");
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="companyAssets"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<AssetsUploader
									value={field.value}
									onChange={(files) => setValue("companyAssets", files)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
};
