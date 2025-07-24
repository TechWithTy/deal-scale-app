"use client";

import { AgentAvatar } from "@/components/aiAgents/AgentAvatar";
import type { UseFormReturn } from "react-hook-form";
import type { Agent } from "./utils/schema";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface AgentDetailsFormProps {
	form: UseFormReturn<Agent>;
	imagePreview: string | null;
	handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AgentDetailsForm({
	form,
	imagePreview,
	handleImageChange,
}: AgentDetailsFormProps) {
	const { name, type, description } = form.watch();
	const isGenerationDisabled = !name || !type || !description;
	return (
		<>
			<FormField
				control={form.control}
				name="image"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Agent Image</FormLabel>
						<div className="flex items-center space-x-4">
							<AgentAvatar src={imagePreview} alt="Agent Preview" size={64} />
							<div className="flex w-full items-center space-x-2">
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
									/>
								</FormControl>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="inline-block cursor-not-allowed">
												<Button
													type="button"
													variant="outline"
													className={`whitespace-nowrap ${
														isGenerationDisabled ? "pointer-events-none" : ""
													}`}
													disabled={isGenerationDisabled}
												>
													Generate Image
												</Button>
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												Please fill out Name, Agent Type, and Description to
												-enable image generation.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Name</FormLabel>
						<FormControl>
							<Input placeholder="e.g., Q4 Sales Agent" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="type"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Agent Type</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select an agent type" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="phone">Phone</SelectItem>
								<SelectItem value="direct mail">Direct Mail</SelectItem>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="social">Social</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Description</FormLabel>
						<FormControl>
							<Textarea
								placeholder="e.g., A brief summary of the agent's purpose."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="campaignGoal"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Campaign Goal</FormLabel>
						<FormControl>
							<Textarea
								placeholder="e.g., Book 150 qualified demos in Q4."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="persona"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Persona</FormLabel>
						<FormControl>
							<Input placeholder="e.g., Friendly & Helpful" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="salesScript"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Sales Script</FormLabel>
						<FormControl>
							<Textarea
								placeholder="e.g., Hi [Name], I'm calling from..."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
