import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("development third-party script safety", () => {
	it("keeps Supademo DOM injection out of the dev dashboard shell", () => {
		const layoutSource = readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
		const shellSource = readFileSync(
			path.join(root, "components", "layout", "AuthenticatedAppShell.tsx"),
			"utf8",
		);
		const providersSource = readFileSync(
			path.join(root, "components", "layout", "providers.tsx"),
			"utf8",
		);

		expect(layoutSource).toContain("shouldLoadSupademo");
		expect(layoutSource).toContain('process.env.NODE_ENV === "production"');
		expect(layoutSource).toContain('id="supademo-script"');
		expect(shellSource).toContain("shouldLoadSupademo");
		expect(shellSource).toContain("shouldLoadSupademo ? <SupademoClient /> : null");
		expect(shellSource).toContain("shouldLoadSupademo ? (");
		expect(shellSource).toContain("<FloatingHelpSupademo");
		expect(providersSource).toContain('process.env.NODE_ENV === "production"');
		expect(providersSource).toContain('id="ms-clarity"');
		expect(providersSource).toContain('import ClientToaster from "@/components/ui/ClientToaster"');
		expect(providersSource).not.toContain('dynamic(() => import("@/components/ui/ClientToaster")');
	});
});
