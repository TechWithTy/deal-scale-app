import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";

type TwoFactorKey = keyof ProfileFormValues["twoFactorAuth"]["methods"];
const twoFactorAuthOptions: { name: TwoFactorKey; label: string }[] = [
	{ name: "authenticatorApp", label: "Authenticator App" },
];

interface TwoFactorAuthSectionProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

export const TwoFactorAuthSection: React.FC<TwoFactorAuthSectionProps> = ({
	form,
	loading,
}) => (
	<div className="space-y-4">
		<h3 className="font-medium text-lg">Two-Factor Authentication</h3>
		<div className="space-y-4">
			{twoFactorAuthOptions.map((option) => (
				<FormField
					key={option.name}
					control={form.control}
					name={`twoFactorAuth.methods.${option.name}` as const}
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between space-x-4">
								<FormLabel className="flex-shrink-0">{option.label}</FormLabel>
								<FormControl>
									<Switch
										checked={field.value ?? false}
										onCheckedChange={field.onChange}
										disabled={loading}
									/>
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
		</div>
	</div>
);
