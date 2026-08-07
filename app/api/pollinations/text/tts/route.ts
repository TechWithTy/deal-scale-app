export const runtime = "edge";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const prompt = searchParams.get("prompt");
	if (!prompt) {
		return Response.json({ error: "Missing prompt" }, { status: 400 });
	}

	try {
		const voice = searchParams.get("voice") || "alloy";
		const upstream = await fetch(
			`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-audio&voice=${encodeURIComponent(voice)}`,
			{ cache: "no-store" },
		);
		if (!upstream.ok || !upstream.body) {
			return Response.json(
				{ error: (await upstream.text()) || "Pollinations TTS error" },
				{ status: upstream.status || 502 },
			);
		}
		return new Response(upstream.body, {
			headers: {
				"Cache-Control": "no-cache",
				"Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
			},
		});
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Pollinations unavailable" },
			{ status: 502 },
		);
	}
}
