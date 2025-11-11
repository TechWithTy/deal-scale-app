import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
	chartId: z.string().min(1),
});

const timezoneSchema = z
	.string()
	.regex(
		/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/,
		"Timezone must be a valid IANA identifier",
	)
	.optional();

const chartResponseSchema = z.object({
	chartId: z.string(),
	type: z.enum(["bar", "area", "pie"]),
	version: z.string(),
	interval: z.number().int().positive(),
	series: z
		.array(
			z.object({
				id: z.string(),
				label: z.string(),
				color: z.string().optional(),
				points: z.array(
					z.object({
						x: z.string(),
						y: z.number(),
					}),
				),
			}),
		)
		.min(1),
	meta: z.object({
		title: z.string(),
		description: z.string().optional(),
		unit: z.string().optional(),
	}),
});

type ChartResponse = z.infer<typeof chartResponseSchema>;

function generateSampleSeries(chartId: string): ChartResponse {
	const seed = Array.from(chartId)
		.map((char) => char.charCodeAt(0))
		.reduce((acc, value) => acc + value, 0);
	const baseValue = 150 + (seed % 75);

	const points = Array.from({ length: 6 }).map((_, index) => {
		const day = (index + 1).toString().padStart(2, "0");
		return {
			x: `2025-11-${day}`,
			y: baseValue + index * 25,
		};
	});

	return {
		chartId,
		type: "bar",
		version: new Date().toISOString(),
		interval: 30000,
		series: [
			{
				id: "desktop",
				label: "Desktop",
				color: "hsl(var(--chart-1))",
				points,
			},
			{
				id: "mobile",
				label: "Mobile",
				color: "hsl(var(--chart-2))",
				points: points.map((point, index) => ({
					x: point.x,
					y: Math.round(point.y * 0.85 + index * 10),
				})),
			},
		],
		meta: {
			title: `${chartId.replace(/-/g, " ")} (sample)`.replace(/\b\w/g, (char) =>
				char.toUpperCase(),
			),
			description: "Demo data for embeddable chart development",
			unit: "visits",
		},
	};
}

function createEtag(payload: ChartResponse): string {
	const data = JSON.stringify(payload);
	let hash = 0;

	for (let index = 0; index < data.length; index += 1) {
		hash = (hash << 5) - hash + data.charCodeAt(index);
		hash |= 0;
	}

	return `"W/${Math.abs(hash).toString(16)}"`;
}

export async function GET(
	request: Request,
	context: { params: { chartId: string } },
) {
	const parsedParams = querySchema.safeParse(context.params);
	if (!parsedParams.success) {
		return NextResponse.json(
			{
				message: "Invalid chart identifier",
				errors: parsedParams.error.flatten(),
			},
			{ status: 422 },
		);
	}

	const timezoneHeader =
		request.headers.get("x-dealscale-timezone") ?? undefined;
	const timezoneValidation = timezoneSchema.safeParse(timezoneHeader);
	if (!timezoneValidation.success) {
		return NextResponse.json(
			{
				message: "Invalid timezone header",
				errors: timezoneValidation.error.flatten(),
			},
			{ status: 422 },
		);
	}

	const responsePayload = generateSampleSeries(parsedParams.data.chartId);
	const etag = createEtag(responsePayload);
	const incomingTag = request.headers.get("if-none-match");

	if (incomingTag && incomingTag === etag) {
		return new NextResponse(null, { status: 304, headers: { ETag: etag } });
	}

	return NextResponse.json(responsePayload satisfies ChartResponse, {
		status: 200,
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/json",
			ETag: etag,
			"X-DealScale-Mock": "true",
		},
	});
}
