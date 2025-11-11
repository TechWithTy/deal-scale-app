"use client";
/**
 * PlatformSettingsFields: Platform Integration Settings Fields
 * Configure collaboration and communication settings
 */

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useFormContext } from "react-hook-form";

interface PlatformSettingsFieldsProps {
	loading: boolean;
}

// Custom Switch Component
const CustomSwitch: React.FC<{
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
	disabled?: boolean;
}> = ({ checked, onCheckedChange, disabled = false }) => {
	return (
		<label className="inline-flex cursor-pointer items-center">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onCheckedChange(e.target.checked)}
				className="peer sr-only"
				disabled={disabled}
			/>
			<div className="peer relative h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
				<div
					className={`absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full bg-background shadow-lg transition-transform duration-300 ease-in-out ${checked ? "translate-x-5" : ""}`}
				/>
			</div>
		</label>
	);
};

// Common timezones
const timezones = [
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Phoenix",
	"America/Anchorage",
	"Pacific/Honolulu",
	"Europe/London",
	"Europe/Paris",
	"Asia/Tokyo",
	"Asia/Shanghai",
	"Australia/Sydney",
];

export const PlatformSettingsFields: React.FC<PlatformSettingsFieldsProps> = ({
	loading,
}) => {
	const form = useFormContext<ProfileFormValues>();

	return (
		<>
			{/* Platform Settings Fields */}
			<section className="space-y-6">
				<h3 className="font-semibold text-lg">Working Hours & Availability</h3>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* Call Transfer Buffer Time */}
					<FormField
						control={form.control}
						name="platformSettings.callTransferBufferTime"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Call Transfer Buffer Time (seconds)</FormLabel>
								<FormControl>
									<Input
										type="number"
										disabled={loading}
										placeholder="30"
										min={0}
										max={300}
										{...field}
										value={field.value ?? ""}
										onChange={(e) =>
											field.onChange(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</FormControl>
								<FormDescription>
									Wait time before member receives transferred calls
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Text Buffer Period */}
					<FormField
						control={form.control}
						name="platformSettings.textBufferPeriod"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Text Buffer Period (minutes)</FormLabel>
								<FormControl>
									<Input
										type="number"
										disabled={loading}
										placeholder="5"
										min={0}
										max={60}
										{...field}
										value={field.value ?? ""}
										onChange={(e) =>
											field.onChange(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</FormControl>
								<FormDescription>
									Wait time before member receives text notifications
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Working Hours Start */}
					<FormField
						control={form.control}
						name="platformSettings.workingHoursStart"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Working Hours Start *</FormLabel>
								<FormControl>
									<Input
										type="time"
										disabled={loading}
										placeholder="09:00"
										required
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormDescription>When this member starts work</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Working Hours End */}
					<FormField
						control={form.control}
						name="platformSettings.workingHoursEnd"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Working Hours End *</FormLabel>
								<FormControl>
									<Input
										type="time"
										disabled={loading}
										placeholder="17:00"
										required
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormDescription>When this member ends work</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Timezone */}
					<FormField
						control={form.control}
						name="platformSettings.timezone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Timezone *</FormLabel>
								<Select
									disabled={loading}
									onValueChange={field.onChange}
									value={field.value}
									defaultValue={field.value}
									required
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select timezone" />
										</SelectTrigger>
									</FormControl>
									<SelectContent
										position="popper"
										side="bottom"
										className="max-h-64 overflow-y-auto"
									>
										{timezones.map((tz) => (
											<SelectItem key={tz} value={tz}>
												{tz}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>Member's timezone</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Max Concurrent Conversations */}
					<FormField
						control={form.control}
						name="platformSettings.maxConcurrentConversations"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Concurrent Conversations *</FormLabel>
								<FormControl>
									<Input
										type="number"
										disabled={loading}
										placeholder="5"
										min={1}
										max={50}
										required
										{...field}
										value={field.value ?? ""}
										onChange={(e) =>
											field.onChange(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
									/>
								</FormControl>
								<FormDescription>
									Maximum simultaneous conversations
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</section>

			<div className="my-8 border-gray-200 border-t dark:border-gray-700" />

			{/* Communication Preferences */}
			<section className="space-y-6">
				<h3 className="font-semibold text-lg">Communication Preferences</h3>
				<div className="space-y-4">
					{/* Auto-Response */}
					<FormField
						control={form.control}
						name="notifications.autoResponse"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex-1">
										<FormLabel className="font-medium text-base">
											Auto-Response
										</FormLabel>
										<FormDescription>
											Automatically respond to incoming messages
										</FormDescription>
									</div>
									<FormControl>
										<CustomSwitch
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

					{/* Call Recording */}
					<FormField
						control={form.control}
						name="notifications.callRecording"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex-1">
										<FormLabel className="font-medium text-base">
											Call Recording
										</FormLabel>
										<FormDescription>
											Record calls for quality assurance
										</FormDescription>
									</div>
									<FormControl>
										<CustomSwitch
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

					{/* Text Notifications */}
					<FormField
						control={form.control}
						name="notifications.textNotifications"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex-1">
										<FormLabel className="font-medium text-base">
											Text Notifications
										</FormLabel>
										<FormDescription>
											Receive SMS notifications for new leads
										</FormDescription>
									</div>
									<FormControl>
										<CustomSwitch
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

					{/* Email Notifications */}
					<FormField
						control={form.control}
						name="notifications.emailNotifications"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex-1">
										<FormLabel className="font-medium text-base">
											Email Notifications
										</FormLabel>
										<FormDescription>
											Receive email updates for campaign activities
										</FormDescription>
									</div>
									<FormControl>
										<CustomSwitch
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
				</div>
			</section>
		</>
	);
};

export default PlatformSettingsFields;
