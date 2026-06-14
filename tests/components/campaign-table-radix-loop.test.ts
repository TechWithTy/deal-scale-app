import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const campaignTablePath = path.join(
	root,
	"components",
	"campaigns",
	"utils",
	"campaignTable.tsx",
);

describe("Campaign table controls", () => {
	it("does not wrap campaign tabs or tables in Radix feature gates", () => {
		const source = readFileSync(campaignTablePath, "utf8");

		expect(source).toContain('data-tour="campaigns-tabs"');
		expect(source).toContain('data-tour="campaigns-create"');
		expect(source).not.toContain("FeatureGuard");
		expect(source).not.toContain("PopoverTrigger");
		expect(source).not.toContain("TooltipTrigger");
		expect(source).not.toContain("campaigns.table.socialMedia");
		expect(source).not.toContain("campaigns.table.directMail");
	});
});
