import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const isDevelopment = mode === "development";

	return {
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
		plugins: [
			react(),
			VitePWA({
				registerType: "prompt",
				includeAssets: ["favicon.ico", "placeholder.svg", "robots.txt"],
				manifest: {
					name: "Score Streak Flow",
					short_name: "ScoreStreak",
					description:
						"Score Streak Flow delivers live leaderboard insights with offline support.",
					start_url: "/",
					display: "standalone",
					theme_color: "#09090b",
					background_color: "#09090b",
					categories: ["productivity", "business"],
					icons: [
						{
							src: "/pwa-192x192.png",
							sizes: "192x192",
							type: "image/png",
						},
						{
							src: "/pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
						},
						{
							src: "/maskable-icon-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
						{
							src: "/apple-touch-icon-180x180.png",
							sizes: "180x180",
							type: "image/png",
						},
					],
					shortcuts: [
						{
							name: "Leaderboard",
							url: "/",
							description: "Jump back into the live leaderboard.",
							icons: [
								{
									src: "/pwa-192x192.png",
									sizes: "192x192",
									type: "image/png",
								},
							],
						},
					],
				},
				workbox: {
					cleanupOutdatedCaches: true,
					navigateFallback: "/index.html",
					navigateFallbackDenylist: [/^\/api\//],
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/api\.deal-scale\.com\/.*/i,
							handler: "NetworkFirst",
							options: {
								cacheName: "deal-scale-api",
								networkTimeoutSeconds: 10,
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
						{
							urlPattern:
								/^https:\/\/cdn\.deal-scale\.com\/.*\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
							handler: "CacheFirst",
							options: {
								cacheName: "deal-scale-images",
								expiration: {
									maxEntries: 200,
									maxAgeSeconds: 60 * 60 * 24 * 7,
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
						{
							urlPattern: /\/(dashboard|leaderboard).*/i,
							handler: "StaleWhileRevalidate",
							options: {
								cacheName: "deal-scale-dashboards",
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
					],
				},
				devOptions: {
					enabled: isDevelopment,
					navigateFallbackAllowlist: [/^\/$/],
				},
			}),
			isDevelopment && componentTagger(),
		].filter(Boolean),
		resolve: {
			alias: {
				// Map '@' to the monorepo root so we can import main app UI components
				// like '@root/components/ui/sonner' from this submodule.
				"@root": path.resolve(__dirname, "../../"),
				"@ssf": path.resolve(__dirname, "./src"),
			},
		},
	};
});
