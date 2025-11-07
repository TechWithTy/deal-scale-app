import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["tests/setup/vitest.setup.ts"],
		include: ["tests/**/*.spec.ts", "tests/**/*.spec.tsx"],
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

