import path from "node:path";
import { loadEnvConfig } from "@next/env";

type Issue = { level: "error" | "warn"; message: string };

function pushIssue(issues: Issue[], level: Issue["level"], message: string) {
  issues.push({ level, message });
}

function checkPostcss(projectRoot: string, issues: Issue[]) {
  const postcssPath = path.resolve(projectRoot, "postcss.config.js");
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cfg = require(postcssPath);
    if (typeof cfg === "function") {
      pushIssue(
        issues,
        "error",
        `postcss.config.js must export a plain object, found function export at ${postcssPath}`,
      );
      return;
    }
    if (!cfg || typeof cfg !== "object" || typeof cfg.plugins !== "object") {
      pushIssue(
        issues,
        "error",
        `postcss.config.js should export { plugins: {...} } at ${postcssPath}`,
      );
    }
  } catch (err: any) {
    pushIssue(
      issues,
      "error",
      `Failed to load postcss.config.js at ${postcssPath}: ${err?.message || err}`,
    );
  }
}

function checkAuthDeps(issues: Issue[]) {
  if (process.env.NEXT_DISABLE_AUTH === "1") return; // explicitly disabled
  try {
    require.resolve("@auth/core");
  } catch {
    pushIssue(issues, "error", "Missing dependency: @auth/core (required by next-auth v5)");
  }
  try {
    require.resolve("@auth/core/errors");
  } catch {
    pushIssue(issues, "error", "Missing dependency: @auth/core/errors (subpath import used by next-auth)");
  }
}

function checkTailwindDeps(issues: Issue[]) {
  if (process.env.NEXT_DISABLE_TAILWIND === "1") return; // explicitly disabled
  try {
    require.resolve("@alloc/quick-lru");
  } catch {
    pushIssue(issues, "error", "Missing dependency: @alloc/quick-lru (required by tailwindcss)");
  }
}

function checkPwaDeps(issues: Issue[]) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd || process.env.NEXT_DISABLE_PWA === "1") return;
  try {
    require.resolve("@apideck/better-ajv-errors");
  } catch {
    // Not fatal by default, but draw attention
    pushIssue(
      issues,
      "warn",
      "Potential missing dependency: @apideck/better-ajv-errors (required by workbox-build via next-pwa)",
    );
  }
}

function checkNextConfig(projectRoot: string, issues: Issue[]) {
  const nextConfigPath = path.resolve(projectRoot, "next.config.js");
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(nextConfigPath);
  } catch (err: any) {
    pushIssue(
      issues,
      "error",
      `next.config.js throws at require-time: ${err?.message || err}`,
    );
  }
}

function main() {
  const projectRoot = process.cwd();
  loadEnvConfig(projectRoot, process.env.NODE_ENV !== "production");

  const issues: Issue[] = [];
  checkPostcss(projectRoot, issues);
  checkAuthDeps(issues);
  checkTailwindDeps(issues);
  checkPwaDeps(issues);
  checkNextConfig(projectRoot, issues);

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  if (warns.length) {
    console.warn("[build:prereqs] Warnings:\n" + warns.map((w) => `- ${w.message}`).join("\n"));
  }
  if (errors.length) {
    console.error("[build:prereqs] Errors:\n" + errors.map((e) => `- ${e.message}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("[build:prereqs] All prerequisite checks passed.");
  }
}

if (require.main === module) {
  main();
}

