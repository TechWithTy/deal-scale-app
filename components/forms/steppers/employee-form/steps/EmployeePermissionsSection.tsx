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

interface EmployeePermissionsSectionProps {
	form: UseFormReturn<TeamMemberFormValues>;
	loading: boolean;
	defaultValues: TeamMemberFormValues;
}

export const EmployeePermissionsSection: React.FC<
	EmployeePermissionsSectionProps
> = ({ form, loading, defaultValues }) => (
	<>
		<Separator />
		<Heading title="Permissions" description="Assign specific permissions" />
		<div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{(
				Object.keys(defaultValues.permissions) as Array<
					keyof typeof defaultValues.permissions
				>
			).map((permKey) => (
				<FormField
					key={permKey}
					control={form.control}
					name={`permissions.${permKey}`}
					render={({ field }) => (
						<FormItem className="flex items-center space-x-4">
							<FormLabel className="text-left font-medium">
								{permKey.replace(/can/, "Can ").replace(/([A-Z])/g, " $1")}
							</FormLabel>
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
			))}
		</div>
	</>
);
