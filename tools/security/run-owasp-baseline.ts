import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

const execFileAsync = promisify(execFile);
const DEFAULT_COMPOSE_FILE = path.resolve(
	"docker",
	"docker-compose.security.yml",
);
const DEFAULT_COMPOSE_SERVICE = "zap-baseline";

async function ensureDirectory(dirPath: string) {
	await fs.mkdir(dirPath, { recursive: true });
}

async function writeProcessOutput(
	logPath: string,
	stdout?: string,
	stderr?: string,
) {
	const trimmedStdout = stdout?.trim();
	const trimmedStderr = stderr?.trim();
	let logWritten = false;

	if (trimmedStdout) {
		await fs.writeFile(logPath, stdout ?? "", "utf8");
		logWritten = true;
	}

	if (trimmedStderr) {
		const prefix = logWritten ? "\n" : "";
		const content = `${prefix}[stderr]\n${stderr}`;
		if (logWritten) {
			await fs.appendFile(logPath, content, "utf8");
		} else {
			await fs.writeFile(logPath, content, "utf8");
		}
	}
}

async function runWithDocker(
	logPath: string,
	reportDir: string,
): Promise<boolean> {
	const composeCommand = process.env.OWASP_DOCKER_COMPOSE_CMD ?? "docker";
	const composeFile =
		process.env.OWASP_DOCKER_COMPOSE_FILE ?? DEFAULT_COMPOSE_FILE;
	const composeService =
		process.env.OWASP_DOCKER_SERVICE ?? DEFAULT_COMPOSE_SERVICE;
	const pullBehavior = process.env.OWASP_DOCKER_PULL ?? "missing";
	const projectName = process.env.OWASP_DOCKER_PROJECT;

	const args: string[] = [];
	const lowerCaseCommand = composeCommand.toLowerCase();
	if (!lowerCaseCommand.includes("docker-compose")) {
		args.push("compose");
	}
	args.push("-f", composeFile, "run", "--rm");
	if (pullBehavior) {
		args.push(`--pull=${pullBehavior}`);
	}
	if (projectName) {
		args.push("--project-name", projectName);
	}
	args.push(composeService);

	try {
		const { stdout, stderr } = await execFileAsync(composeCommand, args, {
			env: process.env,
		});
		await writeProcessOutput(logPath, stdout, stderr);
		console.info(
			`[security:owasp] OWASP ZAP baseline scan finished via Docker Compose (${composeService}). Reports available in ${reportDir}`,
		);
		return true;
	} catch (error) {
		const execError = error as NodeJS.ErrnoException & {
			stdout?: string;
			stderr?: string;
		};

		if (execError.stdout || execError.stderr) {
			await writeProcessOutput(logPath, execError.stdout, execError.stderr);
			console.warn(
				`[security:owasp] Docker-based OWASP scan exited with warnings. See ${logPath} for details.`,
			);
		}

		if (execError.code === "ENOENT") {
			console.warn(
				`[security:owasp] Docker command "${composeCommand}" not found. Install Docker Desktop or set OWASP_DOCKER_COMPOSE_CMD.`,
			);
			return false;
		}

		console.error(
			`[security:owasp] Docker Compose scan failed (${composeService}).`,
			execError,
		);
		return false;
	}
}

async function runCommand(command: string, args: string[]) {
	console.info(`[security:owasp] Running "${command} ${args.join(" ")}"`);
	await execFileAsync(command, args, { env: process.env });
}

async function waitForServerReady(
	url: string,
	timeoutMs = 60_000,
	intervalMs = 2_000,
) {
	const controller = new AbortController();
	const signal = controller.signal;
	const end = Date.now() + timeoutMs;
	while (Date.now() < end) {
		try {
			const response = await fetch(url, { signal });
			if (response.ok) {
				return;
			}
		} catch {
			// ignore until timeout
		}
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
	throw new Error(
		`[security:owasp] Timed out waiting for app at ${url} to become ready.`,
	);
}

async function startManagedServer(
	healthUrl: string,
): Promise<() => Promise<void>> {
	await runCommand("pnpm", ["run", "build"]);

	console.info("[security:owasp] Starting Next.js server via pnpm start…");
	const serverProcess = spawn("pnpm", ["run", "start"], {
		stdio: "inherit",
		env: process.env,
	});

	serverProcess.on("error", (error) => {
		console.error("[security:owasp] Failed to start server:", error);
	});

	await waitForServerReady(healthUrl);
	console.info("[security:owasp] Application is responding; proceeding with scan.");

	return async () => {
		console.info("[security:owasp] Stopping managed server…");
		serverProcess.kill("SIGINT");
		await new Promise((resolve) => {
			serverProcess.on("close", resolve);
			setTimeout(resolve, 5_000);
		});
	};
}

async function runOwaspBaselineScan() {
	const baselineCommand = process.env.OWASP_BASELINE_CMD ?? "zap-baseline.py";
	const rawTarget = process.env.OWASP_TARGET ?? "http://localhost:3000";
	const dockerTarget =
		process.env.OWASP_TARGET ?? "http://host.docker.internal:3000";
	const extraArgs =
		process.env.OWASP_BASELINE_ARGS?.split(" ").filter(Boolean) ?? [];
	const reportDir = path.resolve("reports", "security", "owasp");
	const reportPath = path.join(reportDir, "latest-report.html");
	const logPath = path.join(reportDir, "latest-report.log");
	const shouldManageServer = process.env.OWASP_MANAGE_SERVER !== "0";
	const healthProbeTarget =
		process.env.OWASP_HEALTH_URL ?? `${rawTarget.replace(/\/$/, "")}/`;

	await ensureDirectory(reportDir);

	let stopServer: (() => Promise<void>) | undefined;

	try {
		if (shouldManageServer) {
			stopServer = await startManagedServer(healthProbeTarget);
		}

		const preferDocker = process.env.OWASP_USE_DOCKER === "1";
		if (preferDocker) {
			process.env.OWASP_TARGET = dockerTarget;
			const dockerSuccess = await runWithDocker(logPath, reportDir);
			if (!dockerSuccess) {
				throw new Error(
					"[security:owasp] Docker Compose run requested (OWASP_USE_DOCKER=1) but failed.",
				);
			}
			return;
		}

		try {
			const { stdout, stderr } = await execFileAsync(
				baselineCommand,
				["-t", rawTarget, "-r", reportPath, ...extraArgs],
				{ env: process.env },
			);

			await writeProcessOutput(logPath, stdout, stderr);
			console.info(
				`[security:owasp] OWASP ZAP baseline scan finished. Report saved to ${reportPath}`,
			);
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & {
				stdout?: string;
				stderr?: string;
			};

			if (execError.code === "ENOENT") {
				console.warn(
					`[security:owasp] "${baselineCommand}" is not available. Attempting Docker fallback...`,
				);
				process.env.OWASP_TARGET = dockerTarget;
				const dockerSuccess = await runWithDocker(logPath, reportDir);
				if (!dockerSuccess) {
					console.warn(
						"[security:owasp] Docker fallback failed. Install OWASP ZAP CLI or configure Docker to continue.",
					);
				}
				return;
			}

			if (execError.stdout || execError.stderr) {
				await writeProcessOutput(logPath, execError.stdout, execError.stderr);
				console.warn(
					`[security:owasp] OWASP baseline scan completed with warnings. Review ${logPath} for details.`,
				);
				return;
			}

			console.error(
				"[security:owasp] Failed to execute OWASP baseline scan.",
				execError,
			);
			throw error;
		}
	} finally {
		if (stopServer) {
			await stopServer();
		}
	}
}

runOwaspBaselineScan().catch((error) => {
	console.error(
		"[security:owasp] Unexpected error while running OWASP baseline scan.",
		error,
	);
	process.exitCode = 1;
});
