import { expect, test } from "@playwright/test";

test.describe("PWA installability", () => {
	test("exposes manifest link and registers a service worker", async ({
		page,
	}) => {
		await page.goto("/");

		const manifestLink = page.locator('link[rel="manifest"]');

		await expect(manifestLink).toHaveAttribute(
			"href",
			/manifest\.webmanifest$/,
		);

		await page.waitForTimeout(1500);

		const registrationCount = await page.evaluate(async () => {
			const registrations = await navigator.serviceWorker.getRegistrations();
			return registrations.length;
		});

		expect(registrationCount).toBeGreaterThan(0);
	});
});
