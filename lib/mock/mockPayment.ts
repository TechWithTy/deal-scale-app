/**
 * Mock payment simulation utility
 *
 * Simulates payment processing with a 2-second delay.
 * Kept as a local fallback while live checkout uses the public API.
 *
 * @see hooks/usePlans.ts for automatic mock-to-live detection
 */

import {
	createPaymentCheckout,
	getPaymentPricingTiers,
} from "@/lib/api/public-api-dashboard";
import { extractCheckoutUrl } from "@/lib/payments/public-api-credit-pricing";
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
 * Check if live payment pricing is available through the public API.
 */
export async function checkLivePaymentApiAvailable(): Promise<boolean> {
	try {
		await getPaymentPricingTiers();
		return true;
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
	const credits = Number.parseInt(planId, 10);
	const payload = await createPaymentCheckout({
		credits: Number.isFinite(credits) && credits > 0 ? credits : 1,
		credit_type: "ai",
	});
	const url = extractCheckoutUrl(payload);
	if (!url) {
		throw new Error("Public API checkout response did not include a checkout URL");
	}

	return { sessionId: planId, url };
}
