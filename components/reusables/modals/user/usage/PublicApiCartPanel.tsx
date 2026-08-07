"use client";

import { Button } from "@/components/ui/button";
import {
	addCartItem,
	checkoutCart,
	deleteCartItem,
	getCart,
	getCartProducts,
	updateCartItem,
} from "@/lib/api/public-api-dashboard";
import {
	type PublicApiCart,
	type PublicApiCartItem,
	extractPublicApiCart,
	extractPublicApiCartProducts,
} from "@/lib/payments/public-api-cart";
import { extractCheckoutUrl } from "@/lib/payments/public-api-credit-pricing";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EMPTY_CART: PublicApiCart = { items: [], total: 0 };

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-US", {
		currency: "USD",
		style: "currency",
	}).format(value);
}

export function PublicApiCartPanel() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const [cart, setCart] = useState(EMPTY_CART);
	const [products, setProducts] = useState<
		ReturnType<typeof extractPublicApiCartProducts>
	>([]);
	const [loading, setLoading] = useState(true);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		void Promise.all([getCartProducts(token), token ? getCart(token) : null])
			.then(([productPayload, cartPayload]) => {
				if (!active) return;
				setProducts(extractPublicApiCartProducts(productPayload));
				setCart(cartPayload ? extractPublicApiCart(cartPayload) : EMPTY_CART);
			})
			.catch((caught) => {
				if (active)
					setError(
						caught instanceof Error
							? caught.message
							: "Unable to load products.",
					);
			})
			.finally(() => active && setLoading(false));
		return () => {
			active = false;
		};
	}, [token]);

	async function mutate(action: () => Promise<unknown>) {
		if (!token || pending) return;
		setPending(true);
		setError(null);
		try {
			setCart(extractPublicApiCart(await action()));
		} catch (caught) {
			const message =
				caught instanceof Error ? caught.message : "Unable to update cart.";
			setError(message);
			toast.error(message);
		} finally {
			setPending(false);
		}
	}

	async function checkout() {
		if (!token || !cart.items.length || pending) return;
		setPending(true);
		setError(null);
		try {
			const payload = await checkoutCart(
				{ metadata: { source: "upgrade_modal" } },
				token,
			);
			const checkoutUrl = extractCheckoutUrl(payload);
			if (!checkoutUrl)
				throw new Error("Checkout did not return a secure payment URL.");
			window.location.assign(checkoutUrl);
		} catch (caught) {
			const message =
				caught instanceof Error ? caught.message : "Unable to start checkout.";
			setError(message);
			toast.error(message);
		} finally {
			setPending(false);
		}
	}

	async function updateQuantity(item: PublicApiCartItem, quantity: number) {
		const itemId = item.id;
		if (!itemId) return;
		await mutate(() => updateCartItem(itemId, { quantity }, token));
	}

	async function removeItem(item: PublicApiCartItem) {
		const itemId = item.id;
		if (!itemId) return;
		await mutate(() => deleteCartItem(itemId, token));
	}

	if (loading)
		return (
			<div className="flex min-h-32 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin" />
			</div>
		);
	if (error && !products.length)
		return (
			<p className="border border-destructive/30 p-3 text-destructive text-sm">
				{error}
			</p>
		);

	return (
		<section className="space-y-4 border p-4">
			<div>
				<h3 className="font-semibold text-lg">Plans and add-ons</h3>
				<p className="text-muted-foreground text-sm">
					Live catalog and checkout from Deal Scale.
				</p>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{products.map((product) => (
					<div className="border p-3" key={product.productSku}>
						<p className="font-medium">{product.name}</p>
						<p className="mb-3 text-muted-foreground text-sm">
							{formatCurrency(product.unitPrice)}
						</p>
						<Button
							disabled={!token || pending}
							onClick={() =>
								void mutate(() =>
									addCartItem(
										{
											name: product.name,
											product_sku: product.productSku,
											unit_price: product.unitPrice,
										},
										token,
									),
								)
							}
							size="sm"
						>
							Add to cart
						</Button>
					</div>
				))}
			</div>
			{!products.length && (
				<p className="text-muted-foreground text-sm">
					No purchasable products are available.
				</p>
			)}
			<div className="space-y-2 border-t pt-4">
				<div className="flex items-center gap-2 font-medium">
					<ShoppingCart className="h-4 w-4" /> Cart
				</div>
				{cart.items.map((item) => (
					<div
						className="flex items-center justify-between gap-3 text-sm"
						key={item.id ?? item.productSku}
					>
						<span>
							{item.name} x {item.quantity}
						</span>
						<span>{formatCurrency(item.subtotal)}</span>
						{item.id && (
							<div className="flex gap-1">
								<Button
									aria-label={`Decrease ${item.name}`}
									disabled={pending}
									onClick={() => void updateQuantity(item, item.quantity - 1)}
									size="icon"
									variant="ghost"
								>
									<Minus className="h-4 w-4" />
								</Button>
								<Button
									aria-label={`Increase ${item.name}`}
									disabled={pending}
									onClick={() => void updateQuantity(item, item.quantity + 1)}
									size="icon"
									variant="ghost"
								>
									<Plus className="h-4 w-4" />
								</Button>
								<Button
									aria-label={`Remove ${item.name}`}
									disabled={pending}
									onClick={() => void removeItem(item)}
									size="icon"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>
				))}
				<div className="flex items-center justify-between border-t pt-2 font-semibold">
					<span>Total</span>
					<span>{formatCurrency(cart.total)}</span>
				</div>
				<Button
					disabled={!token || !cart.items.length || pending}
					onClick={() => void checkout()}
				>
					{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{token ? "Secure checkout" : "Public API login required"}
				</Button>
			</div>
			{error && <p className="text-destructive text-sm">{error}</p>}
		</section>
	);
}
