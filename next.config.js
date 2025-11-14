const path = require("node:path");
const { buildCacheControl } = require("./utils/http/cacheControl.js");
const { offlineFallback } = require("./public/sw-config.js");

const imageStackValue =
	process.env.NEXT_IMAGE_STACK ??
	(process.env.CF_PAGES ? "cloudflare" : "next");
const imageStack =
	typeof imageStackValue === "string"
		? imageStackValue.toLowerCase()
		: "next";
const useCloudflareImages = imageStack === "cloudflare";

// Bundle analyzer (run with: ANALYZE=true pnpm build)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

// PWA support - make dashboard installable
const withPWA = require("next-pwa")({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
	skipWaiting: true,
	swSrc: "./public/sw-custom.js",
	buildExcludes: [/middleware-manifest\.json$/],
	fallbacks: {
		document: offlineFallback,
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Essential configurations
	output: "standalone",
	transpilePackages: ["shadcn-table"],
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	async headers() {
		const securityHeaders = [
			{
				key: "Content-Security-Policy",
				value:
					"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; connect-src 'self' https:; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; media-src 'self' https: blob: data:; frame-src 'self' https://app.supademo.com https://www.youtube.com https://open.spotify.com https://sdk.scdn.co; frame-ancestors 'self'; form-action 'self'; base-uri 'self';",
			},
			{
				key: "Strict-Transport-Security",
				value: "max-age=63072000; includeSubDomains; preload",
			},
			{ key: "X-Content-Type-Options", value: "nosniff" },
			{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
			{
				key: "Permissions-Policy",
				value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
			},
			{ key: "X-Frame-Options", value: "SAMEORIGIN" },
		];

		const marketingCacheControl = buildCacheControl({
			cacheability: "public",
			maxAge: 900,
			sMaxAge: 86400,
			staleWhileRevalidate: 86400,
		});

		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
			{
				source: "/",
				headers: [
					{
						key: "Cache-Control",
						value: marketingCacheControl,
					},
				],
			},
		];
	},

	// Image optimization and CDN configuration
	images: {
		domains: [
			"utfs.io",
			"www.realtor.com",
			"images.unsplash.com",
			"unsplash.com",
			"pixabay.com",
			"ap.rdcpix.com",
			"loremflickr.com",
			"picsum.photos",
			"avatars.githubusercontent.com",
			"placehold.co",
			"i.pravatar.cc",
		],
		formats: ["image/webp", "image/avif"], // Modern image formats
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
		...(useCloudflareImages
			? {
					loader: "custom",
					loaderFile: "./lib/images/cloudflare-loader.js",
			  }
			: {}),
	},

	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"date-fns",
			"@radix-ui/react-icons",
		],
	},

	// Only apply production optimizations in production mode
	// Running these in development causes webpack module factory corruption
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
		reactRemoveProperties: process.env.NODE_ENV === "production",
	},

	modularizeImports: {
		"lucide-react": { transform: "lucide-react/dist/esm/icons/{{member}}" },
		"date-fns": { transform: "date-fns/{{member}}" },
	},

	// Simplified webpack configuration
	webpack: (config, { isServer }) => {
		// Basic path aliases
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@": path.resolve(__dirname),
			external: path.resolve(__dirname, "external"),
			"@external/dynamic-hero": path.resolve(
				__dirname,
				"external/dynamic-hero/src/index.ts",
			),
			"@external/dynamic-hero/": path.resolve(
				__dirname,
				"external/dynamic-hero/src",
			),
		};

		return config;
	},
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
