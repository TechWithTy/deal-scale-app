"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import CampaignPage from "@/components/campaigns/campaignPage";
import PageContainer from "@/components/layout/page-container";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { campaignSteps } from "@/_tests/tours/campaignTour";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Campaigns", link: "/dashboard/campaigns" },
];

export default function page() {
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const searchParams = useSearchParams();

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	// Handle URL parameters for direct navigation to specific campaign type
	const typeParam = searchParams.get("type");
	const campaignIdParam = searchParams.get("campaignId");

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Log URL parameters for debugging
		if (typeParam || campaignIdParam) {
			console.log("🚀 CAMPAIGN URL PARAMS:", { typeParam, campaignIdParam });
		}
	}, [searchParams, typeParam, campaignIdParam]);

	return (
		<PageContainer>
			<div className="relative w-full min-w-0 space-y-2">
				{/* Question Mark Help Button */}
				<div className="absolute top-2 right-2 z-10">
					<button
						type="button"
						onClick={() => setShowWalkthrough(true)}
						className="h-10 w-10 rounded-full border-none bg-transparent p-0 hover:bg-muted"
					>
						<HelpCircle className="h-5 w-5 text-muted-foreground" />
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
