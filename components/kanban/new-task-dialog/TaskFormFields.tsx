"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormFieldsProps {
	assignType: "lead" | "leadList" | "";
}

export function TaskFormFields({ assignType }: TaskFormFieldsProps) {
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
				/>
			</div>

			{/* Appointment Date & Time Fields - Only for single lead assignment */}
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
						/>
					</div>
				</>
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
				/>
			</div>
		</>
	);
}
