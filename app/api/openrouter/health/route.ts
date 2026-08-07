export async function GET() {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		return Response.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
	}

	try {
		const response = await fetch("https://openrouter.ai/api/v1/credits", {
			headers: { Authorization: `Bearer ${apiKey}` },
			cache: "no-store",
		});
		return response.ok
			? new Response(null, { status: 204 })
			: Response.json({ error: `OpenRouter status ${response.status}` }, { status: 502 });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "OpenRouter unavailable" },
			{ status: 502 },
		);
	}
}
