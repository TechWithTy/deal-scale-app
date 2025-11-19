import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const projectRoot = resolve(__dirname, "../..");
const appDir = join(projectRoot, "app");
const outputPath = join(projectRoot, "commitlint.scopes.json");

const RESERVED_PREFIXES = ["_", "[", "."];
const IGNORED_SEGMENTS = new Set([
	"favicon.ico",
	"globals.css",
	"layout.tsx",
	"page.tsx",
	"not-found.tsx",
	"error.tsx",
	"global-error.tsx",
	"sitemap.ts",
	"node_modules",
	".git",
	"dist",
	"build",
	".next",
	".turbo",
]);

const STATIC_SCOPES = [
	"api",
	"dashboard",
	"dashboard-api",
	"shared",
	"landing",
	"config",
	"deps",
	"docs",
];

const MAX_DEPTH = 2;

/**
 * Sanitizes a directory segment name into a valid commit scope.
 * Removes parentheses, converts to lowercase, replaces invalid chars with hyphens.
 */
const sanitizeSegment = (segment: string): string => {
	const cleaned = segment
		.replace(/^\(|\)$/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
	return cleaned;
};

/**
 * Determines if a directory name should be skipped when generating scopes.
 */
const shouldSkip = (name: string): boolean => {
	if (IGNORED_SEGMENTS.has(name)) {
		return true;
	}
	return RESERVED_PREFIXES.some((prefix) => name.startsWith(prefix));
};

/**
 * Recursively walks a directory tree and collects valid scope names.
 */
const walk = (
	dir: string,
	scopes: Set<string>,
	depth = 0,
	trail: string[] = [],
): void => {
	if (depth >= MAX_DEPTH) {
		return;
	}

	if (!existsSync(dir)) {
		console.warn(`⚠️  Directory does not exist: ${dir}`);
		return;
	}

	try {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}

			if (shouldSkip(entry.name)) {
				continue;
			}

			const sanitized = sanitizeSegment(entry.name);
			if (!sanitized) {
				continue;
			}

			const scopeParts = [...trail, sanitized];
			const scope = scopeParts.join("-");
			scopes.add(scope);

			const nextPath = join(dir, entry.name);
			try {
				if (statSync(nextPath).isDirectory()) {
					walk(nextPath, scopes, depth + 1, scopeParts);
				}
			} catch (error) {
				console.warn(
					`⚠️  Error accessing directory ${nextPath}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	} catch (error) {
		console.error(
			`❌ Error reading directory ${dir}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Validates that the generated scopes array is valid.
 */
const validateScopes = (scopes: string[]): boolean => {
	if (!Array.isArray(scopes)) {
		console.error("❌ Scopes must be an array");
		return false;
	}

	if (scopes.length === 0) {
		console.error("❌ No scopes generated");
		return false;
	}

	for (const scope of scopes) {
		if (typeof scope !== "string") {
			console.error(`❌ Invalid scope type: ${scope}`);
			return false;
		}
		if (scope.length === 0) {
			console.error("❌ Empty scope found");
			return false;
		}
	}

	return true;
};

/**
 * Main execution function.
 */
const main = (): void => {
	console.log("🔄 Syncing commit scopes...");
	console.log(`📁 Scanning: ${appDir}`);

	const scopes = new Set<string>(STATIC_SCOPES);

	// Walk the app directory to discover scopes
	if (existsSync(appDir)) {
		walk(appDir, scopes);
	} else {
		console.warn(`⚠️  App directory not found: ${appDir}`);
	}

	const sortedScopes = Array.from(scopes).sort();

	// Validate before writing
	if (!validateScopes(sortedScopes)) {
		console.error("❌ Validation failed. Aborting file write.");
		process.exit(1);
	}

	// Write the output file
	try {
		const output = JSON.stringify(sortedScopes, null, 2);
		writeFileSync(outputPath, output, "utf-8");
		console.log(
			`✅ Generated ${sortedScopes.length} commit scopes -> ${outputPath}`,
		);
		console.log(
			`📊 Scope count breakdown: ${STATIC_SCOPES.length} static + ${sortedScopes.length - STATIC_SCOPES.length} discovered`,
		);
	} catch (error) {
		console.error(
			`❌ Failed to write output file: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
};

// Run the script
main();
