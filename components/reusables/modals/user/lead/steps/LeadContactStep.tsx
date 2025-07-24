import { Input } from "@/components/ui/input";
import type { FC } from "react";

interface LeadContactStepProps {
	phoneNumber: string;
	email: string;
	onPhoneNumberChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	errors?: Record<string, string>;
}

const LeadContactStep: FC<LeadContactStepProps> = ({
	phoneNumber,
	email,
	onPhoneNumberChange,
	onEmailChange,
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
	</div>
);

export default LeadContactStep;
