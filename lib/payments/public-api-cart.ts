export interface PublicApiCartItem {
	id: string | null;
	name: string;
	productSku: string;
	quantity: number;
	subtotal: number;
	unitPrice: number;
}

export interface PublicApiCartProduct {
	name: string;
	productSku: string;
	unitPrice: number;
}

export interface PublicApiCart {
	items: PublicApiCartItem[];
	total: number;
}

function record(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function number(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function array(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function product(value: unknown): PublicApiCartProduct | null {
	const item = record(value);
	const productSku = item.product_sku ?? item.sku ?? item.id;
	const name = item.name ?? item.display_name ?? item.title;
	const unitPrice = item.unit_price ?? item.price;
	return typeof productSku === "string" &&
		productSku &&
		typeof name === "string"
		? { name, productSku, unitPrice: number(unitPrice) }
		: null;
}

export function extractPublicApiCartProducts(payload: unknown) {
	const root = record(payload);
	const candidates = array(root.products ?? root.items ?? root.data);
	return candidates.flatMap((value) => {
		const parsed = product(value);
		return parsed ? [parsed] : [];
	});
}

export function extractPublicApiCart(payload: unknown): PublicApiCart {
	const root = record(payload);
	const cart = record(root.cart ?? payload);
	const summary = record(root.summary ?? cart.summary);
	const items = array(cart.items).flatMap((value) => {
		const item = record(value);
		const parsed = product(item);
		if (!parsed) return [];
		const id = item.id ?? item.item_id ?? item.cart_item_id;
		const quantity = Math.max(0, number(item.quantity) || 1);
		return [
			{
				...parsed,
				id: typeof id === "string" && id ? id : null,
				quantity,
				subtotal: number(item.subtotal) || parsed.unitPrice * quantity,
			},
		];
	});
	return { items, total: number(summary.total ?? cart.total) };
}
