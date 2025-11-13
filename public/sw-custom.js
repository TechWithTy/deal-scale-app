/* eslint-disable no-restricted-globals */
import { clientsClaim, setCacheNameDetails } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { registerRoute, setCatchHandler } from "workbox-routing";
import {
	CacheFirst,
	NetworkFirst,
	NetworkOnly,
	StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

const {
	runtimeCaching,
	offlineFallback,
	queueNames,
} = require("./sw-config.js");

setCacheNameDetails({
	prefix: "deal-scale",
	suffix: "v1",
});

self.skipWaiting();
clientsClaim();

const precacheManifest = [...(self.__WB_MANIFEST || [])];

if (offlineFallback) {
	precacheManifest.push({
		url: offlineFallback,
		revision: null,
	});
}

precacheAndRoute(precacheManifest);
cleanupOutdatedCaches();

self.addEventListener("activate", (event) => {
	if (self.registration.navigationPreload) {
		event.waitUntil(self.registration.navigationPreload.enable());
	}
});

const defaultPlugins = [new CacheableResponsePlugin({ statuses: [0, 200] })];

function createStrategy(entry) {
	const { handler, options = {} } = entry;
	const strategyOptions = {
		cacheName: options.cacheName,
		networkTimeoutSeconds: options.networkTimeoutSeconds,
		plugins: [...defaultPlugins],
	};

	if (options.expiration) {
		strategyOptions.plugins.push(new ExpirationPlugin(options.expiration));
	}

	if (options.cacheableResponse) {
		strategyOptions.plugins.push(
			new CacheableResponsePlugin(options.cacheableResponse),
		);
	}

	switch (handler) {
		case "NetworkFirst":
			return new NetworkFirst(strategyOptions);
		case "CacheFirst":
			return new CacheFirst(strategyOptions);
		case "StaleWhileRevalidate":
			return new StaleWhileRevalidate(strategyOptions);
		default:
			return new StaleWhileRevalidate(strategyOptions);
	}
} // <-- Close function from above

// Check if runtimeCaching is defined and is an array before calling forEach
if (Array.isArray(runtimeCaching)) {
	for (const entry of runtimeCaching) {
		const strategy = createStrategy(entry);
		const method = entry.method || "GET";
		registerRoute(entry.urlPattern, strategy, method);
	}
} else {
	console.warn("runtimeCaching is not defined or not an array.");
}

const campaignSyncPlugin = new BackgroundSyncPlugin(queueNames.campaigns, {
	maxRetentionTime: 24 * 60, // minutes
});

registerRoute(
	({ request, url }) =>
		request.method === "POST" && url.pathname.startsWith("/api/campaign"),
	new NetworkOnly({
		plugins: [campaignSyncPlugin],
	}),
	"POST",
);

registerRoute(
	({ request, url }) =>
		request.method === "POST" && url.pathname.startsWith("/api/analytics"),
	new NetworkOnly({
		plugins: [
			new BackgroundSyncPlugin(queueNames.analytics, {
				maxRetentionTime: 24 * 60,
			}),
		],
	}),
	"POST",
);

setCatchHandler(async ({ event }) => {
	if (event.request.destination === "document" && offlineFallback) {
		const cached = await caches.match(offlineFallback, { ignoreSearch: true });
		if (cached) return cached;
	}
	if (event.request.destination === "image") {
		return new Response(undefined, { status: 504, statusText: "Offline" });
	}
	return Response.error();
});

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

function getNotificationPayload(event) {
	if (!event.data) {
		return null;
	}
	try {
		return event.data.json();
	} catch (error) {
		console.warn("Failed to parse push payload", error);
		return null;
	}
}

function resolveNotificationOptions(payload) {
	const title = payload?.title ?? "Deal Scale";
	const options = {
		body: payload?.body ?? "",
		icon: payload?.icon ?? "/logo/Deal_Scale_Logo.png",
		badge: payload?.badge ?? "/favicon.ico",
		data: {
			url: payload?.url ?? payload?.data?.url ?? "/dashboard",
			context: payload?.data?.context ?? null,
			meta: payload?.data ?? {},
		},
		actions: payload?.actions ?? [],
		tag: payload?.tag,
		renotify: Boolean(payload?.tag),
		requireInteraction: payload?.requireInteraction ?? false,
	};
	return { title, options };
}

self.addEventListener("push", (event) => {
	const payload = getNotificationPayload(event);
	const { title, options } = resolveNotificationOptions(payload);
	if (event.waitUntil) {
		event.waitUntil(self.registration.showNotification(title, options));
	}
});

async function focusOrOpenClient(url) {
	const absoluteUrl = new URL(url, self.location.origin).href;
	const allClients = await self.clients.matchAll({
		type: "window",
		includeUncontrolled: true,
	});

	for (const client of allClients) {
		if (client.url === absoluteUrl && "focus" in client) {
			await client.focus();
			return client;
		}
	}

	if (self.clients.openWindow) {
		return self.clients.openWindow(absoluteUrl);
	}
	return null;
}

self.addEventListener("notificationclick", (event) => {
	const notification = event.notification;
	const targetUrl = notification?.data?.url ?? "/dashboard";
	notification.close();
	if (event.waitUntil) {
		event.waitUntil(focusOrOpenClient(targetUrl));
	}
});
