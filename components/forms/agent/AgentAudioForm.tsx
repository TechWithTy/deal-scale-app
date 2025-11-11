"use client";

import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Agent } from "./utils/schema";

interface AgentAudioFormProps {
	form: UseFormReturn<Agent>;
	voices: { id: string; name: string }[];
	voicemails: { id: string; name: string }[];
	backgroundNoises: { id: string; name: string }[];
	onShowCloneModal: () => void;
	onShowVoicemailModal: () => void;
}

export function AgentAudioForm({
	form,
	voices,
	voicemails,
	backgroundNoises,
	onShowCloneModal,
	onShowVoicemailModal,
}: AgentAudioFormProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="voice"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Voice</FormLabel>
						<div className="flex items-center space-x-2">
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a voice" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{voices.map((voice) => (
										<SelectItem key={voice.id} value={voice.id}>
											{voice.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								type="button"
								variant="outline"
								onClick={onShowCloneModal}
							>
								Clone
							</Button>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="backgroundNoise"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Background Noise (Optional)</FormLabel>
						<div className="flex items-center space-x-2">
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a noise" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{backgroundNoises.map((noise) => (
										<SelectItem key={noise.id} value={noise.id}>
											{noise.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									document.getElementById("background-noise-upload")?.click()
								}
							>
								Upload
							</Button>
							<FormControl>
								<Input
									id="background-noise-upload"
									type="file"
									accept="audio/*"
									className="hidden"
									onChange={(e) => field.onChange(e.target.files?.[0]?.name)}
								/>
							</FormControl>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="voicemailScript"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Voicemail</FormLabel>
						<div className="flex items-center space-x-2">
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a voicemail" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{voicemails.map((voicemail) => (
										<SelectItem key={voicemail.id} value={voicemail.id}>
											{voicemail.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								type="button"
								variant="outline"
								onClick={onShowVoicemailModal}
							>
								Record
							</Button>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
