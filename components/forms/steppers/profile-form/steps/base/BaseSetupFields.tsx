import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";

interface BaseSetupFieldsProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

export const BaseSetupFields: React.FC<BaseSetupFieldsProps> = ({
	form,
	loading,
}) => (
	<>
		<FormField
			control={form.control}
			name="companyName"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Company name</FormLabel>
					<FormControl>
						<Input disabled={loading} placeholder="Apex Company" {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name="outreachEmailAddress"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Outreach Email</FormLabel>
					<FormControl>
						<Input
							disabled={loading}
							placeholder="johndoe@gmail.com"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name="leadForwardingNumber"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Forwarding Phone Number</FormLabel>
					<FormControl>
						<Input
							type="number"
							placeholder="Enter your phone number"
							disabled={loading}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name="companyExplainerVideoUrl"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Company Explainer Video URL</FormLabel>
					<FormControl>
						<Input
							type="url"
							disabled={loading}
							placeholder="https://example.com/video"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</>
);
