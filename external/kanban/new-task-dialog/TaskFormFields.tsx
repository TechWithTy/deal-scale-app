"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormFieldsProps {
	assignType: "lead" | "leadList" | "";
	initialValues?: {
		title?: string;
		description?: string;
		dueDate?: string;
		appointmentDate?: string;
		appointmentTime?: string;
		youtubeUrl?: string;
	};
}

export function TaskFormFields({
	assignType,
	initialValues,
}: TaskFormFieldsProps) {
	return (
		<>
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

			{assignType === "lead" && (
				<>
					<div className="mb-2">
						<label
							htmlFor="appointmentDate"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Appointment Date <span className="text-gray-400">(optional)</span>
						</label>
						<Input
							id="appointmentDate"
							name="appointmentDate"
							type="date"
							aria-label="Appointment Date"
							className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							defaultValue={initialValues?.appointmentDate}
						/>
					</div>
					<div className="mb-2">
						<label
							htmlFor="appointmentTime"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Appointment Time <span className="text-gray-400">(optional)</span>
						</label>
						<Input
							id="appointmentTime"
							name="appointmentTime"
							type="time"
							aria-label="Appointment Time"
							className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							defaultValue={initialValues?.appointmentTime}
						/>
					</div>
				</>
			)}

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

			{/* Single Attachment */}
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
