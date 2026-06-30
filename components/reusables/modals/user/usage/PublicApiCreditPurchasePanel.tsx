"use client";

import { Button } from "@/components/ui/button";
import {
	createPaymentCheckout,
	getPaymentPricingTiers,
} from "@/lib/api/public-api-dashboard";
import {
	type CreditPricingCatalog,
	extractCheckoutUrl,
	extractCreditPricingCatalog,
} from "@/lib/payments/public-api-credit-pricing";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const emptyCatalog: CreditPricingCatalog = {
	currency: "USD",
	creditTypes: [],
	tiers: [],
};

export function PublicApiCreditPurchasePanel() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const [catalog, setCatalog] = useState(emptyCatalog);
	const [selectedCredits, setSelectedCredits] = useState(0);
	const [creditType, setCreditType] = useState("ai");
	const [isLoading, setIsLoading] = useState(true);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadPricing() {
			setIsLoading(true);
			setError(null);
			try {
				const payload = await getPaymentPricingTiers(token);
				const nextCatalog = extractCreditPricingCatalog(payload);
				if (!isMounted) return;
				setCatalog(nextCatalog);
				setSelectedCredits(nextCatalog.tiers[0]?.credits ?? 0);
				setCreditType(nextCatalog.creditTypes[0]?.value ?? "ai");
				if (!nextCatalog.tiers.length) {
					setError("Credit pricing is not currently available.");
				}
			} catch (caught) {
				if (!isMounted) return;
				setError(
					caught instanceof Error
						? caught.message
						: "Unable to load credit pricing.",
				);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		void loadPricing();
		return () => {
			isMounted = false;
		};
	}, [token]);

	async function handleCheckout() {
		if (!token || !selectedCredits || isCheckingOut) return;
		setIsCheckingOut(true);
		setError(null);

		try {
			const currentUrl = window.location.href;
			const payload = await createPaymentCheckout(
				{
					credits: selectedCredits,
					credit_type: creditType,
					success_url: currentUrl,
					cancel_url: currentUrl,
					metadata: { source: "dashboard_usage" },
				},
				token,
			);
			const checkoutUrl = extractCheckoutUrl(payload);
			if (!checkoutUrl) {
				throw new Error("Checkout did not return a secure payment URL.");
			}
			window.location.assign(checkoutUrl);
		} catch (caught) {
			const message =
				caught instanceof Error ? caught.message : "Unable to start checkout.";
			setError(message);
			toast.error(message);
		} finally {
			setIsCheckingOut(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex min-h-32 items-center justify-center rounded-lg border">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!catalog.tiers.length) {
		return error ? (
			<p className="rounded-lg border border-destructive/30 p-4 text-sm">
				{error}
			</p>
		) : null;
	}

	return (
		<section className="space-y-4 rounded-xl border bg-muted/20 p-5">
			<div>
				<h3 className="font-semibold text-lg">Buy additional credits</h3>
				<p className="text-muted-foreground text-sm">
					Live pricing and secure checkout are provided by the Deal Scale API.
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				{catalog.tiers.map((tier) => (
					<button
						key={tier.credits}
						type="button"
						onClick={() => setSelectedCredits(tier.credits)}
						className={`rounded-lg border p-4 text-left transition-colors ${
							selectedCredits === tier.credits
								? "border-primary bg-primary/5"
								: "hover:border-primary/50"
						}`}
					>
						<span className="block font-semibold">{tier.name}</span>
						<span className="block text-muted-foreground text-sm">
							{new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: catalog.currency,
							}).format(tier.price)}
						</span>
						{tier.discount > 0 && (
							<span className="text-green-700 text-xs">
								Save {tier.discount}%
							</span>
						)}
					</button>
				))}
			</div>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
				<label className="flex-1 text-sm">
					<span className="mb-1 block font-medium">Credit type</span>
					<select
						value={creditType}
						onChange={(event) => setCreditType(event.target.value)}
						className="h-10 w-full rounded-md border bg-background px-3"
					>
						{catalog.creditTypes.map((option) => (
							<option key={option.value} value={option.value}>
								{option.display}
							</option>
						))}
					</select>
				</label>
				<Button
					type="button"
					onClick={() => void handleCheckout()}
					disabled={!token || isCheckingOut}
				>
					{isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{token ? "Continue to secure checkout" : "Public API login required"}
				</Button>
			</div>

			{error && <p className="text-destructive text-sm">{error}</p>}
		</section>
	);
}
