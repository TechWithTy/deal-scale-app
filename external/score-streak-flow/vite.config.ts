import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	optimizeDeps: {
		include: ["@root/components/ui/**"],
	},
	build: {
		commonjsOptions: {
			include: [/components/, /node_modules/],
		},
	},
	server: {
		host: "::",
		port: 8080,
	},
	plugins: [react(), mode === "development" && componentTagger()].filter(
		Boolean,
	),
	resolve: {
		alias: {
			// Map '@' to the monorepo root so we can import main app UI components
			// like '@root/components/ui/sonner' from this submodule.
			"@root": path.resolve(__dirname, "../../"),
			"@ssf": path.resolve(__dirname, "./src"),
		},
	},
}));
