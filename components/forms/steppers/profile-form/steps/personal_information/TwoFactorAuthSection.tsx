import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import { useFormContext } from "react-hook-form";
import type React from "react";

type TwoFactorKey = keyof ProfileFormValues["twoFactorAuth"]["methods"];
const twoFactorAuthOptions: {
	name: TwoFactorKey;
	label: string;
	description?: string;
}[] = [
	{
		name: "authenticatorApp",
		label: "Authenticator App",
		description: "Use apps like Google Authenticator or Authy.",
	},
	{ name: "sms", label: "SMS", description: "Send a code via text message." },
	{ name: "email", label: "Email", description: "Send a code via email." },
];

interface TwoFactorAuthSectionProps {
	loading: boolean;
}

export const TwoFactorAuthSection: React.FC<TwoFactorAuthSectionProps> = ({
	loading,
}) => {
	const form = useFormContext<ProfileFormValues>();

	return (
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
									<div>
										<FormLabel className="flex-shrink-0">
											{option.label}
										</FormLabel>
										{option.description && (
											<div className="text-muted-foreground text-xs">
												{option.description}
											</div>
										)}
									</div>
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
};
