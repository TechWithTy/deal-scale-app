import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TeamMemberFormValues } from "@/types/zod/userSetup/team-member-form-schema";
import type { UseFormReturn } from "react-hook-form";

interface EmployeeRoleFieldProps {
	form: UseFormReturn<TeamMemberFormValues>;
	loading: boolean;
}

export const EmployeeRoleField: React.FC<EmployeeRoleFieldProps> = ({
	form,
	loading,
}) => (
	<div className="gap-8 md:grid md:grid-cols-2">
		<FormField
			control={form.control}
			name="role"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Role</FormLabel>
					<FormControl>
						<Select
							disabled={loading}
							onValueChange={field.onChange}
							value={field.value}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="member">Member</SelectItem>
							</SelectContent>
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
);
