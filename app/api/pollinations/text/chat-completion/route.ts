export const runtime = "edge";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const payload = body as { model?: unknown; stream?: boolean };
	if (typeof payload.model !== "string") {
		return Response.json({ error: "Missing model" }, { status: 400 });
	}

	try {
		const upstream = await fetch("https://text.pollinations.ai/openai", {
			method: "POST",
			headers: {
				Accept: payload.stream ? "text/event-stream" : "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		if (!upstream.ok && !upstream.body) {
			return Response.json(
				{ error: (await upstream.text()) || "Pollinations upstream error" },
				{ status: upstream.status || 502 },
			);
		}
		return new Response(upstream.body, {
			status: upstream.ok ? 200 : upstream.status,
			headers: {
				"Cache-Control": "no-cache, no-transform",
				"Content-Type": payload.stream
					? "text/event-stream"
					: "application/json",
			},
		});
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Pollinations unavailable" },
			{ status: 502 },
		);
	}
}
