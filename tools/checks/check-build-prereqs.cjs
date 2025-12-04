const path = require('node:path');
let loadEnvConfig = () => {};
try { ({ loadEnvConfig } = require('@next/env')); } catch { /* optional */ }

function pushIssue(issues, level, message) {
  issues.push({ level, message });
}

function checkPostcss(projectRoot, issues) {
  const postcssPath = path.resolve(projectRoot, 'postcss.config.js');
  try {
    const cfg = require(postcssPath);
    if (typeof cfg === 'function') {
      pushIssue(issues, 'error', `postcss.config.js must export a plain object, found function export at ${postcssPath}`);
      return;
    }
    if (!cfg || typeof cfg !== 'object' || typeof cfg.plugins !== 'object') {
      pushIssue(issues, 'error', `postcss.config.js should export { plugins: {...} } at ${postcssPath}`);
    }
  } catch (err) {
    pushIssue(issues, 'error', `Failed to load postcss.config.js at ${postcssPath}: ${err && (err.message || err)}`);
  }
}

function checkAuthDeps(issues) {
  if (process.env.NEXT_DISABLE_AUTH === '1') return;
  try { require.resolve('@auth/core'); } catch { pushIssue(issues, 'error', 'Missing dependency: @auth/core (required by next-auth v5)'); }
  try { require.resolve('@auth/core/errors'); } catch { pushIssue(issues, 'error', 'Missing dependency: @auth/core/errors (subpath import used by next-auth)'); }
}

function checkTailwindDeps(issues) {
  if (process.env.NEXT_DISABLE_TAILWIND === '1') return;
  try { require.resolve('@alloc/quick-lru'); } catch { pushIssue(issues, 'error', 'Missing dependency: @alloc/quick-lru (required by tailwindcss)'); }
}

function checkPwaDeps(issues) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd || process.env.NEXT_DISABLE_PWA === '1') return;
  try { require.resolve('@apideck/better-ajv-errors'); } catch { pushIssue(issues, 'warn', 'Potential missing dependency: @apideck/better-ajv-errors (required by workbox-build via next-pwa)'); }
}

function checkNextConfig(projectRoot, issues) {
  const nextConfigPath = path.resolve(projectRoot, 'next.config.js');
  try { require(nextConfigPath); }
  catch (err) { pushIssue(issues, 'error', `next.config.js throws at require-time: ${err && (err.message || err)}`); }
}

function main() {
  const projectRoot = process.cwd();
  try { loadEnvConfig(projectRoot, process.env.NODE_ENV !== 'production'); } catch { /* ignore if missing */ }

  const issues = [];
  checkPostcss(projectRoot, issues);
  checkAuthDeps(issues);
  checkTailwindDeps(issues);
  checkPwaDeps(issues);
  checkNextConfig(projectRoot, issues);

  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');

  if (warns.length) {
    console.warn('[build:prereqs] Warnings:\n' + warns.map((w) => `- ${w.message}`).join('\n'));
  }
  if (errors.length) {
    console.error('[build:prereqs] Errors:\n' + errors.map((e) => `- ${e.message}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('[build:prereqs] All prerequisite checks passed.');
  }
}

if (require.main === module) main();
