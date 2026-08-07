import {
	extractPublicApiCart,
	extractPublicApiCartProducts,
} from "@/lib/payments/public-api-cart";
import { describe, expect, it } from "vitest";

describe("public API cart normalizers", () => {
	it("normalizes catalog products and cart items", () => {
		expect(
			extractPublicApiCartProducts({
				products: [{ name: "Starter", product_sku: "START", unit_price: 19 }],
			}),
		).toEqual([{ name: "Starter", productSku: "START", unitPrice: 19 }]);
		expect(
			extractPublicApiCart({
				cart: {
					items: [
						{
							id: "line-1",
							name: "Starter",
							product_sku: "START",
							quantity: 2,
							unit_price: 19,
						},
					],
					total: 38,
				},
			}),
		).toMatchObject({ items: [{ id: "line-1", subtotal: 38 }], total: 38 });
	});
});
