import type { ChangeEvent, FC } from "react";

interface BillingAddressStepProps {
	fullName: string;
	country: string;
	addressLine1: string;
	onFullNameChange: (value: string) => void;
	onCountryChange: (value: string) => void;
	onAddressLine1Change: (value: string) => void;
	errors?: Record<string, string>;
}

const BillingAddressStep: FC<BillingAddressStepProps> = ({
	fullName,
	country,
	addressLine1,
	onFullNameChange,
	onCountryChange,
	onAddressLine1Change,
	errors = {},
}) => (
	<div className="space-y-4">
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="fullName">
				Full Name*
			</label>
			<input
				id="fullName"
				className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				value={fullName}
				onChange={(e) => onFullNameChange(e.target.value)}
				placeholder="Full name as on card"
			/>
			{errors.fullName && (
				<span className="text-red-500 text-xs">{errors.fullName}</span>
			)}
		</div>
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="country">
				Country*
			</label>
			<input
				id="country"
				className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				value={country}
				onChange={(e) => onCountryChange(e.target.value)}
				placeholder="Country"
			/>
			{errors.country && (
				<span className="text-red-500 text-xs">{errors.country}</span>
			)}
		</div>
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="addressLine1">
				Address*
			</label>
			<input
				id="addressLine1"
				className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				value={addressLine1}
				onChange={(e) => onAddressLine1Change(e.target.value)}
				placeholder="123 Main St"
			/>
			{errors.addressLine1 && (
				<span className="text-red-500 text-xs">{errors.addressLine1}</span>
			)}
		</div>
	</div>
);

export default BillingAddressStep;
