import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{ find: "@", replacement: path.resolve(__dirname, "./src") },
			{ find: "@root", replacement: path.resolve(__dirname, "../../") },
			{ find: "@/lib", replacement: path.resolve(__dirname, "../../lib") },
			{
				find: "@/components",
				replacement: path.resolve(__dirname, "../../components"),
			},
			{ find: "@/hooks", replacement: path.resolve(__dirname, "../../hooks") },
			{
				find: "@/lib/_utils",
				replacement: path.resolve(__dirname, "../../lib/_utils/index.ts"),
			},
		],
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["tests/setup/vitest.setup.ts"],
		include: ["tests/**/*.spec.ts", "tests/**/*.spec.tsx"],
	},
});

