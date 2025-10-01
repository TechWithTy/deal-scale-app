"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import CampaignPage from "@/components/campaigns/campaignPage";
import PageContainer from "@/components/layout/page-container";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { campaignSteps } from "@/_tests/tours/campaignTour";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Campaigns", link: "/dashboard/campaigns" },
];

export default function page() {
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	return (
		<PageContainer>
			<div className="w-full min-w-0 space-y-2 relative">
				{/* Question Mark Help Button */}
				<div className="absolute top-2 right-2 z-10">
					<button
						onClick={() => setShowWalkthrough(true)}
						className="rounded-full w-10 h-10 p-0 hover:bg-muted bg-transparent border-none"
					>
						<HelpCircle className="w-5 h-5 text-muted-foreground" />
					</button>
				</div>

				<Breadcrumbs items={breadcrumbItems} />
				{/* ! Keep inner content from forcing layout width */}
				<div className="w-full min-w-0">
					<CampaignPage />
				</div>

				{/* WalkThrough Modal */}
				<WalkThroughModal
					isOpen={showWalkthrough}
					onClose={() => setShowWalkthrough(false)}
					videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
					title="Campaign Management Guide"
					subtitle="Learn how to create and manage your marketing campaigns effectively."
					steps={campaignSteps}
					isTourOpen={isTourOpen}
					onStartTour={handleStartTour}
					onCloseTour={handleCloseTour}
				/>
			</div>
		</PageContainer>
	);
}
