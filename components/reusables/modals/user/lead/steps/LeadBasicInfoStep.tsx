import { Input } from "@/components/ui/input";
import type { FC } from "react";

interface LeadBasicInfoStepProps {
	firstName: string;
	lastName: string;
	onFirstNameChange: (value: string) => void;
	onLastNameChange: (value: string) => void;
	errors?: Record<string, string>;
}

const LeadBasicInfoStep: FC<LeadBasicInfoStepProps> = ({
	firstName,
	lastName,
	onFirstNameChange,
	onLastNameChange,
	errors = {},
}) => (
	<div className="space-y-4">
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="firstName">
				First Name
			</label>
			<Input
				id="firstName"
				value={firstName}
				onChange={(e) => onFirstNameChange(e.target.value)}
				placeholder="Enter first name"
			/>
			{errors.firstName && (
				<span className="text-red-500 text-xs">{errors.firstName}</span>
			)}
		</div>
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="lastName">
				Last Name
			</label>
			<Input
				id="lastName"
				value={lastName}
				onChange={(e) => onLastNameChange(e.target.value)}
				placeholder="Enter last name"
			/>
			{errors.lastName && (
				<span className="text-red-500 text-xs">{errors.lastName}</span>
			)}
		</div>
	</div>
);

export default LeadBasicInfoStep;
