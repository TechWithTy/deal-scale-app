"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormFieldsProps {
	assignType: "lead" | "leadList" | "";
	initialValues?: {
		title?: string;
		description?: string;
		scheduledDate?: string;
		scheduledTimezone?: string;
		dueDate?: string;
		// For backward compat, keep split fields but prefer appointmentDateTime
		appointmentDate?: string;
		appointmentTime?: string;
		appointmentDateTime?: string;
		appointmentTimezone?: string;
		youtubeUrl?: string;
	};
}

export function TaskFormFields({
	assignType,
	initialValues,
}: TaskFormFieldsProps) {
	// Ensure datetime-local control gets a properly formatted value.
	// If we have a date-only string (YYYY-MM-DD), append midnight time so it renders.
	const formatDateTimeLocal = (value?: string) => {
		if (!value) return undefined;
		// Already datetime-like
		if (value.includes("T")) return value.slice(0, 16);
		// Date-only -> add T00:00
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;
		return value;
	};
	// Determine a sensible default time zone (user's local)
	const localTz = (() => {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		} catch {
			return "UTC";
		}
	})();
	const scheduledTzDefault = initialValues?.scheduledTimezone || localTz;
	const appointmentTzDefault = initialValues?.appointmentTimezone || localTz;
	return (
		<>
			<div className="mb-2">
				<label
					htmlFor="title"
					className="mb-1 block font-medium text-foreground text-sm"
				>
					Todo Title
				</label>
				<Input
					id="title"
					name="title"
					placeholder="Enter a concise task title"
					aria-label="Todo Title"
					className="w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					required
					defaultValue={initialValues?.title}
				/>
			</div>

			{/* Scheduled Date & Time + Timezone (optional) */}
			<div className="mb-2">
				<label
					htmlFor="scheduledDate"
					className="mb-1 block font-medium text-foreground text-sm"
				>
					Scheduled Date & Time{" "}
					<span className="text-muted-foreground">(optional)</span>
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					<Input
						id="scheduledDate"
						name="scheduledDate"
						type="datetime-local"
						aria-label="Scheduled Date"
						className="w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
						defaultValue={formatDateTimeLocal(initialValues?.scheduledDate)}
					/>
					<select
						id="scheduledTimezone"
						name="scheduledTimezone"
						aria-label="Scheduled Timezone"
						defaultValue={scheduledTzDefault}
						className="w-full rounded-md border px-3 py-2 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
					>
						{/* Minimal curated list + local */}
						<option value={scheduledTzDefault}>{scheduledTzDefault}</option>
						<option value="UTC">UTC</option>
						<option value="America/Los_Angeles">America/Los_Angeles</option>
						<option value="America/Denver">America/Denver</option>
						<option value="America/Chicago">America/Chicago</option>
						<option value="America/New_York">America/New_York</option>
						<option value="Europe/London">Europe/London</option>
						<option value="Europe/Berlin">Europe/Berlin</option>
						<option value="Asia/Tokyo">Asia/Tokyo</option>
						<option value="Australia/Sydney">Australia/Sydney</option>
					</select>
				</div>
			</div>

			{/* Due Date Field (required) */}
			<div className="mb-2">
				<label
					htmlFor="dueDate"
					className="mb-1 block font-medium text-foreground text-sm"
				>
					Due Date <span className="text-destructive">*</span>
				</label>
				<Input
					id="dueDate"
					name="dueDate"
					type="date"
					aria-label="Due Date"
					className="w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					required
					defaultValue={initialValues?.dueDate}
				/>
			</div>

			{assignType === "lead" && (
				<div className="mb-2">
					<label
						htmlFor="appointmentDateTime"
						className="mb-1 block font-medium text-foreground text-sm"
					>
						Appointment Date & Time{" "}
						<span className="text-muted-foreground">(optional)</span>
					</label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						<Input
							id="appointmentDateTime"
							name="appointmentDateTime"
							type="datetime-local"
							aria-label="Appointment Date and Time"
							className="w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							defaultValue={formatDateTimeLocal(
								initialValues?.appointmentDateTime ||
									(initialValues?.appointmentDate &&
									initialValues?.appointmentTime
										? `${initialValues.appointmentDate}T${initialValues.appointmentTime}`
										: undefined),
							)}
						/>
						<select
							id="appointmentTimezone"
							name="appointmentTimezone"
							aria-label="Appointment Timezone"
							defaultValue={appointmentTzDefault}
							className="w-full rounded-md border px-3 py-2 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
						>
							<option value={appointmentTzDefault}>
								{appointmentTzDefault}
							</option>
							<option value="UTC">UTC</option>
							<option value="America/Los_Angeles">America/Los_Angeles</option>
							<option value="America/Denver">America/Denver</option>
							<option value="America/Chicago">America/Chicago</option>
							<option value="America/New_York">America/New_York</option>
							<option value="Europe/London">Europe/London</option>
							<option value="Europe/Berlin">Europe/Berlin</option>
							<option value="Asia/Tokyo">Asia/Tokyo</option>
							<option value="Asia/Kolkata">Asia/Kolkata</option>
							<option value="Australia/Sydney">Australia/Sydney</option>
						</select>
					</div>
				</div>
			)}

			<div className="mb-2">
				<label
					htmlFor="description"
					className="mb-1 block font-medium text-foreground text-sm"
				>
					Description
				</label>
				<Textarea
					id="description"
					name="description"
					placeholder="Add details, context, or acceptance criteria..."
					aria-label="Todo Description"
					className="min-h-[80px] w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					required
					defaultValue={initialValues?.description}
				/>
			</div>

			{/* Media Fields */}
			<div className="mb-2">
				<label
					htmlFor="youtubeUrl"
					className="mb-1 block font-medium text-foreground text-sm"
				>
					YouTube URL <span className="text-muted-foreground">(optional)</span>
				</label>
				<Input
					id="youtubeUrl"
					name="youtubeUrl"
					type="url"
					placeholder="https://www.youtube.com/watch?v=..."
					aria-label="YouTube URL"
					className="w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					defaultValue={initialValues?.youtubeUrl}
				/>
			</div>

			{/* Single Attachment */}
			<div className="mb-2">
				<label
					htmlFor="attachmentFiles"
					className="mb-1 block font-medium text-foreground text-sm"
				>
					Attachments{" "}
					<span className="text-muted-foreground">(up to 6, optional)</span>
				</label>
				<Input
					id="attachmentFiles"
					name="attachmentFiles"
					type="file"
					multiple
					aria-label="Attachment Files"
					className="w-full rounded-md border px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
				/>
			</div>
		</>
	);
}
