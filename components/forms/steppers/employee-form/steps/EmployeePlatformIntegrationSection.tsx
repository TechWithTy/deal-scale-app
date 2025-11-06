"use client";

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TeamMemberFormValues } from "@/types/zod/userSetup/team-member-form-schema";
import type { UseFormReturn } from "react-hook-form";

interface EmployeePlatformIntegrationSectionProps {
	form: UseFormReturn<TeamMemberFormValues>;
	loading: boolean;
}

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
	"Australia/Sydney",
];

export function EmployeePlatformIntegrationSection({
	form,
	loading,
}: EmployeePlatformIntegrationSectionProps) {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Platform Integration Settings</h3>
				<p className="text-sm text-muted-foreground">
					Configure collaboration and communication settings for this team
					member.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Call Transfer Buffer Time */}
				<FormField
					control={form.control}
					name="platformIntegration.callTransferBufferTime"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Call Transfer Buffer Time (seconds)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="30"
									{...field}
									value={field.value ?? 30}
									onChange={(e) => field.onChange(Number(e.target.value))}
									disabled={loading}
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
					name="platformIntegration.textBufferPeriod"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Text Buffer Period (minutes)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="5"
									{...field}
									value={field.value ?? 5}
									onChange={(e) => field.onChange(Number(e.target.value))}
									disabled={loading}
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
					name="platformIntegration.workingHoursStart"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Working Hours Start</FormLabel>
							<FormControl>
								<Input
									type="time"
									placeholder="09:00"
									{...field}
									value={field.value ?? "09:00"}
									disabled={loading}
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
					name="platformIntegration.workingHoursEnd"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Working Hours End</FormLabel>
							<FormControl>
								<Input
									type="time"
									placeholder="17:00"
									{...field}
									value={field.value ?? "17:00"}
									disabled={loading}
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
					name="platformIntegration.timezone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Timezone</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value ?? "America/New_York"}
								disabled={loading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select timezone" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{timezones.map((tz) => (
										<SelectItem key={tz} value={tz}>
											{tz.replace(/_/g, " ")}
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
					name="platformIntegration.maxConcurrentConversations"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Max Concurrent Conversations</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="5"
									{...field}
									value={field.value ?? 5}
									onChange={(e) => field.onChange(Number(e.target.value))}
									disabled={loading}
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

			{/* Toggle Switches */}
			<div className="space-y-4 rounded-lg border p-4">
				<h4 className="font-medium text-sm">Communication Preferences</h4>

				<FormField
					control={form.control}
					name="platformIntegration.autoResponseEnabled"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<FormLabel>Auto-Response</FormLabel>
								<FormDescription>
									Automatically respond to incoming messages
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value ?? false}
									onCheckedChange={field.onChange}
									disabled={loading}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="platformIntegration.enableCallRecording"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<FormLabel>Call Recording</FormLabel>
								<FormDescription>
									Record calls for quality assurance
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value ?? false}
									onCheckedChange={field.onChange}
									disabled={loading}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="platformIntegration.enableTextNotifications"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<FormLabel>Text Notifications</FormLabel>
								<FormDescription>
									Receive SMS notifications for new leads
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value ?? false}
									onCheckedChange={field.onChange}
									disabled={loading}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="platformIntegration.enableEmailNotifications"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<FormLabel>Email Notifications</FormLabel>
								<FormDescription>
									Receive email updates for campaign activities
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value ?? false}
									onCheckedChange={field.onChange}
									disabled={loading}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
