import { NextResponse } from "next/server";

export const dynamic = "force-static";

function ok() {
	return NextResponse.json({ ok: true });
}

export async function GET() {
	return ok();
}

export async function HEAD() {
	return new Response(null, { status: 204 });
}
