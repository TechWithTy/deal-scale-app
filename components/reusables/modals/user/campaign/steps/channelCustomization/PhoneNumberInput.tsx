import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface PhoneNumberInputProps {
	disabled?: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value: string;
}

const PhoneNumberInput = forwardRef<HTMLInputElement, PhoneNumberInputProps>(
	({ disabled = true, onChange, value, ...props }, ref) => {
		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			// * 1. Get only the digits from the input
			let digits = e.target.value.replace(/\D/g, "");

			// * 2. If the number starts with '1' (common for pasted US numbers), strip it off.
			if (digits.startsWith("1")) {
				digits = digits.substring(1);
			}

			// * 3. Take the first 10 digits.
			const truncated = digits.slice(0, 10);

			// * 4. Prepend '+1' for the final formatted value.
			const formatted = `+1${truncated}`;

			// * 5. Create a synthetic event to pass to the form's onChange handler.
			const syntheticEvent = {
				...e,
				target: {
					...e.target,
					value: formatted,
				},
			};

			onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
		};

		return (
			<div className="w-full">
				<label htmlFor="callPhone" className="mb-2 block font-medium text-sm">
					Primary Phone Number
				</label>
				<Input
					id="callPhone"
					placeholder="+1 XXX-XXX-XXXX"
					className="w-full"
					type="tel" // * Use 'tel' for better semantics
					maxLength={12}
					disabled={disabled}
					{...props}
					value={value} // * Ensure the controlled value is used
					onChange={handleInputChange}
					ref={ref}
				/>
				<p className="mt-1 text-gray-500 text-xs">
					Update your phone number on your profile.
				</p>
			</div>
		);
	},
);

PhoneNumberInput.displayName = "PhoneNumberInput";

export default PhoneNumberInput;
