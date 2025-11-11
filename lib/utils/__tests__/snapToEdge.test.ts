import { describe, expect, it } from "vitest";

import { calculateSnapAnchor, snapToEdge } from "@/lib/utils/snapToEdge";

describe("snapToEdge", () => {
	it("returns original position when outside threshold", () => {
		const position = snapToEdge(
			{ x: 200, y: 120 },
			{ width: 220, height: 120 },
			{ viewportWidth: 1280, viewportHeight: 720 },
			{ threshold: 50, margin: 8 },
		);
		expect(position).toEqual({ x: 200, y: 120 });
	});

	it("snaps to the left edge within threshold", () => {
		const position = snapToEdge(
			{ x: 20, y: 200 },
			{ width: 220, height: 120 },
			{ viewportWidth: 1280, viewportHeight: 720 },
			{ threshold: 50, margin: 8 },
		);
		expect(position.x).toBe(8);
		expect(position.y).toBe(200);
	});

	it("snaps to the right edge within threshold", () => {
		const position = snapToEdge(
			{ x: 1040, y: 320 },
			{ width: 220, height: 120 },
			{ viewportWidth: 1280, viewportHeight: 720 },
			{ threshold: 50, margin: 8 },
		);
		expect(position.x).toBe(1280 - 220 - 8);
		expect(position.y).toBe(320);
	});

	it("snaps to the top edge within threshold", () => {
		const position = snapToEdge(
			{ x: 320, y: 12 },
			{ width: 220, height: 120 },
			{ viewportWidth: 1280, viewportHeight: 720 },
			{ threshold: 50, margin: 8 },
		);
		expect(position.y).toBe(8);
	});

	it("clamps to viewport bounds when outside", () => {
		const position = snapToEdge(
			{ x: -40, y: 900 },
			{ width: 220, height: 120 },
			{ viewportWidth: 1280, viewportHeight: 720 },
			{ threshold: 50, margin: 8 },
		);
		expect(position.x).toBe(8);
		expect(position.y).toBe(720 - 120 - 8);
	});
});

describe("calculateSnapAnchor", () => {
	it("identifies top-left anchor", () => {
		const anchor = calculateSnapAnchor({ x: 8, y: 8 }, 1280, 720, 220, 120);
		expect(anchor).toBe("top-left");
	});

	it("identifies top-right anchor", () => {
		const anchor = calculateSnapAnchor(
			{ x: 1280 - 220 - 8, y: 8 },
			1280,
			720,
			220,
			120,
		);
		expect(anchor).toBe("top-right");
	});

	it("identifies bottom-right anchor", () => {
		const anchor = calculateSnapAnchor(
			{ x: 1280 - 220 - 8, y: 720 - 120 - 8 },
			1280,
			720,
			220,
			120,
		);
		expect(anchor).toBe("bottom-right");
	});

	it("identifies bottom-left anchor", () => {
		const anchor = calculateSnapAnchor(
			{ x: 8, y: 720 - 120 - 8 },
			1280,
			720,
			220,
			120,
		);
		expect(anchor).toBe("bottom-left");
	});
});
