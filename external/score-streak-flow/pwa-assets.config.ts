import { defineConfig } from "@vite-pwa/assets-generator/config";

export default defineConfig({
	preset: "minimal-2023",
	images: ["public/placeholder.svg"],
	outDir: "public",
	appleSplash: {
		backgroundColor: "#09090b",
	},
	manifest: {
		name: "Score Streak Flow",
		short_name: "ScoreStreak",
	},
});
