// * LeadSearchHeader.tsx
// ! Heading and help modal trigger for the leads search UI
import { HelpCircle } from "lucide-react";

import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { FC } from "react";

// ! Add this prop to the interface if not present
interface LeadSearchHeaderProps {
	onHelpClick: () => void;
	title?: string;
	description?: string;
	creditsRemaining?: number;
}

const LeadSearchHeader: FC<LeadSearchHeaderProps> = ({
	onHelpClick,
	title = "Leads Search",
	description = "Quickly search for properties by location, filters, and more.",
	creditsRemaining: creditsRemainingProp,
}) => {
	const credits =
		typeof creditsRemainingProp !== "undefined"
			? creditsRemainingProp
			: mockUserProfile
				? mockUserProfile.subscription.aiCredits.allotted -
					mockUserProfile.subscription.aiCredits.used
				: undefined;

	return (
		<div className="mb-6 flex flex-col items-center justify-center gap-2 text-center">
			<h1 className="mb-1 font-bold text-2xl">{title}</h1>
			<p className="text-gray-500 text-sm dark:text-gray-400">{description}</p>
			{/* Credits Remaining Text and Help Button */}
			{typeof credits !== "undefined" && (
				<div className="my-4 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					{/* Credits Remaining */}
					<div className="font-semibold text-gray-900 text-lg dark:text-white">
						Lead Credits Remaining: {credits}
					</div>
					{/* Help Button (moves to new line on mobile) */}

					<button
						type="button"
						onClick={onHelpClick}
						title="Get More help"
						className="rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
					>
						<HelpCircle size={20} />
					</button>
				</div>
			)}
		</div>
	);
};

export default LeadSearchHeader;
