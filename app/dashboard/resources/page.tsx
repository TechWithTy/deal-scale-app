"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { CustomGPTsSection } from "@/components/resources/CustomGPTsSection";
import { MentorsSection } from "@/components/resources/MentorsSection";
import { SimulationsSection } from "@/components/resources/SimulationsSection";
import { TrainingVideosSection } from "@/components/resources/TrainingVideosSection";
import {
	matchesResourceQuery,
	resourceTabs,
	type ResourceTabValue,
} from "@/components/resources/resourceSearch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	customGPTs,
	mentors,
	simulations,
	trainingVideos,
} from "@/constants/resourcesData";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Resources", link: "/dashboard/resources" },
];

export default function ResourcesPage() {
	const [activeTab, setActiveTab] = useState<ResourceTabValue>("all");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredTrainingVideos = useMemo(
		() =>
			trainingVideos.filter((video) =>
				matchesResourceQuery(searchQuery, [
					video.title,
					video.description,
					video.category,
					video.duration,
				]),
			),
		[searchQuery],
	);

	const filteredCustomGPTs = useMemo(
		() =>
			customGPTs.filter((gpt) =>
				matchesResourceQuery(searchQuery, [
					gpt.name,
					gpt.description,
					gpt.category,
					gpt.isPremium ? "premium" : "standard",
				]),
			),
		[searchQuery],
	);

	const filteredSimulations = useMemo(
		() =>
			simulations.filter((simulation) =>
				matchesResourceQuery(searchQuery, [
					simulation.name,
					simulation.description,
					simulation.type,
					simulation.difficulty ?? "",
				]),
			),
		[searchQuery],
	);

	const filteredMentors = useMemo(
		() =>
			mentors.filter((mentor) =>
				matchesResourceQuery(searchQuery, [
					mentor.name,
					mentor.bio,
					mentor.expertise.join(" "),
					mentor.specialties ?? "",
					mentor.contactMethod,
					mentor.availability,
				]),
			),
		[searchQuery],
	);

	const totalMatches =
		filteredTrainingVideos.length +
		filteredCustomGPTs.length +
		filteredSimulations.length +
		filteredMentors.length;

	return (
		<PageContainer>
			<div className="space-y-6" data-tour="resources-page">
				<Breadcrumbs items={breadcrumbItems} />

				<div className="space-y-4 rounded-2xl border bg-card/50 p-5 shadow-sm">
					<div className="space-y-2">
						<h1 className="font-bold text-3xl tracking-tight">Resources</h1>
						<p className="max-w-3xl text-muted-foreground">
							Everything you need to succeed in real estate investing, from
							training videos and AI tools to simulations and expert mentors.
						</p>
					</div>

					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								aria-label="Search resources"
								className="pl-9"
								placeholder="Search resources by title, category, or keyword..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
							/>
						</div>
						<Badge variant="secondary" className="w-fit">
							{searchQuery
								? `${totalMatches} matching resources`
								: `${totalMatches} resources available`}
						</Badge>
					</div>
				</div>

				<Tabs
					className="space-y-6"
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as ResourceTabValue)}
				>
					<div className="overflow-x-auto pb-1">
						<TabsList className="h-auto w-max gap-2 bg-transparent p-0">
							{resourceTabs.map((tab) => {
								const tabCount = (() => {
									switch (tab.value) {
										case "training-videos":
											return filteredTrainingVideos.length;
										case "custom-gpts":
											return filteredCustomGPTs.length;
										case "simulations":
											return filteredSimulations.length;
										case "mentors":
											return filteredMentors.length;
										default:
											return totalMatches;
									}
								})();

								return (
									<TabsTrigger
										key={tab.value}
										className="rounded-full border border-border bg-background px-4 py-2 shadow-sm data-[state=active]:border-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
										value={tab.value}
									>
										<span>{tab.label}</span>
										<span className="ml-2 text-xs opacity-70">{tabCount}</span>
									</TabsTrigger>
								);
							})}
						</TabsList>
					</div>

					<TabsContent
						className="mt-0 space-y-6 focus-visible:outline-none"
						value="all"
					>
						<TrainingVideosSection videos={filteredTrainingVideos} />
						<Separator className="my-8" />
						<CustomGPTsSection gpts={filteredCustomGPTs} />
						<Separator className="my-8" />
						<SimulationsSection simulationsList={filteredSimulations} />
						<Separator className="my-8" />
						<MentorsSection mentorsList={filteredMentors} />
					</TabsContent>

					<TabsContent
						className="mt-0 focus-visible:outline-none"
						value="training-videos"
					>
						<TrainingVideosSection videos={filteredTrainingVideos} />
					</TabsContent>

					<TabsContent
						className="mt-0 focus-visible:outline-none"
						value="custom-gpts"
					>
						<CustomGPTsSection gpts={filteredCustomGPTs} />
					</TabsContent>

					<TabsContent
						className="mt-0 focus-visible:outline-none"
						value="simulations"
					>
						<SimulationsSection simulationsList={filteredSimulations} />
					</TabsContent>

					<TabsContent
						className="mt-0 focus-visible:outline-none"
						value="mentors"
					>
						<MentorsSection mentorsList={filteredMentors} />
					</TabsContent>
				</Tabs>
			</div>
		</PageContainer>
	);
}
