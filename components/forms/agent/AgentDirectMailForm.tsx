import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { FileUpload } from "./FileUpload";
import type { Agent } from "./utils/schema";

interface AgentDirectMailFormProps {
	form: UseFormReturn<Agent>;
}

export function AgentDirectMailForm({ form }: AgentDirectMailFormProps) {
	return (
		<div className="space-y-4">
			<Controller
				name="directMailTemplates"
				control={form.control}
				render={({ field, fieldState }) => (
					<FileUpload
						label="Direct Mail Templates"
						value={field.value || []}
						onChange={field.onChange}
						error={fieldState.error?.message}
						maxFiles={5} // Allow up to 5 templates
					/>
				)}
			/>
		</div>
	);
}
