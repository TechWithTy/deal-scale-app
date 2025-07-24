// * LeadSearchHeader.tsx
// ! Heading and help modal trigger for the leads search UI
import { HelpCircle } from "lucide-react";
import type { FC } from "react";

interface LeadSearchHeaderProps {
	onHelpClick: () => void;
	title?: string;
	description?: string;
}

const LeadSearchHeader: FC<LeadSearchHeaderProps> = ({
	onHelpClick,
	title = "Leads Search",
	description = "Quickly search for properties by location, filters, and more.",
}) => (
	<div className="mb-6 flex items-center justify-between">
		<div>
			<h1 className="mb-1 font-bold text-2xl">{title}</h1>
			<p className="text-gray-500 text-sm dark:text-gray-400">{description}</p>
		</div>
		<button
			type="button"
			onClick={onHelpClick}
			aria-label="Show search help"
			className="ml-4 rounded-full p-2 hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-700"
		>
			<HelpCircle className="h-5 w-5 text-primary" />
		</button>
	</div>
);

export default LeadSearchHeader;
