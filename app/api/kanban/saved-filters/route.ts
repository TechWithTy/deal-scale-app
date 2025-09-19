import { NextResponse } from "next/server";
import { z } from "zod";

// Placeholder endpoint for saving Kanban filters globally (team-wide)
// TODO: Wire to persistent storage (e.g., database) with auth/tenant scoping.
export async function POST(req: Request) {
	try {
		// Validate incoming body instead of destructuring from unknown
		const BodySchema = z
			.object({
				filters: z.unknown().nullable().optional(),
			})
			.strict();

		const raw = await req.json().catch(() => ({}));
		const parsed = BodySchema.safeParse(raw);
		const filters = parsed.success ? (parsed.data.filters ?? null) : null;
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
