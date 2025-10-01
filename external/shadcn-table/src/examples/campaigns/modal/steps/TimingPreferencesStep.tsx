import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "../../../../components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../../../../components/ui/popover";
import Holidays from "date-holidays";
import { useCampaignCreationStore } from "../../../../lib/stores/campaignCreation";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Play, Pause, ChevronDown } from "lucide-react";
import type { FC } from "react";
import { Label } from "@/components/ui/label";

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
				<h4 className="font-medium text-muted-foreground text-xs">Daily Limits</h4>
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
					<Label>Preferred Voicemail Messages</Label>
					<div className="space-y-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-between">
									<span>Select a voicemail message</span>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-full min-w-[300px]">
								<DropdownMenuItem
									onSelect={() => console.log("Selected: Professional Business Message")}
								>
									<div className="flex items-center justify-between w-full">
										<span>Professional Business Message</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-6 w-6 p-0"
											onClick={(e) => {
												e.stopPropagation();
												console.log("Play Professional Business Message");
											}}
										>
											<Play className="h-3 w-3" />
										</Button>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => console.log("Selected: Friendly Personal Message")}
								>
									<div className="flex items-center justify-between w-full">
										<span>Friendly Personal Message</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-6 w-6 p-0"
											onClick={(e) => {
												e.stopPropagation();
												console.log("Play Friendly Personal Message");
											}}
										>
											<Play className="h-3 w-3" />
										</Button>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => console.log("Selected: Urgent Callback Message")}
								>
									<div className="flex items-center justify-between w-full">
										<span>Urgent Callback Message</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-6 w-6 p-0"
											onClick={(e) => {
												e.stopPropagation();
												console.log("Play Urgent Callback Message");
											}}
										>
											<Play className="h-3 w-3" />
										</Button>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={() => console.log("Selected: Custom Message")}
								>
									<div className="flex items-center justify-between w-full">
										<span>Custom Message (Upload Audio)</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-6 w-6 p-0"
											onClick={(e) => {
												e.stopPropagation();
												console.log("Play Custom Message");
											}}
										>
											<Play className="h-3 w-3" />
										</Button>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<p className="text-muted-foreground text-xs">
							Choose a pre-recorded voicemail message or upload your own audio file.
						</p>
					</div>
				</div>

				{/* TCPA Compliance Settings */}
				<div className="flex items-center gap-2">
					<Checkbox
						id="tcpaCompliance"
						checked={true}
						disabled
					/>
					<Label htmlFor="tcpaCompliance">TCPA compliant & voicemail enabled</Label>
				</div>

				{/* Count voicemail as answered */}
				<div className="flex items-center gap-2">
					<Checkbox
						id="countVm"
						checked={countVoicemailAsAnswered}
						onCheckedChange={(v) => setCountVoicemailAsAnswered(!!v)}
					/>
					<Label htmlFor="countVm">Count voicemail as answered</Label>
				</div>

				<h4 className="font-medium text-muted-foreground text-xs">
					When to Call
				</h4>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
							onCheckedChange={(v) => setGetTimezoneFromLeadLocation(!!v)}
						/>
						<Label htmlFor="tzFromLeadLocation">
							Auto-detect time zones
						</Label>
					</div>
					{getTimezoneFromLeadLocation && (
						<p className="pl-6 text-muted-foreground text-xs sm:col-span-2">
							We'll automatically use the right time zone for each contact based on their location.
						</p>
					)}
				</div>
			</div>

			{/* Debug: Show skipped dates within selected range */}
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
								skipped.push(new Date(d).toISOString().slice(0, 10));
							}
							d.setDate(d.getDate() + 1);
						}
						if (skipped.length) {
							// eslint-disable-next-line no-console
							console.debug("Skipped dates (weekends/holidays):", skipped);
						}
						return skipped.length ? (
							<p>
								Skipping {skipped.length} day(s): {skipped.join(", ")}
							</p>
						) : null;
					})()}
				</div>
			)}

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
