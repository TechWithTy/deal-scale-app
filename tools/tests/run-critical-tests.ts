import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const VITEST_PATTERNS = [
	"tests/pwa/**/*.spec.ts",
	"lib/stores/user/_tests/critical/**/*.test.ts",
	"lib/utils/**/*.critical.test.ts",
	"_tests/app/dashboard/quickstart/**/*.test.tsx",
];

// Helper function to find test files matching a pattern
function findTestFiles(pattern: string): string[] {
	const files: string[] = [];
	
	// Simple pattern matching - convert glob to regex-like search
	if (pattern.includes("**")) {
		// Handle ** patterns by recursively searching
		const parts = pattern.split("**");
		const basePath = parts[0].replace(/\/$/, "");
		let filePattern = parts[parts.length - 1] || "";
		
		// Remove leading slash from file pattern if present
		filePattern = filePattern.replace(/^\//, "");
		
		// Convert glob pattern to regex (e.g., "*.spec.ts" -> ".*\.spec\.ts$")
		const regexPattern = filePattern
			.replace(/\./g, "\\.")
			.replace(/\*/g, ".*")
			.replace(/\?/g, ".");
		const regex = new RegExp(regexPattern + "$");
		
		if (existsSync(basePath)) {
			function walkDir(dir: string): void {
				try {
					const entries = readdirSync(dir);
					for (const entry of entries) {
						// Skip node_modules and other common ignore patterns
						if (entry === "node_modules" || entry.startsWith(".")) {
							continue;
						}
						
						const fullPath = join(dir, entry);
						try {
							const stat = statSync(fullPath);
							if (stat.isDirectory()) {
								walkDir(fullPath);
							} else if (stat.isFile() && regex.test(entry)) {
								files.push(fullPath);
							}
						} catch {
							// Skip files we can't access
						}
					}
				} catch {
					// Skip directories we can't access
				}
			}
			walkDir(basePath);
		}
	} else {
		// Simple pattern - just check if file exists
		if (existsSync(pattern)) {
			files.push(pattern);
		}
	}
	
	return files;
}

// Find actual test files that match the patterns
const testFiles = VITEST_PATTERNS.flatMap((pattern) => findTestFiles(pattern))
	.filter((file) => existsSync(file))
	.map((file) => {
		// Use relative paths for vitest (it works better with relative paths)
		const resolved = resolve(file);
		// Convert to relative path from process.cwd() and normalize separators
		try {
			const rel = relative(process.cwd(), resolved);
			return rel.replace(/\\/g, "/"); // Normalize to forward slashes
		} catch {
			return resolved.replace(/\\/g, "/");
		}
	})
	.filter((file, index, self) => self.indexOf(file) === index); // Remove duplicates


// If no test files found, exit successfully (passWithNoTests behavior)
if (testFiles.length === 0) {
	const noTestsMessage =
		" critical suites were not detected. Add tests under tests/pwa/, lib/stores/user/_tests/critical/, lib/utils/**/*.critical.test.ts, or _tests/app/dashboard/quickstart/ to enable the modular pre-commit test flow. See docs/CI-CD_SETUP.md for details.\n";
	process.stdout.write(
		`\n[critical-tests] No critical tests ran for this workspace;${noTestsMessage}`,
	);
	process.exitCode = 0;
	process.exit(0);
}

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const vitestArgs = [
	"exec",
	"vitest",
	"run",
	"--run",
	"--passWithNoTests",
	...testFiles,
];

// On Windows, use shell: true to properly handle .cmd files
const spawnOptions: Parameters<typeof spawnSync>[2] = {
	env: process.env,
	stdio: "pipe",
	encoding: "utf8",
	...(process.platform === "win32" && { shell: true }),
};

const result = spawnSync(pnpmCommand, vitestArgs, spawnOptions);

// Always show output for debugging
if (result.stdout) {
	process.stdout.write(result.stdout);
}

if (result.stderr) {
	process.stderr.write(result.stderr);
}


const noTestsDetected =
	result.status === 0 &&
	((result.stdout && result.stdout.includes("No tests were found")) ||
		(result.stdout && result.stdout.includes("No test files found")) ||
		(result.stdout && result.stdout.includes("0 files")));

if (noTestsDetected) {
	const noTestsMessage =
		" critical suites were not detected. Add tests under tests/pwa/, lib/stores/user/_tests/critical/, lib/utils/**/*.critical.test.ts, or _tests/app/dashboard/quickstart/ to enable the modular pre-commit test flow. See docs/CI-CD_SETUP.md for details.\n";
	process.stdout.write(
		`\n[critical-tests] No critical tests ran for this workspace;${noTestsMessage}`,
	);
	process.exitCode = 0;
} else if (result.status !== 0) {
	process.stdout.write(
		"\n[critical-tests] Critical test command exited with errors.\n",
	);
	process.exitCode = result.status ?? 1;
} else {
	process.exitCode = 0;
}

