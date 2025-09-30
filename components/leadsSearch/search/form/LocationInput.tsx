import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Controller,
	type Control,
	type FieldErrors,
	type UseFormSetValue,
	useWatch,
} from "react-hook-form";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { useEffect, useRef, useState } from "react";
import {
	initAutocomplete,
	type ACSeed,
} from "external/google-maps-two/components/composit/utils/autocomplete";
import { cn } from "@/lib/_utils";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	PERSONA_OPTIONS,
	GOAL_OPTIONS,
	deriveSuggestion,
} from "./locationSuggestions";

interface LocationInputProps {
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
	setValue: UseFormSetValue<MapFormSchemaType>;
	onPlaceSelected?: (seed: ACSeed) => void;
	aiSummary?: {
		message?: string;
		zipCodes?: string[];
		title?: string;
	};
}

const LocationInput: React.FC<LocationInputProps> = ({
	control,
	errors,
	setValue,
	onPlaceSelected,
}) => {
	const { setFilters } = useLeadSearchStore();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);

	// Watch persona and goal from the form to drive AI suggestions
	const watchedPersona = useWatch({ control, name: "persona" });
	const watchedGoal = useWatch({ control, name: "goal" });

	const personaDescription =
		PERSONA_OPTIONS.find((o) => o.value === watchedPersona)?.description ??
		"Choose a persona to tailor suggestions.";
	const goalLabel =
		GOAL_OPTIONS.find((o) => o.value === watchedGoal)?.label ??
		"Balanced Growth";
	const suggestion = deriveSuggestion(
		(watchedPersona as unknown as string) ?? "investor",
		(watchedGoal as unknown as string) ?? "cashflow",
	);

	return (
		<Controller
			name="location"
			control={control}
			render={({ field }) => {
				const { onChange, ref: rhfRef, ...restField } = field;

				const handleApplySuggestion = () => {
					const nextValue = suggestion.zip;
					onChange(nextValue as unknown as string);
					setFilters({
						location: nextValue,
						persona: watchedPersona,
						goal: watchedGoal,
					});
					setValue("persona", watchedPersona, {
						shouldDirty: false,
						shouldValidate: false,
					});
					setValue("goal", watchedGoal, {
						shouldDirty: false,
						shouldValidate: false,
					});
					try {
						if (inputRef.current) {
							inputRef.current.value = nextValue;
							inputRef.current.focus();
						}
					} catch {}
					setPopoverOpen(false);
				};

				// Wire Google Autocomplete once the input is mounted
				// biome-ignore lint/correctness/useExhaustiveDependencies: we only want to rewire when deps change
				useEffect(() => {
					if (!inputRef.current) return;
					let cleanup: (() => void) | undefined;
					(async () => {
						cleanup = await initAutocomplete(
							inputRef.current as HTMLInputElement,
							(seed) => {
								const display = seed.formattedAddress || seed.name || "";
								const loc = seed.location;
								const valueStr =
									display || (loc ? `${loc.lat}, ${loc.lng}` : "");
								// Update RHF and store with a friendly address string
								onChange(valueStr as unknown as string);
								setFilters({ location: valueStr });
								// Bubble up selection if parent wants to act (e.g., show popover on map)
								try {
									onPlaceSelected?.(seed);
								} catch {}
								// Reflect text in the input for UX
								try {
									if (inputRef.current) inputRef.current.value = valueStr;
								} catch {}
							},
							{
								fields: ["place_id", "geometry", "name", "formatted_address"],
								componentRestrictions: { country: "us" },
							},
						);
					})();
					return () => {
						try {
							cleanup?.();
						} catch {}
					};
				}, [onChange, setFilters]);

				return (
					<div className="flex flex-col gap-3">
						<Label htmlFor="location" className="mb-2">
							Location*
						</Label>
						<Input
							id="location"
							ref={(el) => {
								inputRef.current = el;
								rhfRef(el);
							}}
							placeholder="Enter a city, address, or zip code"
							type="text"
							autoComplete="off"
							error={errors.location?.message as string}
							{...restField}
							onChange={(e) => {
								onChange(e);
								setFilters({ location: e.target.value });
							}}
							className="w-full"
						/>
						<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="default"
									className="inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 px-4 py-1.5 font-medium text-sm text-white shadow-md transition hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-700"
								>
									<Sparkles className="h-4 w-4" aria-hidden="true" />
									<span>AI Suggest</span>
									<Sparkles className="h-3 w-3 opacity-80" aria-hidden="true" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 space-y-4" align="start">
								<div className="space-y-2">
									<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
										Client persona
									</p>
									<div className="flex flex-wrap gap-2">
										{PERSONA_OPTIONS.map((option) => (
											<Button
												key={option.value}
												variant="outline"
												onClick={() => {
													setValue("persona", option.value, {
														shouldDirty: true,
														shouldValidate: true,
													});
													setFilters({ persona: option.value });
												}}
												type="button"
												className={cn(
													"h-auto rounded-full border border-muted-foreground/30 px-3 py-1 text-xs",
													watchedPersona === option.value
														? "bg-primary/15 text-primary"
														: "bg-card text-muted-foreground",
												)}
											>
												{option.title}
											</Button>
										))}
									</div>
									<p className="text-muted-foreground text-xs">
										{personaDescription}
									</p>
								</div>
								<div className="space-y-2">
									<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
										Primary goal
									</p>
									<div className="flex flex-wrap gap-2">
										{GOAL_OPTIONS.map((option) => (
											<Button
												key={option.value}
												variant="secondary"
												onClick={() => {
													setValue("goal", option.value, {
														shouldDirty: true,
														shouldValidate: true,
													});
													setFilters({ goal: option.value });
												}}
												type="button"
												className={cn(
													"h-auto rounded-full px-3 py-1 text-xs",
													watchedGoal === option.value
														? "bg-primary text-primary-foreground"
														: "bg-muted text-muted-foreground",
												)}
											>
												{option.label}
											</Button>
										))}
									</div>
								</div>
								<div className="space-y-3 rounded-lg border border-border bg-card/80 p-3">
									<p className="text-muted-foreground text-xs">
										Recommended ZIP
									</p>
									<p className="font-semibold text-2xl text-primary tracking-tight">
										{suggestion.zip}
									</p>
									<p className="text-muted-foreground text-xs">
										Based on Deal Scale trends for {watchedPersona} pursuing{" "}
										{goalLabel}
									</p>
								</div>
								<Button
									className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
									onClick={handleApplySuggestion}
								>
									Apply ZIP
								</Button>
							</PopoverContent>
						</Popover>
					</div>
				);
			}}
		/>
	);
};

export default LocationInput;
