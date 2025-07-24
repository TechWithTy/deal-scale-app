import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { TeamMemberFormValues } from "@/types/zod/userSetup/team-member-form-schema";
import type { UseFormReturn } from "react-hook-form";

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
		<div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<FormField
				control={form.control}
				name="twoFactorAuth.isEnabled"
				render={({ field }) => (
					<FormItem className="flex items-center space-x-4">
						<FormLabel className="font-medium">Enable 2FA</FormLabel>
						<FormControl>
							<Input
								type="checkbox"
								disabled={loading}
								checked={Boolean(field.value)}
								onChange={field.onChange}
								className="h-5 w-5"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="twoFactorAuth.methods.sms"
				render={({ field }) => (
					<FormItem className="flex items-center space-x-4">
						<FormLabel className="font-medium">SMS</FormLabel>
						<FormControl>
							<Input
								type="checkbox"
								disabled={loading}
								checked={Boolean(field.value)}
								onChange={field.onChange}
								className="h-5 w-5"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="twoFactorAuth.methods.email"
				render={({ field }) => (
					<FormItem className="flex items-center space-x-4">
						<FormLabel className="font-medium">Email</FormLabel>
						<FormControl>
							<Input
								type="checkbox"
								disabled={loading}
								checked={Boolean(field.value)}
								onChange={field.onChange}
								className="h-5 w-5"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="twoFactorAuth.methods.authenticatorApp"
				render={({ field }) => (
					<FormItem className="flex items-center space-x-4">
						<FormLabel className="font-medium">Authenticator App</FormLabel>
						<FormControl>
							<Input
								type="checkbox"
								disabled={loading}
								checked={Boolean(field.value)}
								onChange={field.onChange}
								className="h-5 w-5"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	</>
);
