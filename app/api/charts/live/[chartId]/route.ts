import { NextResponse } from "next/server";

export const dynamic = "force-static";

function ok() {
	return NextResponse.json({ ok: true });
}

export async function GET() {
	return ok();
}

export async function POST() {
	return ok();
}

export async function PUT() {
	return ok();
}

export async function PATCH() {
	return ok();
}

export async function DELETE() {
	return ok();
}

export async function OPTIONS() {
	return new Response(null, { status: 204 });
}

export async function HEAD() {
	return new Response(null, { status: 204 });
}
