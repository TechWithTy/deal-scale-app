import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Calendar } from "../../../../components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../../../../components/ui/popover";
import Holidays from "date-holidays";
import { Input } from "../../../../components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Play, Pause, ChevronDown } from "lucide-react";
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "../../../../components/ui/label";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../../../../../../../components/ui/accordion";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
interface TimingPreferencesStepProps {
	onNext: () => void;
	onBack: () => void;
}

const TimingPreferencesStep: FC<TimingPreferencesStepProps> = ({
	onNext,
	onBack,
}) => {
	const {
		startDate,
		endDate,
		setStartDate,
		setEndDate,
		reachBeforeBusiness,
		reachAfterBusiness,
		reachOnWeekend,
		setReachBeforeBusiness,
		setReachAfterBusiness,
		setReachOnWeekend,
		reachOnHolidays,
		setReachOnHolidays,
		getTimezoneFromLeadLocation,
		setGetTimezoneFromLeadLocation,
		minDailyAttempts,
		setMinDailyAttempts,
		maxDailyAttempts,
		setMaxDailyAttempts,
		countVoicemailAsAnswered,
		setCountVoicemailAsAnswered,
		preferredVoicemailMessageId,
		setPreferredVoicemailMessageId,
		preferredVoicemailVoiceId,
		setPreferredVoicemailVoiceId,
	} = useCampaignCreationStore();

	// Initialize holidays for default country (US). Adjust if you add UI for country selection.
	const hd = new Holidays("US");

	const isWeekend = (d: Date) => {
		const day = d.getDay();
		return day === 0 || day === 6;
	};

	const minAttemptsError = minDailyAttempts < 1;
	const maxAttemptsError = maxDailyAttempts < minDailyAttempts;

	const isHoliday = (d: Date) => Boolean(hd.isHoliday(d));

	// Ensure end date is always hydrated from store preset
	const daysSelected = useCampaignCreationStore((s) => s.daysSelected);
	useEffect(() => {
		if (!startDate) return;
		if (!endDate || (endDate as Date) < startDate) {
			const end = new Date(
				startDate.getTime() + (daysSelected || 7) * 24 * 60 * 60 * 1000,
			);
			setEndDate(end);
		}
	}, [startDate, endDate, daysSelected, setEndDate]);

	// Derive friendly labels for voice and message
	const voiceLabel = useMemo(() => {
		const map: Record<string, string> = {
			voice_emma: "Emma (Natural)",
			voice_paul: "Paul (Warm)",
			voice_matthew: "Matthew (Clear)",
		};
		return preferredVoicemailVoiceId
			? (map[preferredVoicemailVoiceId] ?? "Select a voice")
			: "Select a voice";
	}, [preferredVoicemailVoiceId]);

	const messageLabel = useMemo(() => {
		const map: Record<string, string> = {
			vm_professional: "Professional Business Message",
			vm_friendly: "Friendly Personal Message",
			vm_urgent: "Urgent Callback Message",
			vm_custom: "Custom Message (Upload Audio)",
		};
		return preferredVoicemailMessageId
			? (map[preferredVoicemailMessageId] ?? "Select a voicemail message")
			: "Select a voicemail message";
	}, [preferredVoicemailMessageId]);

	// Single audio preview controller for voice and message previews
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [playingKey, setPlayingKey] = useState<string | null>(null);

	const getAudioUrl = (
		kind: "voice" | "message",
		id: string,
	): string | null => {
		const voiceMap: Record<string, string> = {
			voice_emma: "/audio/voices/voice_emma.mp3",
			voice_paul: "/audio/voices/voice_paul.mp3",
			voice_matthew: "/audio/voices/voice_matthew.mp3",
		};
		const msgMap: Record<string, string> = {
			vm_professional: "/audio/messages/vm_professional.mp3",
			vm_friendly: "/audio/messages/vm_friendly.mp3",
			vm_urgent: "/audio/messages/vm_urgent.mp3",
			vm_custom: "/audio/messages/vm_custom.mp3",
		};
		return kind === "voice" ? (voiceMap[id] ?? null) : (msgMap[id] ?? null);
	};

	const stopAudio = () => {
		try {
			audioRef.current?.pause();
			if (audioRef.current) audioRef.current.currentTime = 0;
		} catch {}
		audioRef.current = null;
	};

	const handleTogglePlay = (
		e: React.MouseEvent,
		kind: "voice" | "message",
		id: string,
		label: string,
	) => {
		e.stopPropagation();
		const key = `${kind}:${id}`;
		if (playingKey === key) {
			stopAudio();
			setPlayingKey(null);
			return;
		}
		stopAudio();
		const url = getAudioUrl(kind, id);
		if (!url) {
			// eslint-disable-next-line no-console
			console.warn("No preview available for", { kind, id, label });
			setPlayingKey(null);
			return;
		}
		try {
			const audio = new Audio(url);
			audioRef.current = audio;
			void audio.play().catch((err) => {
				// eslint-disable-next-line no-console
				console.warn("Audio preview failed", { kind, id, error: err });
				setPlayingKey(null);
			});
			setPlayingKey(key);
			audio.onended = () => {
				setPlayingKey((curr) => (curr === key ? null : curr));
			};
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn("Audio init failed", { kind, id, error: err });
			setPlayingKey(null);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return () => {
			stopAudio();
		};
	}, []);

	const handleStartSelect = (d?: Date) => {
		if (!d) return;
		if (!reachOnWeekend && isWeekend(d)) return;
		if (!reachOnHolidays && isHoliday(d)) return;
		setStartDate(new Date(d));
	};

	const handleEndSelect = (d?: Date) => {
		if (!d) return;
		if (!reachOnWeekend && isWeekend(d)) return;
		if (!reachOnHolidays && isHoliday(d)) return;
		setEndDate(new Date(d));
	};

	return (
		<div className="space-y-6">
			<h2 className="font-semibold text-lg">Timing Preferences</h2>

			<div className="space-y-1">
				<Label>Select Start Date And End Date</Label>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" className="justify-start">
								{startDate ? startDate.toLocaleDateString() : "Start date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="p-2">
							<Calendar
								mode="single"
								selected={startDate ?? undefined}
								onSelect={(date: Date | undefined) => handleStartSelect(date)}
								fromDate={new Date()}
								disabled={(date) => {
									const weekendDisabled = !reachOnWeekend && isWeekend(date);
									const holidayDisabled = !reachOnHolidays && isHoliday(date);
									return weekendDisabled || holidayDisabled;
								}}
							/>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" className="justify-start">
								{endDate ? (endDate as Date).toLocaleDateString() : "End date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="p-2">
							<Calendar
								mode="single"
								selected={(endDate as Date) ?? undefined}
								onSelect={(date: Date | undefined) => handleEndSelect(date)}
								fromDate={startDate ?? new Date()}
								disabled={(date) => {
									const weekendDisabled = !reachOnWeekend && isWeekend(date);
									const holidayDisabled = !reachOnHolidays && isHoliday(date);
									return weekendDisabled || holidayDisabled;
								}}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="font-medium text-sm">Call Settings</h3>
				{/* Dial attempt limits per day */}
				<h4 className="font-medium text-muted-foreground text-xs">
					Daily Limits
				</h4>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-1">
						<Label htmlFor="minDailyAttempts">Minimum calls per day</Label>
						<Input
							id="minDailyAttempts"
							type="number"
							inputMode="numeric"
							min={1}
							max={20}
							value={minDailyAttempts}
							onChange={(e) => {
								const v = Math.max(1, Number(e.target.value || 0));
								// Only set min; show inline error if max < min instead of auto-adjusting
								setMinDailyAttempts(v);
							}}
						/>
						{minAttemptsError && (
							<p className="text-destructive text-xs">
								Minimum calls must be at least 1.
							</p>
						)}
					</div>
					<div className="space-y-1">
						<Label htmlFor="maxDailyAttempts">Maximum calls per day</Label>
						<Input
							id="maxDailyAttempts"
							type="number"
							inputMode="numeric"
							min={0}
							max={50}
							value={maxDailyAttempts}
							onChange={(e) => {
								const v = Math.max(0, Number(e.target.value || 0));
								// Only set max; show inline error if max < min instead of auto-adjusting
								setMaxDailyAttempts(v);
							}}
						/>
						{maxAttemptsError && (
							<p className="text-destructive text-xs">
								Max calls must be greater than or equal to minimum calls.
							</p>
						)}
					</div>
				</div>
				<div className="space-y-3">
					<Label>Voice</Label>
					<div className="space-y-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-between">
									<span>{voiceLabel}</span>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-full min-w-[300px]">
								<DropdownMenuItem
									onSelect={() => setPreferredVoicemailVoiceId("voice_emma")}
								>
									<div className="flex w-full items-center justify-between">
										<span>Emma (Natural)</span>
										<div className="flex items-center gap-1">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={(e) =>
													handleTogglePlay(
														e,
														"voice",
														"voice_emma",
														"Emma (Natural)",
													)
												}
											>
												{playingKey === "voice:voice_emma" ? (
													<Pause className="h-3 w-3" />
												) : (
													<Play className="h-3 w-3" />
												)}
											</Button>
										</div>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => setPreferredVoicemailVoiceId("voice_paul")}
								>
									<div className="flex w-full items-center justify-between">
										<span>Paul (Warm)</span>
										<div className="flex items-center gap-1">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={(e) =>
													handleTogglePlay(
														e,
														"voice",
														"voice_paul",
														"Paul (Warm)",
													)
												}
											>
												{playingKey === "voice:voice_paul" ? (
													<Pause className="h-3 w-3" />
												) : (
													<Play className="h-3 w-3" />
												)}
											</Button>
										</div>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => setPreferredVoicemailVoiceId("voice_matthew")}
								>
									<div className="flex w-full items-center justify-between">
										<span>Matthew (Clear)</span>
										<div className="flex items-center gap-1">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={(e) =>
													handleTogglePlay(
														e,
														"voice",
														"voice_matthew",
														"Matthew (Clear)",
													)
												}
											>
												{playingKey === "voice:voice_matthew" ? (
													<Pause className="h-3 w-3" />
												) : (
													<Play className="h-3 w-3" />
												)}
											</Button>
										</div>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<p className="text-muted-foreground text-xs">
							Overrides any agent voice.
						</p>
					</div>

					<Accordion type="single" collapsible className="mt-4 w-full">
						<AccordionItem value="advanced">
							<AccordionTrigger className="text-sm">
								Advanced Settings
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label className="block">Preferred Voicemail Message</Label>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-between"
												>
													<span>{messageLabel}</span>
													<ChevronDown className="h-4 w-4 opacity-50" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-full min-w-[300px]">
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_professional")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Professional Business Message</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_professional",
																		"Professional Business Message",
																	)
																}
															>
																{playingKey === "message:vm_professional" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_friendly")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Friendly Personal Message</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_friendly",
																		"Friendly Personal Message",
																	)
																}
															>
																{playingKey === "message:vm_friendly" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_urgent")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Urgent Callback Message</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_urgent",
																		"Urgent Callback Message",
																	)
																}
															>
																{playingKey === "message:vm_urgent" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() =>
														setPreferredVoicemailMessageId("vm_custom")
													}
												>
													<div className="flex w-full items-center justify-between">
														<span>Custom Message (Upload Audio)</span>
														<div className="flex items-center gap-1">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
																onClick={(e) =>
																	handleTogglePlay(
																		e,
																		"message",
																		"vm_custom",
																		"Custom Message",
																	)
																}
															>
																{playingKey === "message:vm_custom" ? (
																	<Pause className="h-3 w-3" />
																) : (
																	<Play className="h-3 w-3" />
																)}
															</Button>
														</div>
													</div>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
										<p className="text-muted-foreground text-xs">
											Choose a pre-recorded voicemail message or upload your own
											audio file.
										</p>
									</div>

									<div className="flex items-center gap-2">
										<Checkbox id="tcpaCompliance" checked={true} disabled />
										<Label htmlFor="tcpaCompliance">
											TCPA compliant & voicemail enabled
										</Label>
									</div>

									<div className="flex items-center gap-2">
										<Checkbox
											id="countVm"
											checked={countVoicemailAsAnswered}
											onCheckedChange={(v) => setCountVoicemailAsAnswered(!!v)}
										/>
										<Label htmlFor="countVm">Count voicemail as answered</Label>
									</div>

									<div>
										<h4 className="font-medium text-muted-foreground text-xs">
											When to Call
										</h4>
										<div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
											<div className="flex items-center gap-2">
												<Checkbox
													id="beforeBiz"
													checked={reachBeforeBusiness}
													onCheckedChange={(v) => setReachBeforeBusiness(!!v)}
												/>
												<Label htmlFor="beforeBiz">Call before 9 AM</Label>
											</div>
											<div className="flex items-center gap-2">
												<Checkbox
													id="afterBiz"
													checked={reachAfterBusiness}
													onCheckedChange={(v) => setReachAfterBusiness(!!v)}
												/>
												<Label htmlFor="afterBiz">Call after 5 PM</Label>
											</div>
											<div className="flex items-center gap-2">
												<Checkbox
													id="weekend"
													checked={reachOnWeekend}
													onCheckedChange={(v) => setReachOnWeekend(!!v)}
												/>
												<Label htmlFor="weekend">Call on weekends</Label>
											</div>
											<div className="flex items-center gap-2">
												<Checkbox
													id="holidays"
													checked={reachOnHolidays}
													onCheckedChange={(v) => setReachOnHolidays(!!v)}
												/>
												<Label htmlFor="holidays">Call on holidays</Label>
											</div>
											<div className="flex items-center gap-2">
												<Checkbox
													id="tzFromLeadLocation"
													checked={getTimezoneFromLeadLocation}
													disabled
													onCheckedChange={(v) =>
														setGetTimezoneFromLeadLocation(!!v)
													}
												/>
												<Label htmlFor="tzFromLeadLocation">
													Auto-detect time zones
												</Label>
											</div>
											{getTimezoneFromLeadLocation && (
												<p className="pl-6 text-muted-foreground text-xs sm:col-span-2">
													We'll automatically use the right time zone for each
													contact based on their location.
												</p>
											)}
										</div>
									</div>

									{startDate && endDate && (
										<div className="mx-auto max-w-md text-left text-muted-foreground text-xs">
											{(() => {
												const skipped: string[] = [];
												const d = new Date(startDate);
												while (d <= (endDate as Date)) {
													if (
														(!reachOnWeekend && isWeekend(d)) ||
														(!reachOnHolidays && isHoliday(d))
													) {
														skipped.push(
															new Date(d).toISOString().slice(0, 10),
														);
													}
													d.setDate(d.getDate() + 1);
												}
												if (skipped.length) {
													// eslint-disable-next-line no-console
													console.debug(
														"Skipped dates (weekends/holidays):",
														skipped,
													);
												}
												return skipped.length ? (
													<p>
														Skipping {skipped.length} day(s):{" "}
														{skipped.join(", ")}
													</p>
												) : null;
											})()}
										</div>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</div>

			<div className="mt-6 flex justify-between gap-2">
				<Button type="button" variant="ghost" onClick={onBack}>
					Back
				</Button>
				<Button type="button" onClick={onNext}>
					Next
				</Button>
			</div>
		</div>
	);
};

export { TimingPreferencesStep };
