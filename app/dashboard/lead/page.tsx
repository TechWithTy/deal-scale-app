"use client";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { LeadClient } from "@/components/tables/lead-tables/client";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useState } from "react";

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
			<div className="relative space-y-2">
				{/* Question Mark Help Button */}
				<div className="absolute top-2 right-2 z-10">
					<button
						onClick={() => setShowWalkthrough(true)}
						className="h-10 w-10 rounded-full border-none bg-transparent p-0 hover:bg-muted"
					>
						<HelpCircle className="h-5 w-5 text-muted-foreground" />
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
