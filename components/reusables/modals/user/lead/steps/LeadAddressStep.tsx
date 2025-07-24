import { Input } from "@/components/ui/input";
import type { FC } from "react";

interface LeadAddressStepProps {
	address: string;
	city: string;
	state: string;
	zipCode: string;
	onAddressChange: (value: string) => void;
	onCityChange: (value: string) => void;
	onStateChange: (value: string) => void;
	onZipCodeChange: (value: string) => void;
	errors?: Record<string, string>;
}

const LeadAddressStep: FC<LeadAddressStepProps> = ({
	address,
	city,
	state,
	zipCode,
	onAddressChange,
	onCityChange,
	onStateChange,
	onZipCodeChange,
	errors = {},
}) => (
	<div className="space-y-4">
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="streetAddress">
				Street Address
			</label>
			<Input
				id="streetAddress"
				value={address}
				onChange={(e) => onAddressChange(e.target.value)}
				placeholder="Enter street address"
				error={errors.address}
			/>
		</div>
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="city">
				City
			</label>
			<Input
				id="city"
				value={city}
				onChange={(e) => onCityChange(e.target.value)}
				placeholder="Enter city"
				error={errors.city}
			/>
		</div>
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="state">
				State
			</label>
			<Input
				id="state"
				value={state}
				onChange={(e) => onStateChange(e.target.value)}
				placeholder="Enter state"
				error={errors.state}
			/>
		</div>
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="zipCode">
				Zip Code
			</label>
			<Input
				id="zipCode"
				value={zipCode}
				onChange={(e) => onZipCodeChange(e.target.value)}
				placeholder="Enter zip code"
				error={errors.zipCode}
			/>
		</div>
	</div>
);

export default LeadAddressStep;
