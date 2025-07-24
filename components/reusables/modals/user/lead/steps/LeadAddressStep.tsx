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
		<Input
			label="Address"
			value={address}
			onChange={(e) => onAddressChange(e.target.value)}
			error={errors.address}
			placeholder="Enter address"
		/>
		<Input
			label="City"
			value={city}
			onChange={(e) => onCityChange(e.target.value)}
			error={errors.city}
			placeholder="Enter city"
		/>
		<Input
			label="State"
			value={state}
			onChange={(e) => onStateChange(e.target.value)}
			error={errors.state}
			placeholder="Enter state"
		/>
		<Input
			label="Zip Code"
			value={zipCode}
			onChange={(e) => onZipCodeChange(e.target.value)}
			error={errors.zipCode}
			placeholder="Enter zip code"
		/>
	</div>
);

export default LeadAddressStep;
