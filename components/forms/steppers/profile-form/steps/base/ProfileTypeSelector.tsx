"use client";
/**
 * ProfileTypeSelector: Select user profile type and goal
 * Syncs with QuickStart wizard flow
 */

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type QuickStartGoalId,
	type QuickStartPersonaId,
	quickStartGoals,
	quickStartPersonas,
} from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface ProfileTypeSelectorProps {
	loading: boolean;
}

export const ProfileTypeSelector: React.FC<ProfileTypeSelectorProps> = ({
	loading,
}) => {
	const form = useFormContext<ProfileFormValues>();
	const { selectPersona, selectGoal } = useQuickStartWizardDataStore();
	const selectedPersonaId = form.watch("profileType");

	// Filter goals based on selected persona
	const availableGoals = selectedPersonaId
		? quickStartGoals.filter((goal) => goal.personaId === selectedPersonaId)
		: [];

	// When persona changes, sync with QuickStart wizard store
	useEffect(() => {
		if (selectedPersonaId) {
			selectPersona(selectedPersonaId as QuickStartPersonaId);
		}
	}, [selectedPersonaId, selectPersona]);

	// When goal changes, sync with QuickStart wizard store
	const selectedGoalId = form.watch("profileGoal");
	useEffect(() => {
		if (selectedGoalId) {
			selectGoal(selectedGoalId as QuickStartGoalId);
		}
	}, [selectedGoalId, selectGoal]);

	const selectedPersona = quickStartPersonas.find(
		(p) => p.id === selectedPersonaId,
	);
	const selectedGoal = quickStartGoals.find((g) => g.id === selectedGoalId);

	return (
		<div className="space-y-5">
			{/* Profile Type Selection */}
			<FormField
				control={form.control}
				name="profileType"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="font-semibold text-base">
							Profile Type *
						</FormLabel>
						<Select
							disabled={loading}
							onValueChange={(value) => {
								field.onChange(value);
								form.setValue("profileGoal", "");
							}}
							value={field.value}
							required
						>
							<FormControl>
								<SelectTrigger className="h-12 text-base">
									<SelectValue placeholder="Select your role..." />
								</SelectTrigger>
							</FormControl>
							<SelectContent className="w-full min-w-[280px] sm:min-w-[400px]">
								{quickStartPersonas.map((persona) => (
									<SelectItem
										key={persona.id}
										value={persona.id}
										className="cursor-pointer px-3 py-3"
									>
										<div className="flex w-full items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
												<span className="font-bold text-lg text-primary">
													{persona.title.charAt(0)}
												</span>
											</div>
											<div className="flex min-w-0 flex-1 items-baseline gap-1.5">
												<span className="shrink-0 font-semibold text-sm">
													{persona.title}
												</span>
												<span className="truncate text-muted-foreground text-xs">
													- {persona.headline}
												</span>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{!selectedPersonaId && (
							<FormDescription className="text-xs">
								Choose the role that best describes your real estate business
							</FormDescription>
						)}
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Selected Persona Card */}
			{selectedPersona && (
				<div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
					<div className="flex items-start gap-3">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary">
							<span className="font-bold text-primary-foreground text-xl">
								{selectedPersona.title.charAt(0)}
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<h4 className="mb-1 font-semibold text-base text-primary">
								{selectedPersona.headline}
							</h4>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{selectedPersona.description}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Goal Selection */}
			{selectedPersonaId && availableGoals.length > 0 && (
				<FormField
					control={form.control}
					name="profileGoal"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-semibold text-base">
								Primary Goal *
							</FormLabel>
							<Select
								disabled={loading}
								onValueChange={field.onChange}
								value={field.value}
								required
							>
								<FormControl>
									<SelectTrigger className="h-12 text-base">
										<SelectValue placeholder="Select your primary goal..." />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="w-full min-w-[280px] sm:min-w-[400px]">
									{availableGoals.map((goal, idx) => (
										<SelectItem
											key={goal.id}
											value={goal.id}
											className="cursor-pointer px-3 py-3"
										>
											<div className="flex w-full items-center gap-3">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
													<span className="font-bold text-lg text-orange-600 dark:text-orange-300">
														{idx + 1}
													</span>
												</div>
												<div className="flex min-w-0 flex-1 items-baseline gap-1.5">
													<span className="shrink-0 font-semibold text-sm">
														{goal.title}
													</span>
													<span className="truncate text-muted-foreground text-xs">
														- {goal.description}
													</span>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{!selectedGoalId && (
								<FormDescription className="text-xs">
									Select your main objective to customize your workflow
								</FormDescription>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{/* Selected Goal Card */}
			{selectedGoal && (
				<div className="rounded-lg border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:from-orange-950 dark:to-orange-900">
					<div className="space-y-3">
						<Badge
							variant="default"
							className="bg-orange-600 hover:bg-orange-700"
						>
							Recommended
						</Badge>
						<div className="space-y-1.5">
							<h4 className="font-semibold text-base text-orange-900 dark:text-orange-100">
								{selectedGoal.title}
							</h4>
							<p className="text-orange-800 text-sm leading-relaxed dark:text-orange-200">
								<span className="font-semibold">Expected Outcome:</span>{" "}
								{selectedGoal.outcome}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProfileTypeSelector;
