"use client";

import { trainingVideos } from "@/constants/resourcesData";
import type { TrainingVideo } from "@/types/_dashboard/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { Play, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function TrainingVideosSection() {
	const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleVideoClick = (video: TrainingVideo) => {
		setSelectedVideo(video);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedVideo(null);
	};

	const getCategoryBadge = (category: TrainingVideo["category"]) => {
		const variants: Record<TrainingVideo["category"], string> = {
			"getting-started":
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
			"lead-generation":
				"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
			campaigns:
				"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
			advanced:
				"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
		};

		return variants[category] || "";
	};

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<Video className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="font-semibold text-2xl">Training Videos</h2>
					<p className="text-muted-foreground text-sm">
						Learn from expert tutorials and platform guides
					</p>
				</div>
			</div>

			{/* Videos Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{trainingVideos.map((video) => (
					<Card
						key={video.id}
						className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
						onClick={() => handleVideoClick(video)}
					>
						<div className="relative aspect-video overflow-hidden bg-muted">
							<Image
								src={video.thumbnail}
								alt={video.title}
								fill
								className="object-cover transition-transform group-hover:scale-105"
								unoptimized
							/>
							<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
									<Play className="ml-1 h-8 w-8 text-primary-foreground" />
								</div>
							</div>
							<div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 font-medium text-white text-xs">
								{video.duration}
							</div>
						</div>
						<CardHeader className="p-4">
							<div className="mb-2 flex items-center justify-between">
								<Badge
									variant="outline"
									className={getCategoryBadge(video.category)}
								>
									{video.category.replace("-", " ")}
								</Badge>
							</div>
							<CardTitle className="line-clamp-2 text-base">
								{video.title}
							</CardTitle>
							<CardDescription className="line-clamp-2 text-sm">
								{video.description}
							</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>

			{/* Video Modal */}
			{selectedVideo && (
				<WalkThroughModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					videoUrl={selectedVideo.youtubeUrl}
					title={selectedVideo.title}
					subtitle={selectedVideo.description}
				/>
			)}
		</div>
	);
}
