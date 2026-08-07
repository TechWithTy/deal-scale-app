export const runtime = "nodejs";

const unavailable = () =>
	Response.json(
		{ error: "Gemini streaming is not configured in this deployment." },
		{ status: 503 },
	);

export async function GET() {
	return unavailable();
}

export async function POST() {
	return unavailable();
}

export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: { "Access-Control-Allow-Methods": "GET, POST, OPTIONS" },
	});
}
