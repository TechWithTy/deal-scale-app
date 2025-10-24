const path = require("node:path");
const { buildCacheControl } = require("./utils/http/cacheControl.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Essential configurations
	transpilePackages: ["shadcn-table"],
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	async headers() {
		const securityHeaders = [
			{
				key: "Content-Security-Policy",
				value:
					"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; connect-src 'self' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; frame-src 'self' https://app.supademo.com https://www.youtube.com; frame-ancestors 'self'; form-action 'self'; base-uri 'self';",
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

	// Image domains for external images
	images: {
		domains: [
			"utfs.io",
			"www.realtor.com",
			"unsplash.com",
			"pixabay.com",
			"ap.rdcpix.com",
			"loremflickr.com",
			"picsum.photos",
			"avatars.githubusercontent.com",
			"placehold.co",
			"i.pravatar.cc",
		],
	},

	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"date-fns",
			"@radix-ui/react-icons",
		],
	},

	compiler: {
		removeConsole: true,
		reactRemoveProperties: true,
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
		};

		return config;
	},
};

module.exports = nextConfig;
