import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { TeamMemberFormValues } from "@/types/zod/userSetup/team-member-form-schema";
import type { UseFormReturn } from "react-hook-form";

interface EmployeeInfoFieldsProps {
	form: UseFormReturn<TeamMemberFormValues>;
	loading: boolean;
}

export const EmployeeInfoFields: React.FC<EmployeeInfoFieldsProps> = ({
	form,
	loading,
}) => (
	<div className="gap-8 md:grid md:grid-cols-2">
		<FormField
			control={form.control}
			name="firstName"
			render={({ field }) => (
				<FormItem>
					<FormLabel>First Name</FormLabel>
					<FormControl>
						<Input disabled={loading} placeholder="First name" {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name="lastName"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Last Name</FormLabel>
					<FormControl>
						<Input disabled={loading} placeholder="Last name" {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name="email"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Invite by Email</FormLabel>
					<FormControl>
						<Input
							disabled={loading}
							placeholder="Team member's email"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
);
