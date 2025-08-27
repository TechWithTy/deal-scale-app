import { NextResponse } from "next/server";

// Placeholder endpoint for saving Kanban filters globally (team-wide)
// TODO: Wire to persistent storage (e.g., database) with auth/tenant scoping.
export async function POST(req: Request) {
	try {
		const { filters } = await req.json().catch(() => ({ filters: null }));
		// For now, just acknowledge receipt without persisting.
		return NextResponse.json(
			{ ok: true, message: "Received filters", filters },
			{ status: 202 },
		);
	} catch (err) {
		return NextResponse.json(
			{ ok: false, error: "Failed to parse request body" },
			{ status: 400 },
		);
	}
}
