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
import { Slider } from "@/components/ui/slider";

interface AgentPublicationFormProps {
	form: UseFormReturn<Agent>;
}

export function AgentPublicationForm({ form }: AgentPublicationFormProps) {
	const isPublic = form.watch("isPublic");
	const isFree = form.watch("isFree");

	return (
		<div className="space-y-4">
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

			{isPublic && (
				<div className="space-y-4 rounded-lg border p-4">
					<FormField
						control={form.control}
						name="isFree"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel className="text-base">Make Agent Free</FormLabel>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="priceMultiplier"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Price Multiplier: {isFree ? "N/A" : `${field.value}x`}
								</FormLabel>
								<FormControl>
									<Slider
										disabled={isFree}
										min={1}
										max={5}
										step={1}
										value={[field.value]}
										onValueChange={(value) => field.onChange(value[0])}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
			)}
		</div>
	);
}
