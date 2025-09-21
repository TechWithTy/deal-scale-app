"use client";

import { Youtube } from "lucide-react";

export function Media({
	youtubeUrl,
	outputVideoUrl,
}: {
	youtubeUrl?: string | null;
	outputVideoUrl?: string | null;
}) {
	return (
		<>
			{youtubeUrl && (
				<div className="mt-3 text-sm">
					<div className="mb-1 font-semibold flex items-center gap-2">
						<Youtube className="h-4 w-4 text-primary" /> Video
					</div>
					<a
						href={youtubeUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-primary underline"
					>
						Watch on YouTube
					</a>
				</div>
			)}

			{outputVideoUrl && (
				<div className="mt-3 text-sm">
					<div className="mb-1 font-semibold">Output Video</div>
					<video controls className="mt-1 w-full max-h-64 rounded border">
						<source src={outputVideoUrl} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</div>
			)}
		</>
	);
}
