import { NextResponse } from "next/server";

function buildSpotifyAuthorizeUrl(): string {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
	const scope = process.env.SPOTIFY_SCOPES;

	if (!clientId || !redirectUri || !scope) {
		throw new Error("Missing Spotify configuration");
	}

	const params = new URLSearchParams({
		client_id: clientId,
		response_type: "code",
		redirect_uri: redirectUri,
		scope,
	});

	return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function GET(): Promise<NextResponse> {
	try {
		return NextResponse.redirect(buildSpotifyAuthorizeUrl());
	} catch (error) {
		return NextResponse.json(
			{ message: (error as Error).message },
			{ status: 500 },
		);
	}
}
