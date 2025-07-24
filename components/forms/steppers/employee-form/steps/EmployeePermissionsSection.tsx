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

// * Human-friendly labels and optional descriptions for permissions
const PERMISSIONS: {
	key: keyof TeamMemberFormValues["permissions"];
	label: string;
	description?: string;
}[] = [
	{
		key: "canGenerateLeads",
		label: "Can Generate Leads",
		description: "Allow user to generate new leads.",
	},
	{
		key: "canManageTeam",
		label: "Can Manage Team",
		description: "Allow user to add or remove team members.",
	},
	{
		key: "canMoveCompanyTasks",
		label: "Can Move Company Tasks",
		description: "Allow user to move company-wide tasks.",
	},
	{
		key: "canStartCampaigns",
		label: "Can Start Campaigns",
		description: "Allow user to launch marketing campaigns.",
	},
	{
		key: "canManageSubscription",
		label: "Can Manage Subscription",
		description: "Allow user to update billing and plans.",
	},
	{
		key: "canEditCompanyProfile",
		label: "Can Edit Company Profile",
		description: "Allow user to change company info.",
	},
	{
		key: "canViewReports",
		label: "Can View Reports",
		description: "Allow user to access analytics and reports.",
	},
	{
		key: "canAccessAI",
		label: "Can Access AI",
		description: "Allow user to use AI-powered features.",
	},
];

interface EmployeePermissionsSectionProps {
	form: UseFormReturn<TeamMemberFormValues>;
	loading: boolean;
	defaultValues: TeamMemberFormValues;
}

export const EmployeePermissionsSection: React.FC<
	EmployeePermissionsSectionProps
> = ({ form, loading }) => (
	<>
		<Separator />
		<Heading title="Permissions" description="Assign specific permissions" />
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{PERMISSIONS.map(({ key, label, description }) => (
				<FormField
					key={key}
					control={form.control}
					name={`permissions.${key}`}
					render={({ field }) => (
						<FormItem className="flex flex-col items-start space-y-1">
							<div className="flex items-center space-x-3">
								<FormControl>
									<Checkbox
										checked={Boolean(field.value)}
										disabled={loading}
										onCheckedChange={field.onChange}
										id={`permissions-${key}`}
										aria-describedby={
											description ? `permissions-desc-${key}` : undefined
										}
										className="h-5 w-5"
									/>
								</FormControl>
								<FormLabel
									htmlFor={`permissions-${key}`}
									className="cursor-pointer font-medium"
								>
									{label}
								</FormLabel>
							</div>
							{description && (
								<span
									id={`permissions-desc-${key}`}
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
	</>
);
