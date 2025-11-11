import { Input } from "@/components/ui/input";
import type { FC } from "react";

interface LeadSocialsStepProps {
	facebook: string;
	linkedin: string;
	socialHandle: string;
	socialSummary: string;
	onFacebookChange: (value: string) => void;
	onLinkedinChange: (value: string) => void;
	onSocialHandleChange: (value: string) => void;
	onSocialSummaryChange: (value: string) => void;
	errors?: Record<string, string>;
}

const LeadSocialsStep: FC<LeadSocialsStepProps> = ({
	facebook,
	linkedin,
	socialHandle,
	socialSummary,
	onFacebookChange,
	onLinkedinChange,
	onSocialHandleChange,
	onSocialSummaryChange,
	errors = {},
}) => (
	<div className="space-y-4">
		<div className="space-y-2">
			<Input
				label="Facebook"
				value={facebook}
				onChange={(e) => onFacebookChange(e.target.value)}
				error={errors.facebook}
				placeholder="Enter Facebook profile URL"
			/>

			<Input
				label="LinkedIn"
				value={linkedin}
				onChange={(e) => onLinkedinChange(e.target.value)}
				error={errors.linkedin}
				placeholder="Enter LinkedIn profile URL"
			/>

			<Input
				label="Social Handle"
				value={socialHandle}
				onChange={(e) => onSocialHandleChange(e.target.value)}
				error={errors.socialHandle}
				placeholder="@handle or username"
			/>

			<div>
				<label
					htmlFor="socialSummary"
					className="mb-1 block font-medium text-sm"
				>
					Social Summary
				</label>
				<textarea
					id="socialSummary"
					value={socialSummary}
					onChange={(e) => onSocialSummaryChange(e.target.value)}
					placeholder="Short summary about socials or notes"
					className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
					rows={3}
					aria-invalid={Boolean(errors.socialSummary)}
				/>
				{errors.socialSummary && (
					<p className="mt-1 text-destructive text-sm">
						{errors.socialSummary}
					</p>
				)}
			</div>
		</div>
	</div>
);

export default LeadSocialsStep;
