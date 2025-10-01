"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/page-container";
import { LeadClient } from "@/components/tables/lead-tables/client";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { campaignSteps } from "@/_tests/tours/campaignTour";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Leads", link: "/dashboard/lead" },
];

export default function page() {
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	return (
		<PageContainer>
			<div className="space-y-2 relative">
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
				<LeadClient />

				{/* WalkThrough Modal */}
				<WalkThroughModal
					isOpen={showWalkthrough}
					onClose={() => setShowWalkthrough(false)}
					videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
					title="Lead Management Guide"
					subtitle="Learn how to manage and organize your leads effectively."
					steps={campaignSteps}
					isTourOpen={isTourOpen}
					onStartTour={handleStartTour}
					onCloseTour={handleCloseTour}
				/>
			</div>
		</PageContainer>
	);
}
