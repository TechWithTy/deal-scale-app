import { auth } from "@/auth";
import { NextResponse } from "next/server";

async function exchangeCodeForTokens(code: string): Promise<Response> {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

	if (!clientId || !clientSecret || !redirectUri) {
		throw new Error("Missing Spotify credentials");
	}

	return fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: redirectUri,
		}),
	});
}

async function persistTokens(
	userId: string,
	tokens: {
		access_token?: string;
		refresh_token?: string;
		expires_in?: number;
	},
): Promise<void> {
	const fastApiUrl = process.env.FAST_API_URL;
	if (!fastApiUrl) return;
	try {
		await fetch(`${fastApiUrl}/user/preferences/${userId}/spotify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(tokens),
		});
	} catch (error) {
		console.error("Failed to persist Spotify tokens", error);
	}
}

export async function GET(request: Request): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);
	const errorParam = searchParams.get("error");
	if (errorParam) {
		return NextResponse.redirect(
			`/settings/integrations?spotify_error=${errorParam}`,
		);
	}

	const code = searchParams.get("code");
	if (!code) {
		return NextResponse.json(
			{ message: "Missing authorization code" },
			{ status: 400 },
		);
	}

	let response: Response;
	try {
		response = await exchangeCodeForTokens(code);
	} catch (error) {
		return NextResponse.json(
			{ message: (error as Error).message },
			{ status: 500 },
		);
	}

	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		return NextResponse.json(
			{ message: "Spotify token exchange failed", details: payload },
			{ status: response.status },
		);
	}

	const tokens = (await response.json()) as {
		access_token?: string;
		refresh_token?: string;
		expires_in?: number;
	};

	const session = await auth();
	const userId = session?.user?.id;
	if (userId) {
		await persistTokens(userId, tokens);
	}

	const params = new URLSearchParams();
	if (tokens.access_token)
		params.set("spotify_access_token", tokens.access_token);
	if (tokens.refresh_token)
		params.set("spotify_refresh_token", tokens.refresh_token);
	if (tokens.expires_in)
		params.set("spotify_expires_in", String(tokens.expires_in));

	const redirectTarget = params.size
		? `/settings/integrations?${params.toString()}`
		: "/settings/integrations";

	return NextResponse.redirect(redirectTarget);
}
