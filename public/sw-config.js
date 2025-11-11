const DAY_IN_SECONDS = 24 * 60 * 60;

const runtimeCaching = [
	{
		urlPattern: /^https?:\/\/[^/]+\/_next\//i,
		handler: "StaleWhileRevalidate",
		options: {
			cacheName: "next-static-resources",
			expiration: {
				maxEntries: 200,
				maxAgeSeconds: 7 * DAY_IN_SECONDS,
			},
		},
	},
	{
		urlPattern: /^https?:\/\/[^/]+\/(?:app|dashboard|api)\//i,
		handler: "NetworkFirst",
		options: {
			cacheName: "dynamic-api-data",
			networkTimeoutSeconds: 10,
			expiration: {
				maxEntries: 150,
				maxAgeSeconds: 2 * DAY_IN_SECONDS,
			},
		},
	},
	{
		urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/i,
		handler: "CacheFirst",
		options: {
			cacheName: "media-assets",
			expiration: {
				maxEntries: 100,
				maxAgeSeconds: 30 * DAY_IN_SECONDS,
			},
		},
	},
	{
		urlPattern: /\.(?:woff2?|ttf|otf)$/i,
		handler: "CacheFirst",
		options: {
			cacheName: "font-assets",
			expiration: {
				maxEntries: 20,
				maxAgeSeconds: 180 * DAY_IN_SECONDS,
			},
		},
	},
	{
		urlPattern: ({ request }) => request.destination === "document",
		handler: "NetworkFirst",
		options: {
			cacheName: "app-shell-pages",
			networkTimeoutSeconds: 8,
			expiration: {
				maxEntries: 20,
				maxAgeSeconds: DAY_IN_SECONDS,
			},
		},
	},
];

module.exports = {
	runtimeCaching,
	offlineFallback: "/offline",
	queueNames: {
		campaigns: "campaign-sync-queue",
		analytics: "analytics-sync-queue",
	},
};


