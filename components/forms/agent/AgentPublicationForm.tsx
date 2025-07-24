"use client";

import type { UseFormReturn } from "react-hook-form";

import type { Agent } from "./utils/schema";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface AgentPublicationFormProps {
	form: UseFormReturn<Agent>;
}

export function AgentPublicationForm({ form }: AgentPublicationFormProps) {
	return (
		<FormField
			control={form.control}
			name="isPublic"
			render={({ field }) => (
				<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
					<div className="space-y-0.5">
						<FormLabel className="text-base">Make Agent Public</FormLabel>
					</div>
					<FormControl>
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					</FormControl>
				</FormItem>
			)}
		/>
	);
}
