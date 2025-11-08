import { NextResponse } from "next/server";

import { getMobileWebviewManifests } from "@/lib/config/mobile/webviews";

export async function GET(): Promise<NextResponse> {
	const manifests = getMobileWebviewManifests();

	return NextResponse.json(
		{
			webviews: manifests.map((manifest) => ({
				id: manifest.id,
				title: manifest.title,
				description: manifest.description,
				uri: manifest.uri,
				allowedOrigins: manifest.allowedOrigins,
				offlineFallbackPath: manifest.offlineFallbackPath ?? null,
				featureFlags: manifest.featureFlags,
				analytics: manifest.analytics ?? null,
				allowedMessagingTopics: manifest.allowedMessagingTopics,
			})),
		},
		{
			headers: {
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
			},
		},
	);
}
