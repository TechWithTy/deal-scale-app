import { handlers } from "@/auth";
import { NextResponse } from "next/server";

// Export the handlers for NextAuth.js API routes
export const GET = handlers.GET;
export const POST = handlers.POST;

// Add OPTIONS handler for CORS preflight requests
export const OPTIONS = async () => {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
};
