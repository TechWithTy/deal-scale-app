import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";

type NotificationKey = keyof ProfileFormValues["notifications"];
const notificationOptions: { name: NotificationKey; label: string }[] = [
	{ name: "emailNotifications", label: "Email" },
	{ name: "smsNotifications", label: "SMS" },
	{ name: "notifyForNewLeads", label: "New Leads" },
	{ name: "notifyForCampaignUpdates", label: "Campaign Updates" },
];

interface NotificationsSectionProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
	form,
	loading,
}) => (
	<div className="space-y-4">
		<h3 className="font-medium text-lg">Notifications</h3>
		<div className="space-y-4">
			{notificationOptions.map((option) => (
				<FormField
					key={option.name}
					control={form.control}
					name={`notifications.${option.name}` as const}
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between space-x-4">
								<FormLabel className="flex-shrink-0">{option.label}</FormLabel>
								<input
									type="checkbox"
									checked={!!field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									name={field.name}
									ref={field.ref}
									disabled={loading}
								/>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
		</div>
	</div>
);
