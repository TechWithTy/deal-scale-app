import type {
	SocialAction,
	SocialMediaCampaign,
} from "@/types/_dashboard/campaign";
import React, { useState } from "react";

// Component for rendering actions in a dropdown per platform
export const PlatformActionsDropdown = ({
	actions,
}: {
	actions: SocialMediaCampaign["actions"];
}) => {
	const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

	// Extract available platforms from the actions
	const platforms = Array.from(
		new Set(
			actions.map((action) => {
				if (action.type.includes("📩")) return "LinkedIn";
				if (["Like", "Follow", "Retweet"].includes(action.type))
					return "Twitter";
				return "Instagram";
			}),
		),
	);

	// Get actions for the selected platform
	const filteredActions = selectedPlatform
		? actions.filter((action) => {
				if (selectedPlatform === "LinkedIn") return action.type.includes("📩");
				if (selectedPlatform === "Twitter")
					return ["Like", "Follow", "Retweet"].includes(action.type);
				return ["Like", "Follow", "Comment", "👁️ Story"].includes(action.type);
			})
		: [];

	return (
		<div className="relative">
			<select
				className="max-w-[150px] rounded-md border p-2"
				onChange={(e) => setSelectedPlatform(e.target.value)}
				defaultValue=""
			>
				<option value="" disabled>
					Select Platform
				</option>
				{platforms.map((platform) => (
					<option key={platform} value={platform}>
						{platform}
					</option>
				))}
			</select>
			{/* Display actions for the selected platform */}
			{selectedPlatform && (
				<ul className="mt-2 space-y-1">
					{filteredActions.map((action) => (
						<li key={action.type} className="flex justify-between">
							<div>
								{/* Action type with interaction counts */}
								<span>{action.type}</span>
								<span className="ml-2 text-gray-600 text-sm">
									(Attempts: {action.attempt}, Successes: {action.successful},
									Failures: {action.failed})
								</span>
							</div>
							<a
								href={action.viewLink}
								target="_blank"
								rel="noreferrer"
								className="text-blue-500 hover:underline"
							>
								View
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default PlatformActionsDropdown;
