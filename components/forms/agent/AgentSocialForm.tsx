"use client";

import type { UseFormReturn } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Agent } from "./utils/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AgentSocialFormProps {
	form: UseFormReturn<Agent>;
	avatars: { id: string; name: string; image: string }[];
}

export function AgentSocialForm({ form, avatars }: AgentSocialFormProps) {
	const avatarImage = form.watch("avatarImage");
	return (
		<Card>
			<CardHeader>
				<CardTitle>Social Presence</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<FormField
					control={form.control}
					name="avatar"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormLabel>Select Avatar</FormLabel>
							<FormControl>
								<div className="max-h-60 overflow-y-auto rounded-lg border p-2">
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="grid grid-cols-3 gap-4"
									>
										{avatars.map((avatar) => (
											<FormItem
												key={avatar.id}
												className="flex flex-col items-center space-y-2"
											>
												<FormControl>
													<RadioGroupItem
														value={avatar.image}
														className="sr-only"
													/>
												</FormControl>
												<FormLabel className="cursor-pointer">
													<Image
														src={avatar.image}
														alt={avatar.name}
														width={100}
														height={100}
														className={`rounded-full transition-all duration-200 ${
															field.value === avatar.image
																? "ring-2 ring-primary ring-offset-2 ring-offset-background"
																: "hover:opacity-80"
														}`}
													/>
													<span className="block text-center text-sm">
														{avatar.name}
													</span>
												</FormLabel>
											</FormItem>
										))}
									</RadioGroup>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center space-x-2">
					<FormField
						control={form.control}
						name="avatarImage"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Upload Custom Avatar</FormLabel>
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										onChange={(e) => field.onChange(e.target.files?.[0])}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="mt-8 inline-block cursor-not-allowed">
									<Button
										type="button"
										variant="outline"
										className={!avatarImage ? "pointer-events-none" : ""}
										disabled={!avatarImage}
									>
										Generate Avatar
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent id="generate-avatar-tooltip">
								<p>Upload a custom avatar to enable generation.</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<FormField
					control={form.control}
					name="backgroundVideo"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Background Video</FormLabel>
							<FormControl>
								<Input
									type="file"
									accept="video/*"
									onChange={(e) => field.onChange(e.target.files?.[0])}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-3 gap-4">
					<FormField
						control={form.control}
						name="color1"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Color 1</FormLabel>
								<FormControl>
									<Input type="color" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="color2"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Color 2</FormLabel>
								<FormControl>
									<Input type="color" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="color3"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Color 3</FormLabel>
								<FormControl>
									<Input type="color" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
