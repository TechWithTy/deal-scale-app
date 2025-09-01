import { defineConfig } from "tsup";

export default defineConfig([
	// Library build (ESM + CJS)
	{
		entry: ["index.ts"],
		format: ["esm", "cjs"],
		dts: true,
		sourcemap: true,
		clean: true,
		minify: false,
		platform: "browser",
		target: "es2018",
		treeshake: true,
		external: ["react", "react-dom"],
		skipNodeModulesBundle: true,
		tsconfig: "../../tsconfig.json",
		esbuildOptions(options) {
			options.jsx = "automatic";
		},
	},
	// UMD build (IIFE) for <script> consumers
	{
		entry: { index: "web/index.ts" },
		format: ["iife"],
		dts: false,
		sourcemap: true,
		clean: false,
		minify: true,
		platform: "browser",
		target: "es2018",
		treeshake: true,
		splitting: false,
		outDir: "dist/umd",
		globalName: "DealActionBar",
		// Bundle everything to be self-contained for CDN usage
		noExternal: ["react", "react-dom", "lucide-react", "cmdk"],
		tsconfig: "../../tsconfig.json",
		esbuildOptions(options) {
			options.jsx = "automatic";
		},
	},
]);
