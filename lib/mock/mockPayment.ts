/**
 * Mock payment simulation utility
 *
 * Simulates payment processing with a 2-second delay.
 * This will be replaced with live Stripe checkout session creation
 * when /api/payments/session endpoint becomes available.
 *
 * @see hooks/usePlans.ts for automatic mock-to-live detection
 */

import type { PlanTier } from "./plans";

export type PaymentState = "idle" | "processing" | "confirmed";

export interface PaymentCallback {
	planId: string;
	planName: string;
	success: boolean;
	timestamp: Date;
}

/**
 * Mock payment callback function
 * Simulates a payment with 2-second delay
 *
 * @param plan - The selected plan tier
 * @returns Promise that resolves after 2 seconds with success status
 */
export async function mockPayment(plan: PlanTier): Promise<PaymentCallback> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	console.log(`✅ Mock callback received for plan: ${plan.name} (${plan.id})`);

	return {
		planId: plan.id,
		planName: plan.name,
		success: true,
		timestamp: new Date(),
	};
}

/**
 * Check if live payment API endpoint is available
 * @returns Promise that resolves to true if /api/payments/session is reachable
 */
export async function checkLivePaymentApiAvailable(): Promise<boolean> {
	try {
		const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
		const response = await fetch(`${baseUrl}/api/payments/session`, {
			method: "HEAD",
			signal: AbortSignal.timeout(2000), // 2 second timeout
		});
		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Create a live payment session (for future use)
 * This will be called when the live API is available
 */
export async function createLivePaymentSession(
	planId: string,
): Promise<{ sessionId: string; url: string }> {
	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
	const response = await fetch(`${baseUrl}/api/payments/session`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ planId }),
	});

	if (!response.ok) {
		throw new Error(`Failed to create payment session: ${response.statusText}`);
	}

	return response.json();
}
