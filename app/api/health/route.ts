import { NextResponse } from "next/server";

const NO_STORE_HEADER = { "cache-control": "no-store, max-age=0" };

/**
 * Lightweight health-check endpoint for connectivity probes.
 */
export async function GET(): Promise<NextResponse> {
	return NextResponse.json({ status: "ok" }, { headers: NO_STORE_HEADER });
}

export async function HEAD(): Promise<Response> {
	return new Response(null, {
		status: 204,
		headers: NO_STORE_HEADER,
	});
}
