"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormFieldsProps {
	assignType: "lead" | "leadList" | "";
	initialValues?: {
		title?: string;
		description?: string;
		dueDate?: string;
		scheduledDate?: string;
		scheduledTimezone?: string;
		appointmentDateTime?: string;
		appointmentTimezone?: string;
		youtubeUrl?: string;
		acceptanceCriteria?: string;
		negativeList?: string;
	};
}

export function TaskFormFields({
	assignType,
	initialValues,
}: TaskFormFieldsProps) {
	// Resolve a sensible default timezone for the select
	const localTz = (() => {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		} catch {
			return "UTC";
		}
	})();
	return (
		<>
			{/* Todo Title Field */}
			<div className="mb-2">
				<label
					htmlFor="title"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Todo Title
				</label>
				<Input
					id="title"
					name="title"
					placeholder="Enter a concise task title"
					aria-label="Todo Title"
					className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					required
					defaultValue={initialValues?.title}
				/>
			</div>

			{/* Acceptance Criteria Field */}
			<div className="mb-2">
				<label
					htmlFor="acceptanceCriteria"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Acceptance Criteria <span className="text-gray-400">(optional)</span>
				</label>
				<Textarea
					id="acceptanceCriteria"
					name="acceptanceCriteria"
					placeholder="List clear, testable criteria for success..."
					aria-label="Acceptance Criteria"
					className="min-h-[72px] w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					defaultValue={initialValues?.acceptanceCriteria}
				/>
			</div>

			{/* Do Not Do / Constraints Field */}
			<div className="mb-2">
				<label
					htmlFor="negativeList"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Do Not Do / Constraints{" "}
					<span className="text-gray-400">(optional)</span>
				</label>
				<Textarea
					id="negativeList"
					name="negativeList"
					placeholder="What should the agent avoid doing? (tone, channels, PII, etc.)"
					aria-label="Do Not Do List"
					className="min-h-[72px] w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					defaultValue={initialValues?.negativeList}
				/>
			</div>

			{/* Due Date Field */}
			<div className="mb-2">
				<label
					htmlFor="dueDate"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Due Date <span className="text-red-500">*</span>
				</label>
				<Input
					id="dueDate"
					name="dueDate"
					type="date"
					aria-label="Due Date"
					className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					required
					defaultValue={initialValues?.dueDate}
				/>
			</div>

			{/* Scheduled Date & Time with Timezone (optional) */}
			<div className="mb-2">
				<label
					htmlFor="scheduledDate"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Scheduled Date & Time{" "}
					<span className="text-gray-400">(optional)</span>
				</label>
				<div className="flex gap-2">
					<Input
						id="scheduledDate"
						name="scheduledDate"
						type="datetime-local"
						aria-label="Scheduled Date & Time"
						className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
						defaultValue={initialValues?.scheduledDate}
					/>
					<select
						id="scheduledTimezone"
						name="scheduledTimezone"
						aria-label="Timezone"
						className="h-9 rounded-md border bg-background px-3 text-sm"
						defaultValue={initialValues?.scheduledTimezone || localTz}
					>
						<option value={localTz}>{localTz} (local)</option>
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

			{/* Appointment Date & Time - Single field for single lead assignment */}
			{assignType === "lead" && (
				<div className="mb-2">
					<label
						htmlFor="appointmentDateTime"
						className="mb-1 block font-medium text-gray-700 text-sm"
					>
						Appointment Date & Time{" "}
						<span className="text-gray-400">(optional)</span>
					</label>
					<div className="flex gap-2">
						<Input
							id="appointmentDateTime"
							name="appointmentDateTime"
							type="datetime-local"
							aria-label="Appointment Date & Time"
							className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							defaultValue={initialValues?.appointmentDateTime}
						/>
						<select
							id="appointmentTimezone"
							name="appointmentTimezone"
							aria-label="Appointment Timezone"
							className="h-9 rounded-md border bg-background px-3 text-sm"
							defaultValue={initialValues?.appointmentTimezone || localTz}
						>
							<option value={localTz}>{localTz} (local)</option>
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

			{/* Description Field */}
			<div className="mb-2">
				<label
					htmlFor="description"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Description
				</label>
				<Textarea
					id="description"
					name="description"
					placeholder="Add details, context, or acceptance criteria..."
					aria-label="Todo Description"
					className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					required
					defaultValue={initialValues?.description}
				/>
			</div>

			{/* Media Fields */}
			<div className="mb-2">
				<label
					htmlFor="youtubeUrl"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					YouTube URL <span className="text-gray-400">(optional)</span>
				</label>
				<Input
					id="youtubeUrl"
					name="youtubeUrl"
					type="url"
					placeholder="https://www.youtube.com/watch?v=..."
					aria-label="YouTube URL"
					className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
					defaultValue={initialValues?.youtubeUrl}
				/>
			</div>

			{/* Attachments */}
			<div className="mb-2">
				<label
					htmlFor="attachmentFiles"
					className="mb-1 block font-medium text-gray-700 text-sm"
				>
					Attachments <span className="text-gray-400">(up to 6, optional)</span>
				</label>
				<Input
					id="attachmentFiles"
					name="attachmentFiles"
					type="file"
					multiple
					aria-label="Attachment Files"
					className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
				/>
			</div>
		</>
	);
}
