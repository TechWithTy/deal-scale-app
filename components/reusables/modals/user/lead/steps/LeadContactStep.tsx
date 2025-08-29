import { Input } from "@/components/ui/input";
import type { FC } from "react";

interface LeadContactStepProps {
	phoneNumber: string;
	email: string;
	isIphone: boolean;
	onPhoneNumberChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	onIsIphoneChange: (value: boolean) => void;
	errors?: Record<string, string>;
}

const LeadContactStep: FC<LeadContactStepProps> = ({
	phoneNumber,
	email,
	isIphone,
	onPhoneNumberChange,
	onEmailChange,
	onIsIphoneChange,
	errors = {},
}) => (
	<div className="space-y-4">
		<Input
			label="Phone Number"
			value={phoneNumber}
			onChange={(e) => onPhoneNumberChange(e.target.value)}
			error={errors.phoneNumber}
			placeholder="Enter phone number"
		/>
		<Input
			label="Email"
			value={email}
			onChange={(e) => onEmailChange(e.target.value)}
			error={errors.email}
			placeholder="Enter email"
		/>
		<div className="flex items-center gap-2">
			<input
				id="isIphone"
				type="checkbox"
				className="h-4 w-4"
				checked={isIphone}
				onChange={(e) => onIsIphoneChange(e.target.checked)}
			/>
			<label htmlFor="isIphone" className="text-sm">
				Device is iPhone
			</label>
		</div>
	</div>
);

export default LeadContactStep;
