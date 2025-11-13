import { NextResponse } from "next/server";

const MOCK_AGENTS = [
	{ id: "dialer", name: "DealScale Dialer", status: "SMS Ready" },
	{ id: "nurture", name: "Pipeline Nurture", status: "Idle" },
	{ id: "followup", name: "Borrower Follow-Up", status: "Available" },
	{ id: "hand-off", name: "Loan Officer Handoff", status: "On Call" },
	{ id: "referral", name: "Referral Coordinator", status: "Queued" },
	{ id: "retention", name: "Retention Specialist", status: "Idle" },
];

export async function GET() {
	return NextResponse.json(MOCK_AGENTS);
}
