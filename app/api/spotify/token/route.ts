import { auth } from "@/auth";
import { NextResponse } from "next/server";

async function resolveRefreshToken(
	userId: string | null,
): Promise<string | null> {
	const fastApiUrl = process.env.FAST_API_URL;
	if (userId && fastApiUrl) {
		try {
			const response = await fetch(
				`${fastApiUrl}/user/preferences/${userId}/spotify-refresh-token`,
				{
					method: "GET",
					credentials: "include",
				},
			);
			if (response.ok) {
				const data = (await response.json()) as { refresh_token?: string };
				if (data.refresh_token) return data.refresh_token;
			}
		} catch (error) {
			console.error("Failed to retrieve user Spotify refresh token", error);
		}
	}

	return process.env.SPOTIFY_REFRESH_TOKEN ?? null;
}

async function requestAccessToken(refreshToken: string): Promise<Response> {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error("Missing Spotify client credentials");
	}

	return fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	});
}

async function persistLatestToken(
	userId: string,
	accessToken: string,
	expiresIn?: number,
): Promise<void> {
	const fastApiUrl = process.env.FAST_API_URL;
	if (!fastApiUrl) return;
	try {
		await fetch(
			`${fastApiUrl}/user/preferences/${userId}/spotify-access-token`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					access_token: accessToken,
					expires_in: expiresIn,
				}),
			},
		);
	} catch (error) {
		console.error("Failed to persist latest Spotify token", error);
	}
}

export async function GET(): Promise<NextResponse> {
	const session = await auth();
	const refreshToken = await resolveRefreshToken(session?.user?.id ?? null);

	if (!refreshToken) {
		return NextResponse.json(
			{ message: "Missing Spotify refresh token" },
			{ status: 400 },
		);
	}

	let response: Response;
	try {
		response = await requestAccessToken(refreshToken);
	} catch (error) {
		return NextResponse.json(
			{ message: (error as Error).message },
			{ status: 500 },
		);
	}

	if (!response.ok) {
		const details = await response.json().catch(() => ({}));
		return NextResponse.json(
			{ message: "Failed to refresh Spotify access token", details },
			{ status: response.status },
		);
	}

	const data = (await response.json()) as {
		access_token?: string;
		expires_in?: number;
		refresh_token?: string;
	};

	if (!data.access_token) {
		return NextResponse.json(
			{ message: "Spotify did not return an access token" },
			{ status: 502 },
		);
	}

	if (session?.user?.id) {
		await persistLatestToken(
			session.user.id,
			data.access_token,
			data.expires_in,
		);
		if (data.refresh_token) {
			await persistTokens(session.user.id, data.refresh_token);
		}
	}

	return NextResponse.json({
		access_token: data.access_token,
		expires_in: data.expires_in ?? 3600,
	});
}

async function persistTokens(
	userId: string,
	refreshToken: string,
): Promise<void> {
	const fastApiUrl = process.env.FAST_API_URL;
	if (!fastApiUrl) return;
	try {
		await fetch(
			`${fastApiUrl}/user/preferences/${userId}/spotify-refresh-token`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refresh_token: refreshToken }),
			},
		);
	} catch (error) {
		console.error("Failed to persist Spotify refresh token", error);
	}
}
