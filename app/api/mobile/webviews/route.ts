import { getMobileWebviewManifests } from "@/lib/config/mobile/webviews";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
	const webviews = getMobileWebviewManifests().map((manifest) => ({
		id: manifest.id,
		title: manifest.title,
		description: manifest.description,
		uri: manifest.uri,
		allowedOrigins: manifest.allowedOrigins,
		offlineFallbackPath: manifest.offlineFallbackPath ?? null,
		featureFlags: manifest.featureFlags,
		analytics: manifest.analytics ?? null,
		allowedMessagingTopics: manifest.allowedMessagingTopics,
	}));

	return NextResponse.json(
		{ webviews },
		{
			headers: {
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
			},
		},
	);
}
