const SUPADEMO_SCRIPT_URL = "https://script.supademo.com/script.js";

export async function GET(): Promise<Response> {
	try {
		const upstream = await fetch(SUPADEMO_SCRIPT_URL, {
			cache: "no-store",
			headers: {
				Accept: "application/javascript",
			},
		});

		if (!upstream.ok) {
			return new Response("Failed to fetch Supademo script", {
				status: 502,
			});
		}

		const body = await upstream.text();
		return new Response(body, {
			status: 200,
			headers: {
				"Content-Type": "application/javascript; charset=utf-8",
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		return new Response("Failed to load Supademo script", {
			status: 502,
		});
	}
}
