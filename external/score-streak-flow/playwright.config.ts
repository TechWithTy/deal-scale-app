import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests/vite-pwa/e2e",
	timeout: 90_000,
	projects: [
		{
			name: "chromium-pwa",
			use: {
				browserName: "chromium",
				headless: true,
				serviceWorkers: "allow",
				baseURL: "http://127.0.0.1:4173",
				viewport: { width: 1280, height: 720 },
			},
		},
	],
	webServer: {
		command: "pnpm dev -- --host --port 4173",
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		stdout: "pipe",
		stderr: "pipe",
	},
});
