import { Input } from "@/components/ui/input";
import type { FC } from "react";

interface LeadSocialsStepProps {
	facebook: string;
	linkedin: string;
	instagram: string;
	twitter: string;
	onFacebookChange: (value: string) => void;
	onLinkedinChange: (value: string) => void;
	onInstagramChange: (value: string) => void;
	onTwitterChange: (value: string) => void;
	errors?: Record<string, string>;
}

const LeadSocialsStep: FC<LeadSocialsStepProps> = ({
	facebook,
	linkedin,
	instagram,
	twitter,
	onFacebookChange,
	onLinkedinChange,
	onInstagramChange,
	onTwitterChange,
	errors = {},
}) => (
	<div className="space-y-4">
		<div className="space-y-2">
			<Input
				label="Facebook"
				value={facebook}
				onChange={(e) => onFacebookChange(e.target.value)}
				error={errors.facebook}
				placeholder="Enter Facebook profile"
			/>

			<Input
				label="LinkedIn"
				value={linkedin}
				onChange={(e) => onLinkedinChange(e.target.value)}
				error={errors.linkedin}
				placeholder="Enter LinkedIn profile"
			/>

			<Input
				label="Instagram"
				value={instagram}
				onChange={(e) => onInstagramChange(e.target.value)}
				error={errors.instagram}
				placeholder="Enter Instagram profile"
			/>

			<Input
				label="Twitter"
				value={twitter}
				onChange={(e) => onTwitterChange(e.target.value)}
				error={errors.twitter}
				placeholder="Enter Twitter profile"
			/>
		</div>
	</div>
);

export default LeadSocialsStep;
