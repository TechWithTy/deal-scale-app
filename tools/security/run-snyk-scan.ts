import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

const execFileAsync = promisify(execFile);
const DEFAULT_SNYK_IMAGE = "snyk/snyk:docker";

async function ensureDirectory(dirPath: string) {
	await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(filePath: string, contents: string) {
	await ensureDirectory(path.dirname(filePath));
	await fs.writeFile(filePath, contents, "utf8");
}

function normalizeProjectPath(projectPath: string) {
	return path.resolve(projectPath);
}

function toPosixPath(filePath: string) {
	return filePath.replace(/\\/g, "/");
}

async function runSnykCLI(args: string[], projectDir: string) {
	const snykCommand = process.env.SNYK_CMD ?? "snyk";
	const { stdout } = await execFileAsync(snykCommand, args, {
		env: process.env,
		cwd: projectDir,
	});
	return stdout;
}

async function runSnykDocker(args: string[], projectDir: string) {
	const dockerCmd = process.env.SNYK_DOCKER_CMD ?? "docker";
	const dockerImage = process.env.SNYK_DOCKER_IMAGE ?? DEFAULT_SNYK_IMAGE;
	const dockerArgs: string[] = ["run", "--rm"];

	const envVars = ["SNYK_TOKEN", "SNYK_ORG", "SNYK_SEVERITY_THRESHOLD"].filter(
		(name) => Boolean(process.env[name]),
	);
	for (const envName of envVars) {
		dockerArgs.push("-e", `${envName}=${process.env[envName]}`);
	}

	const volumePath = `${toPosixPath(projectDir)}:/project`;
	dockerArgs.push("-v", volumePath, "-w", "/project");

	const extraDockerArgs = process.env.SNYK_DOCKER_ARGS
		? process.env.SNYK_DOCKER_ARGS.split(" ").filter(Boolean)
		: [];
	dockerArgs.push(...extraDockerArgs);

	dockerArgs.push(dockerImage, ...args);

	console.info(
		`[security:snyk] Running Snyk via Docker: ${dockerCmd} ${dockerArgs.join(" ")}`,
	);

	const { stdout } = await execFileAsync(dockerCmd, dockerArgs, {
		env: process.env,
	});
	return stdout;
}

async function runSnykScan() {
	const snykToken = process.env.SNYK_TOKEN;
	const projectTarget = normalizeProjectPath(
		process.env.SNYK_PROJECT ?? process.cwd(),
	);
	const extraArgs =
		process.env.SNYK_FLAGS?.split(" ").map((flag) => flag.trim()).filter(Boolean) ??
		[];
	const reportDir = path.resolve("reports", "security", "snyk");
	const jsonReportPath = path.join(reportDir, "latest-report.json");
	const summaryReportPath = path.join(reportDir, "latest-report.txt");

	if (!snykToken) {
		console.warn(
			"[security:snyk] Skipping Snyk scan because SNYK_TOKEN is not set. Configure the token to enable scans.",
		);
		return;
	}

	const args = ["test", "--json", ...extraArgs];

	let stdout: string;
	try {
		stdout = await runSnykCLI(args, projectTarget);
	} catch (error) {
		const execError = error as NodeJS.ErrnoException & {
			stdout?: string;
			stderr?: string;
			code?: string | number;
		};

		if (execError.code === "ENOENT") {
			console.warn(
				"[security:snyk] Local Snyk CLI was not found. Falling back to Docker image…",
			);
			stdout = await runSnykDocker(args, projectTarget);
		} else if (
			typeof execError.stdout === "string" &&
			execError.stdout.trim().length > 0
		) {
			await writeFile(jsonReportPath, execError.stdout);
			await writeFile(
				summaryReportPath,
				[
					"[security:snyk] Snyk scan completed with findings.",
					`Project: ${projectTarget}`,
					"Vulnerabilities were detected. Review the JSON report for details.",
					`Report saved to: ${jsonReportPath}`,
				].join("\n"),
			);
			console.warn(
				"[security:snyk] Snyk reported vulnerabilities. Review the generated report for details.",
			);
			return;
		} else {
			console.error("[security:snyk] Failed to execute Snyk scan:", execError);
			throw error;
		}
	}

	await writeFile(jsonReportPath, stdout);

	let summary = "[security:snyk] Snyk scan completed.";
	let vulnerabilityCount = 0;

	try {
		const parsed = JSON.parse(stdout);
		if (Array.isArray(parsed)) {
			vulnerabilityCount = parsed.reduce(
				(total, current) =>
					total +
					(Array.isArray(current.vulnerabilities)
						? current.vulnerabilities.length
						: 0),
				0,
			);
		} else if (parsed && Array.isArray(parsed.vulnerabilities)) {
			vulnerabilityCount = parsed.vulnerabilities.length;
		}

		summary = [
			"[security:snyk] Snyk scan completed.",
			`Project: ${projectTarget}`,
			`Vulnerabilities found: ${vulnerabilityCount}`,
			`Report saved to: ${jsonReportPath}`,
		].join("\n");
	} catch (parseError) {
		console.warn(
			"[security:snyk] Unable to parse Snyk JSON output for summary. Raw output has been saved.",
			parseError,
		);
	}

	await writeFile(summaryReportPath, summary);
	console.info("[security:snyk] Snyk scan results saved.");
}

runSnykScan().catch((error) => {
	console.error(
		"[security:snyk] Unexpected error while running Snyk scan.",
		error,
	);
	process.exitCode = 1;
});
