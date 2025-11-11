import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const widgetPositionSchema = z.object({
	position: z.object({
		x: z.number(),
		y: z.number(),
		anchor: z.enum([
			"top-left",
			"top-right",
			"bottom-left",
			"bottom-right",
			"floating",
		]),
	}),
});

export async function POST(request: Request): Promise<NextResponse> {
	const session = await auth();
	const userId = session?.user?.id;
	if (!userId) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch (error) {
		return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
	}

	const parsed = widgetPositionSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				message: "Invalid widget position payload",
				errors: parsed.error.flatten(),
			},
			{ status: 422 },
		);
	}

	const fastApiUrl = process.env.FAST_API_URL;
	if (!fastApiUrl) {
		return NextResponse.json({ success: true, persisted: false });
	}

	try {
		const response = await fetch(
			`${fastApiUrl}/user/preferences/${userId}/music-widget`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(parsed.data),
				credentials: "include",
			},
		);
		if (!response.ok) {
			return NextResponse.json(
				{ message: "Failed to persist widget position" },
				{ status: 502 },
			);
		}
	} catch (error) {
		return NextResponse.json(
			{
				message: "Widget position sync error",
				error: (error as Error).message,
			},
			{ status: 500 },
		);
	}

	return NextResponse.json({ success: true, persisted: true });
}
