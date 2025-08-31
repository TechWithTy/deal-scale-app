import { NextResponse } from "next/server";

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
		const data = await res.json();
		const numbers: string[] = (data?.incoming_phone_numbers || [])
			.map((n: any) => n?.phone_number)
			.filter((n: unknown): n is string => typeof n === "string");

		return NextResponse.json({ numbers });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
