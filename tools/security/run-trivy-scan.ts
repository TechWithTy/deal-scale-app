import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPORT_ROOT = path.resolve("reports", "security", "trivy");
const JSON_REPORT = path.join(REPORT_ROOT, "latest-report.json");
const SUMMARY_REPORT = path.join(REPORT_ROOT, "latest-report.txt");
const DEFAULT_TRIVY_IMAGE = "ghcr.io/aquasecurity/trivy:0.67.2";

function getAdditionalArgs(): string[] {
	const rawFlags = process.env.TRIVY_FLAGS;
	if (!rawFlags) return [];
	return rawFlags
		.split(" ")
		.map((flag) => flag.trim())
		.filter(Boolean);
}

async function ensureDirectory(dirPath: string) {
	await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(filePath: string, contents: string) {
	await ensureDirectory(path.dirname(filePath));
	await fs.writeFile(filePath, contents, "utf8");
}

function toPosixPath(inputPath: string) {
	return inputPath.replace(/\\/g, "/");
}

function resolveDockerTarget(target: string, workspace: string) {
	if (target === "." || target === "./") {
		return ".";
	}

	if (path.isAbsolute(target)) {
		const relative = path.relative(workspace, target);
		return relative ? toPosixPath(path.posix.join("/scan", relative)) : ".";
	}

	return toPosixPath(target);
}

async function runTrivyDocker(
	baseArgs: string[],
	target: string,
): Promise<string> {
	const dockerCmd = process.env.TRIVY_DOCKER_CMD ?? "docker";
	const dockerImage = process.env.TRIVY_DOCKER_IMAGE ?? DEFAULT_TRIVY_IMAGE;
	const cacheDir =
		process.env.TRIVY_CACHE_DIR ?? path.resolve(".trivy-cache/docker");
	const workspace = process.cwd();
	await ensureDirectory(cacheDir);

	const dockerArgs: string[] = [
		"run",
		"--rm",
		"-v",
		`${workspace}:/scan`,
		"-w",
		"/scan",
		"-v",
		`${cacheDir}:/root/.cache`,
	];

	const extraDockerArgs = process.env.TRIVY_DOCKER_ARGS
		? process.env.TRIVY_DOCKER_ARGS.split(" ").filter(Boolean)
		: [];
	dockerArgs.push(...extraDockerArgs);
	dockerArgs.push(dockerImage, ...baseArgs, resolveDockerTarget(target, workspace));

	console.info(
		`[security:trivy] Running containerized Trivy scan via "${dockerCmd} ${dockerArgs.join(" ")}"`,
	);

	const { stdout } = await execFileAsync(dockerCmd, dockerArgs, {
		env: process.env,
	});

	return stdout;
}

async function runTrivyCli(baseArgs: string[], target: string): Promise<string> {
	const trivyCommand = process.env.TRIVY_CMD ?? "trivy";
	const args = [...baseArgs, target];
	const { stdout } = await execFileAsync(trivyCommand, args, {
		env: process.env,
	});
	return stdout;
}

async function runTrivyScan() {
	const target = process.env.TRIVY_TARGET ?? ".";
	const severity = process.env.TRIVY_SEVERITY;
	const ignoreUnfixed = process.env.TRIVY_IGNORE_UNFIXED ?? "true";

	const baseArgs: string[] = ["fs", "--format", "json"];

	if (severity) {
		baseArgs.push("--severity", severity);
	}

	if (ignoreUnfixed.toLowerCase() === "true") {
		baseArgs.push("--ignore-unfixed");
	}

	baseArgs.push(...getAdditionalArgs());

	let stdout: string;
	try {
		stdout = await runTrivyCli(baseArgs, target);
	} catch (error) {
		const execError = error as NodeJS.ErrnoException & {
			stdout?: string;
			stderr?: string;
			code?: string | number;
			spawnargs?: string[];
		};

		if (execError.code === "ENOENT") {
			console.warn(
				"[security:trivy] Local Trivy binary not found. Falling back to Docker image…",
			);
			stdout = await runTrivyDocker(baseArgs, target);
		} else if (
			typeof execError.stdout === "string" &&
			execError.stdout.trim()
		) {
			await writeFile(JSON_REPORT, execError.stdout);
			await writeFile(
				SUMMARY_REPORT,
				[
					"[security:trivy] Trivy scan completed with findings.",
					"Review the JSON report for details.",
					`Report saved to: ${JSON_REPORT}`,
				].join("\n"),
			);
			console.warn(
				"[security:trivy] Trivy reported vulnerabilities. Review the generated report for details.",
			);
			return;
		} else {
			console.error("[security:trivy] Failed to execute Trivy scan.", execError);
			throw error;
		}
	}

	await writeFile(JSON_REPORT, stdout);

	let vulnerabilityCount = 0;
	let resultCount = 0;

	try {
		const parsed = JSON.parse(stdout);
		if (parsed && Array.isArray(parsed.Results)) {
			resultCount = parsed.Results.length;
			for (const result of parsed.Results) {
				if (Array.isArray(result.Vulnerabilities)) {
					vulnerabilityCount += result.Vulnerabilities.length;
				}
			}
		}
	} catch (error) {
		console.warn(
			"[security:trivy] Unable to parse JSON output. Raw JSON saved for review.",
		);
	}

	const summaryLines = [
		"[security:trivy] Trivy filesystem scan completed.",
		`Target: ${target}`,
		`Results: ${resultCount}`,
		`Vulnerabilities found: ${vulnerabilityCount}`,
		`Report saved to: ${JSON_REPORT}`,
	];

	await writeFile(SUMMARY_REPORT, summaryLines.join("\n"));
	console.info("[security:trivy] Trivy scan results saved.");
}

runTrivyScan().catch((error) => {
	console.error(
		"[security:trivy] Unexpected error while running Trivy scan.",
		error,
	);
	process.exitCode = 1;
});
