import { proxyPublicApiRequest } from "@/lib/api/public-api-proxy";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
	return proxyPublicApiRequest(request);
}

export async function GET(request: NextRequest) {
	return proxyPublicApiRequest(request);
}

export async function HEAD(request: NextRequest) {
	return proxyPublicApiRequest(request);
}

export async function PATCH(request: NextRequest) {
	return proxyPublicApiRequest(request);
}

export async function POST(request: NextRequest) {
	return proxyPublicApiRequest(request);
}

export async function PUT(request: NextRequest) {
	return proxyPublicApiRequest(request);
}
