export const runtime = "edge";

export async function GET() {
	try {
		const response = await fetch("https://text.pollinations.ai/", {
			method: "HEAD",
			cache: "no-store",
		});
		return response.ok
			? new Response(null, { status: 204 })
			: Response.json({ error: `Upstream status ${response.status}` }, { status: 502 });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Upstream unavailable" },
			{ status: 502 },
		);
	}
}
