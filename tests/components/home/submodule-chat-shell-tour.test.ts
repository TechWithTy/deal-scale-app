import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const shellPath = path.join(
	root,
	"components",
	"home",
	"submodule-chat-shell.tsx",
);

describe("SubmoduleChatShell tours", () => {
	it("mounts the embedded chat inside the app tour provider", () => {
		const source = readFileSync(shellPath, "utf8");

		expect(source).toContain(
			'import { AppTourProvider } from "@/external/interactive-avatar-nextjs-demo/components/tour/AppTourProvider";',
		);
		expect(source).toMatch(
			/<AppTourProvider>\s*<StreamingAvatarProvider>\s*<SubmoduleChatPanel \/>/,
		);
	});
});
