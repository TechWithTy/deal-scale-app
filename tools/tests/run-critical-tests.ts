import { spawnSync } from "node:child_process";

const VITEST_PATTERNS = [
	"tests/pwa/**/*.spec.ts",
	"lib/stores/user/_tests/critical/**/*.test.ts",
	"lib/utils/**/*.critical.test.ts",
];

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const vitestArgs = [
	"exec",
	"vitest",
	"run",
	"--run",
	"--passWithNoTests",
	...VITEST_PATTERNS,
];

const result = spawnSync(pnpmCommand, vitestArgs, {
	env: process.env,
	stdio: "pipe",
	encoding: "utf8",
});

if (result.stdout) {
	process.stdout.write(result.stdout);
}

if (result.stderr) {
	process.stderr.write(result.stderr);
}

const noTestsMessage =
	" critical suites were not detected. Add tests under tests/pwa/, lib/stores/user/_tests/critical/, or lib/utils/**/*.critical.test.ts to enable the modular pre-commit test flow. See docs/CI-CD_SETUP.md for details.\n";

const noTestsDetected =
	result.status === 0 &&
	((result.stdout && result.stdout.includes("No tests were found")) ||
		(result.stdout && result.stdout.includes("No test files found")) ||
		(result.stdout && result.stdout.includes("0 files")));

if (noTestsDetected) {
	process.stdout.write(
		`\n[critical-tests] No critical tests ran for this workspace;${noTestsMessage}`,
	);
} else if (result.status !== 0) {
	process.stdout.write(
		"\n[critical-tests] Critical test command exited with errors.\n",
	);
}

process.exitCode = result.status ?? 1;

