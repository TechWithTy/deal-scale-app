import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { TeamMemberFormValues } from "@/types/zod/userSetup/team-member-form-schema";
import type { UseFormReturn } from "react-hook-form";

// * 2FA methods with labels and descriptions
const TWO_FACTOR_METHODS: {
	key: keyof TeamMemberFormValues["twoFactorAuth"]["methods"];
	label: string;
	description?: string;
}[] = [
	{ key: "sms", label: "SMS", description: "Send a code via text message." },
	{ key: "email", label: "Email", description: "Send a code via email." },
	{
		key: "authenticatorApp",
		label: "Authenticator App",
		description: "Use apps like Google Authenticator or Authy.",
	},
];

interface EmployeeTwoFactorSectionProps {
	form: UseFormReturn<TeamMemberFormValues>;
	loading: boolean;
}

export const EmployeeTwoFactorSection: React.FC<
	EmployeeTwoFactorSectionProps
> = ({ form, loading }) => (
	<>
		<Separator />
		<Heading
			title="Two-Factor Authentication"
			description="Enable 2FA for this user"
		/>
		<div className="space-y-4">
			<FormField
				control={form.control}
				name="twoFactorAuth.isEnabled"
				render={({ field }) => (
					<FormItem className="flex flex-col items-start space-y-1">
						<div className="flex items-center space-x-3">
							<FormControl>
								<Checkbox
									checked={Boolean(field.value)}
									disabled={loading}
									onCheckedChange={field.onChange}
									id="enable-2fa"
									aria-describedby="enable-2fa-desc"
									className="h-5 w-5"
								/>
							</FormControl>
							<FormLabel
								htmlFor="enable-2fa"
								className="cursor-pointer font-medium"
							>
								Enable 2FA
							</FormLabel>
						</div>
						<span
							id="enable-2fa-desc"
							className="ml-7 text-muted-foreground text-xs"
						>
							Require this user to use two-factor authentication when logging
							in.
						</span>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{TWO_FACTOR_METHODS.map(({ key, label, description }) => (
					<FormField
						key={key}
						control={form.control}
						name={`twoFactorAuth.methods.${key}`}
						render={({ field }) => (
							<FormItem className="flex flex-col items-start space-y-1">
								<div className="flex items-center space-x-3">
									<FormControl>
										<Checkbox
											checked={Boolean(field.value)}
											disabled={loading}
											onCheckedChange={field.onChange}
											id={`2fa-method-${key}`}
											aria-describedby={
												description ? `2fa-method-desc-${key}` : undefined
											}
											className="h-5 w-5"
										/>
									</FormControl>
									<FormLabel
										htmlFor={`2fa-method-${key}`}
										className="cursor-pointer font-medium"
									>
										{label}
									</FormLabel>
								</div>
								{description && (
									<span
										id={`2fa-method-desc-${key}`}
										className="ml-7 text-muted-foreground text-xs"
									>
										{description}
									</span>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
			</div>
		</div>
	</>
);
