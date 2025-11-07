"use client";

import type { UseFormReturn } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Agent } from "./utils/schema";

interface AgentPublicationFormProps {
	form: UseFormReturn<Agent>;
}

export function AgentPublicationForm({ form }: AgentPublicationFormProps) {
	const isPublic = form.watch("isPublic");
	const isFree = form.watch("isFree");
	const agentType = form.watch("type");
	const billingCycle = form.watch("billingCycle");
	const priceMultiplier = form.watch("priceMultiplier");

	// Simple placeholder base rate by agent type. Replace with API-driven values later.
	const baseRateByType: Record<string, number> = {
		phone: 200,
		"direct mail": 150,
		social: 100,
	};

	const baseRate = baseRateByType[agentType ?? ""] ?? 0;
	const estimated = (priceMultiplier ?? 1) * baseRate;

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
					{/* Billing cycle selection */}
					<FormField
						control={form.control}
						name="billingCycle"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Billing Cycle</FormLabel>
								<FormControl>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select billing cycle" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="monthly">Monthly</SelectItem>
											<SelectItem value="one-time">One-time</SelectItem>
										</SelectContent>
									</Select>
								</FormControl>
							</FormItem>
						)}
					/>

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

					{!isFree && (
						<FormField
							control={form.control}
							name="priceMultiplier"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price Multiplier</FormLabel>
									<FormControl>
										<Select
											onValueChange={(val) => field.onChange(Number(val))}
											defaultValue={String(field.value ?? 1)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select multiplier" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">1x</SelectItem>
												<SelectItem value="2">2x</SelectItem>
												<SelectItem value="3">3x</SelectItem>
												<SelectItem value="4">4x</SelectItem>
												<SelectItem value="5">5x</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<div className="pt-2 text-muted-foreground text-sm">
										<div>
											Estimated{" "}
											{billingCycle === "one-time" ? "One-time" : "Monthly"}{" "}
											Income:{" "}
											{estimated.toLocaleString("en-US", {
												style: "currency",
												currency: "USD",
											})}
										</div>
										<div>
											Agent Performance Score (vs. avg.):{" "}
											<span className="text-primary">Calculating...</span>
										</div>
									</div>
								</FormItem>
							)}
						/>
					)}
				</div>
			)}
		</div>
	);
}
