import { NextResponse } from "next/server";
import { z } from "zod";

// Fetch connected phone numbers from Twilio REST API without adding the twilio SDK dependency.
// Docs: https://www.twilio.com/docs/usage/api#rest-api
export async function GET() {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;

	if (!accountSid || !authToken) {
		return NextResponse.json(
			{ error: "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN" },
			{ status: 500 },
		);
	}

	const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PageSize=1000`;

	try {
		const res = await fetch(url, {
			headers: {
				Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
			},
			cache: "no-store",
		});
		if (!res.ok) {
			const text = await res.text();
			return NextResponse.json(
				{ error: `Twilio API error: ${res.status} ${text}` },
				{ status: 500 },
			);
		}

		// Safely parse and narrow the Twilio response shape
		const TwilioNumbersSchema = z
			.object({
				incoming_phone_numbers: z
					.array(
						z
							.object({ phone_number: z.string().nullable().optional() })
							.passthrough(),
					)
					.optional()
					.default([]),
			})
			.passthrough();

		const raw = await res.json().catch(() => ({}));
		const parsed = TwilioNumbersSchema.safeParse(raw);
		const numbers: string[] = (
			parsed.success ? parsed.data.incoming_phone_numbers : []
		)
			.map((n) => n.phone_number)
			.filter((n): n is string => typeof n === "string");

		return NextResponse.json({ numbers });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
