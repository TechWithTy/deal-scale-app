"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { CustomGPTsSection } from "@/components/resources/CustomGPTsSection";
import { MentorsSection } from "@/components/resources/MentorsSection";
import { SimulationsSection } from "@/components/resources/SimulationsSection";
import { TrainingVideosSection } from "@/components/resources/TrainingVideosSection";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Resources", link: "/dashboard/resources" },
];

export default function ResourcesPage() {
	return (
		<PageContainer>
			<div className="space-y-6">
				{/* Breadcrumbs */}
				<Breadcrumbs items={breadcrumbItems} />

				{/* Page Header */}
				<div className="space-y-2">
					<h1 className="font-bold text-3xl tracking-tight">Resources</h1>
					<p className="text-muted-foreground">
						Everything you need to succeed in real estate investing - training
						videos, AI tools, simulations, and expert mentorship.
					</p>
				</div>

				<Separator />

				{/* Training Videos Section */}
				<TrainingVideosSection />

				<Separator className="my-8" />

				{/* Custom GPTs Section */}
				<CustomGPTsSection />

				<Separator className="my-8" />

				{/* Investment Simulations Section */}
				<SimulationsSection />

				<Separator className="my-8" />

				{/* Investor Mentors Section */}
				<MentorsSection />
			</div>
		</PageContainer>
	);
}
