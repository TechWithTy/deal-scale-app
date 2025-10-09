"use client";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const badgeConfigs: Array<{
	readonly label: string;
	readonly message: string;
}> = [
	{
		label: "📤 Export Lead Lists",
		message: "Export lead lists to CSV, Excel, and other formats coming soon!",
	},
	{
		label: "🧪 Run A/B Tests",
		message: "A/B testing framework for campaign optimization coming soon!",
	},
	{
		label: "📊 Data Analysis",
		message:
			"Advanced analytics dashboard with insights and reporting coming soon!",
	},
	{
		label: "📄 Scan Webpages",
		message: "Smart webpage scanning for contact information coming soon!",
	},
	{
		label: "📞 Auto-Dial Contacts",
		message:
			"One-click dialing from any webpage contact information coming soon!",
	},
	{
		label: "💬 Message Management",
		message:
			"Unified inbox for texts, emails, and lead communications coming soon!",
	},
];

const QuickStartBadgeList = () => (
	<div className="flex flex-wrap justify-center gap-3">
		{badgeConfigs.map(({ label, message }) => (
			<Badge
				key={label}
				variant="secondary"
				className="cursor-pointer px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
				onClick={() => toast.info(message)}
			>
				{label}
			</Badge>
		))}
	</div>
);

export default QuickStartBadgeList;
