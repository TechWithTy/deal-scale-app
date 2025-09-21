import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { useEffect, useRef } from "react";
import {
	initAutocomplete,
	type ACSeed,
} from "@/external/google-maps-two/components/composit/utils/autocomplete";

interface LocationInputProps {
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
	onPlaceSelected?: (seed: ACSeed) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
	control,
	errors,
	onPlaceSelected,
}) => {
	const { setFilters } = useLeadSearchStore();
	const inputRef = useRef<HTMLInputElement | null>(null);

	return (
		<Controller
			name="location"
			control={control}
			render={({ field }) => {
				const { onChange, ref: rhfRef, ...restField } = field;
				// Wire Google Autocomplete once the input is mounted
				// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
								// Restrict to US while allowing broad prediction types (matches test page behavior)
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
					<div className="flex flex-col">
						<Label htmlFor="location" className="mb-2">
							Location*
						</Label>
						<Input
							id="location"
							// Merge RHF ref with our local ref
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
					</div>
				);
			}}
		/>
	);
};

export default LocationInput;
