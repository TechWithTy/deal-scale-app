/**
 * Main Upgrade Modal Component
 * Unified pricing overview with Subscription, Success-Based, and One-Time options
 */

"use client";

import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/lib/stores/dashboard";
import {
	pricingTiers,
	type PricingCategory,
	type BillingCycle,
} from "@/lib/mock/plans";
import { PricingTabs } from "./PricingTabs";
import { BillingToggle } from "./BillingToggle";
import { SubscriptionTierCard } from "./SubscriptionTierCard";
import { SuccessBasedCard } from "./SuccessBasedCard";
import { OneTimeCard } from "./OneTimeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PaymentState } from "@/lib/mock/mockPayment";

export interface UpgradeModalProps {
	trial?: boolean;
	initialPlanId?: string;
}

export function UpgradeModalMain({
	trial = false,
	initialPlanId,
}: UpgradeModalProps) {
	if (process.env.NEXT_PUBLIC_DISABLE_UPGRADE_MODAL === "1") return null;

	const { isUpgradeModalOpen, closeUpgradeModal } = useModalStore();
	const router = useRouter();
	const [activeCategory, setActiveCategory] =
		useState<PricingCategory>("subscription");
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	const [selectedTierId, setSelectedTierId] = useState<string | null>(
		initialPlanId || null,
	);
	const [paymentState, setPaymentState] = useState<PaymentState>("idle");
	const [discountCode, setDiscountCode] = useState("");
	const [showDiscountInput, setShowDiscountInput] = useState(false);

	// Set initial tier when category changes
	useEffect(() => {
		if (
			activeCategory === "subscription" &&
			pricingTiers.subscription.length > 0
		) {
			if (
				!selectedTierId ||
				!pricingTiers.subscription.find((t) => t.id === selectedTierId)
			) {
				setSelectedTierId(pricingTiers.subscription[0]?.id ?? null);
			}
		} else if (
			activeCategory === "successBased" &&
			pricingTiers.successBased.length > 0
		) {
			setSelectedTierId(pricingTiers.successBased[0]?.id ?? null);
		} else if (
			activeCategory === "oneTime" &&
			pricingTiers.oneTime.length > 0
		) {
			setSelectedTierId(pricingTiers.oneTime[0]?.id ?? null);
		}
	}, [activeCategory, selectedTierId]);

	/**
	 * Build checkout URL for DealScale.io pricing page
	 */
	const buildCheckoutUrl = (
		tierId: string,
		category: PricingCategory,
		billing: BillingCycle,
		code?: string,
	): string => {
		const baseUrl = "https://www.dealscale.io/pricing";
		const params = new URLSearchParams();

		params.set("planId", tierId);
		params.set("category", category);
		if (category === "subscription") {
			params.set("billing", billing);
		}

		if (code?.trim()) {
			params.set("discountCode", code.trim());
		}

		const returnUrl =
			typeof window !== "undefined"
				? encodeURIComponent(window.location.origin + window.location.pathname)
				: "";
		if (returnUrl) {
			params.set("returnUrl", returnUrl);
		}

		return `${baseUrl}?${params.toString()}`;
	};

	/**
	 * Handle payment confirmation
	 */
	const handlePayment = () => {
		if (!selectedTierId || paymentState !== "idle") return;

		setPaymentState("processing");

		const checkoutUrl = buildCheckoutUrl(
			selectedTierId,
			activeCategory,
			billingCycle,
			discountCode || undefined,
		);

		window.location.href = checkoutUrl;
	};

	// Close on Escape
	useEffect(() => {
		if (!isUpgradeModalOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && paymentState !== "processing") {
				closeUpgradeModal();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isUpgradeModalOpen, closeUpgradeModal, paymentState]);

	// Reset payment state when modal closes
	useEffect(() => {
		if (!isUpgradeModalOpen) {
			setPaymentState("idle");
		}
	}, [isUpgradeModalOpen]);

	if (!isUpgradeModalOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-background/80"
			aria-modal="true"
			onClick={(e) => {
				if (e.currentTarget === e.target) closeUpgradeModal();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape" && paymentState !== "processing") {
					closeUpgradeModal();
				}
			}}
			tabIndex={-1}
		>
			<div
				className="relative flex max-h-[90vh] w-full max-w-6xl animate-fade-in flex-col rounded-xl border border-border bg-card p-0 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div className="flex-1 overflow-y-auto p-6 sm:p-8">
					<button
						aria-label="Close"
						type="button"
						className="absolute top-4 right-4 z-10 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						onClick={closeUpgradeModal}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								closeUpgradeModal();
							}
						}}
						disabled={paymentState === "processing"}
					>
						<X size={20} />
					</button>

					<div className="mb-8">
						<h2 className="mb-3 font-bold text-3xl text-foreground">
							Omni-Channel AI - Scale Your Deals
						</h2>
						<p className="mb-2 font-medium text-base text-foreground">
							Sincere deals by ~ 2.5x
						</p>
						<p className="text-muted-foreground text-sm">
							Choose the perfect plan to scale your business
						</p>
					</div>

					{/* Category Tabs */}
					<PricingTabs
						activeCategory={activeCategory}
						onCategoryChange={setActiveCategory}
					/>

					{/* Billing Toggle - Only for Subscription */}
					{activeCategory === "subscription" && (
						<BillingToggle
							billingCycle={billingCycle}
							onBillingCycleChange={setBillingCycle}
							disabled={paymentState === "processing"}
						/>
					)}

					{/* Subscription Tiers */}
					{activeCategory === "subscription" && (
						<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
							{pricingTiers.subscription.map((tier) => (
								<SubscriptionTierCard
									key={tier.id}
									tier={tier}
									billingCycle={billingCycle}
									isSelected={selectedTierId === tier.id}
									onSelect={() => setSelectedTierId(tier.id)}
									paymentState={paymentState}
									discountCode={discountCode}
								/>
							))}
						</div>
					)}

					{/* Success-Based Tiers */}
					{activeCategory === "successBased" && (
						<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
							{pricingTiers.successBased.map((tier) => (
								<SuccessBasedCard
									key={tier.id}
									tier={tier}
									onSelect={() => {
										setSelectedTierId(tier.id);
										handlePayment();
									}}
								/>
							))}
						</div>
					)}

					{/* One-Time Tiers */}
					{activeCategory === "oneTime" && (
						<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
							{pricingTiers.oneTime.map((tier) => (
								<OneTimeCard
									key={tier.id}
									tier={tier}
									onSelect={() => {
										setSelectedTierId(tier.id);
										handlePayment();
									}}
								/>
							))}
						</div>
					)}

					{/* Discount Code & Payment - Only for Subscription */}
					{activeCategory === "subscription" && selectedTierId && (
						<div className="mt-8 rounded-xl border border-border bg-muted/20 p-6">
							{/* Discount Code Section */}
							<div className="mb-4">
								{!showDiscountInput ? (
									<button
										type="button"
										onClick={() => setShowDiscountInput(true)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setShowDiscountInput(true);
											}
										}}
										className="text-primary text-sm hover:underline"
										disabled={paymentState === "processing"}
									>
										Have a discount code?
									</button>
								) : (
									<div className="space-y-2">
										<label
											htmlFor="discount-code"
											className="font-medium text-foreground text-sm"
										>
											Discount Code
										</label>
										<div className="flex gap-2">
											<Input
												id="discount-code"
												type="text"
												placeholder="Enter code (if any)"
												value={discountCode}
												onChange={(e) => setDiscountCode(e.target.value)}
												disabled={paymentState === "processing"}
												className="flex-1"
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														setShowDiscountInput(false);
													}
												}}
											/>
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													setShowDiscountInput(false);
													if (!discountCode.trim()) {
														setDiscountCode("");
													}
												}}
												disabled={paymentState === "processing"}
											>
												{discountCode.trim() ? "Apply" : "Cancel"}
											</Button>
										</div>
									</div>
								)}
							</div>

							{/* Payment Button */}
							<button
								type="button"
								onClick={handlePayment}
								disabled={paymentState === "processing"}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-center font-semibold text-base text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary disabled:hover:shadow-lg"
							>
								{paymentState === "processing" && (
									<Loader2 className="h-5 w-5 animate-spin" />
								)}
								{paymentState === "idle" && "Continue to Checkout →"}
								{paymentState === "processing" && "Redirecting…"}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
