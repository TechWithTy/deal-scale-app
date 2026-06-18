import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
	isAppTourEvent,
	markAppTourInteraction,
	shouldIgnoreAppTourDismiss,
} from "@/lib/utils/tourInteractions";

const root = process.cwd();
const appTourProviderPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"AppTourProvider.tsx",
);

const modalWrapperPaths = [
	path.join(root, "components", "ui", "dialog.tsx"),
	path.join(root, "components", "ui", "sheet.tsx"),
	path.join(root, "components", "ui", "alert-dialog.tsx"),
	path.join(
		root,
		"external",
		"shadcn-table",
		"src",
		"components",
		"ui",
		"dialog.tsx",
	),
	path.join(
		root,
		"external",
		"shadcn-table",
		"src",
		"components",
		"ui",
		"sheet.tsx",
	),
	path.join(
		root,
		"external",
		"interactive-avatar-nextjs-demo",
		"components",
		"ui",
		"dialog.tsx",
	),
] as const;

describe("guided tour modal interactions", () => {
	it("detects clicks from guided tour chrome", () => {
		const tooltip = document.createElement("div");
		tooltip.dataset.appTourTooltip = "";
		const nextButton = document.createElement("button");
		tooltip.append(nextButton);
		document.body.append(tooltip);

		expect(isAppTourEvent(new MouseEvent("click", { bubbles: true }))).toBe(
			false,
		);

		const event = new MouseEvent("click", { bubbles: true });
		nextButton.dispatchEvent(event);

		expect(isAppTourEvent(event)).toBe(true);
		expect(
			isAppTourEvent(
				new CustomEvent("interactOutside", {
					detail: { originalEvent: event },
				}),
			),
		).toBe(true);
		markAppTourInteraction();
		expect(shouldIgnoreAppTourDismiss()).toBe(true);

		tooltip.remove();
	});

	it("keeps shared modal wrappers from dismissing on tour chrome clicks", () => {
		for (const filePath of modalWrapperPaths) {
			const source = readFileSync(filePath, "utf8");

			expect(source, filePath).toContain("isAppTourEvent");
			expect(source, filePath).toContain("shouldIgnoreAppTourDismiss");
			expect(source, filePath).toContain("preventDefault()");
			expect(source, filePath).toContain("onInteractOutside?.(");
		}
	});

	it("keeps guided tour controls clickable above modal pointer locks", () => {
		const source = readFileSync(appTourProviderPath, "utf8");

		expect(source).toContain("enableTourPointerInteractions");
		expect(source).toContain('document.body.style.pointerEvents = ""');
		expect(source).toContain('portalElement.style.pointerEvents = "auto"');
		expect(source).toContain("pointer-events-auto");
	});
});
