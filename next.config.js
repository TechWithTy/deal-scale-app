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
// Only require next-pwa in production; allow disabling via env var.
// If transitive deps are missing, gracefully disable PWA instead of failing the build.
const isProd = process.env.NODE_ENV === "production";
const disablePwa = process.env.NEXT_DISABLE_PWA === "1";
let withPWA = (config) => config;
if (isProd && !disablePwa) {
  try {
    const nextPwa = require("next-pwa");
    const enhancerFactory = nextPwa({
      dest: "public",
      disable: false,
      register: true,
      skipWaiting: true,
      swSrc: "./public/sw-custom.js",
      buildExcludes: [/middleware-manifest\.json$/],
      fallbacks: { document: offlineFallback },
    });
    // Wrap the enhancer invocation to catch any late requires inside next-pwa
    withPWA = (config) => {
      try {
        return enhancerFactory(config);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[next-pwa] disabled at enhance: ${
            err && (err.message || err)
          }. Proceeding without PWA.`,
        );
        return config;
      }
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[next-pwa] disabled at require: ${
        err && (err.message || err)
      }. Proceeding without PWA. Install transitive deps if needed.`,
    );
    withPWA = (config) => config;
  }
}

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

    // If '@auth/core' cannot be resolved in this environment, alias to shims
    try {
      require.resolve("@auth/core");
      require.resolve("@auth/core/errors");
    } catch (_) {
      config.resolve.alias["@auth/core"] = path.resolve(
        __dirname,
        "shims/auth-core-shim.ts",
      );
      config.resolve.alias["@auth/core/errors"] = path.resolve(
        __dirname,
        "shims/auth-core-errors-shim.ts",
      );
    }

    // Allow builds to proceed without next-auth by aliasing to shims
    if (process.env.NEXT_DISABLE_AUTH === "1") {
      config.resolve.alias["next-auth"] = path.resolve(
        __dirname,
        "shims/next-auth-shim.ts",
      );
      config.resolve.alias["next-auth/react"] = path.resolve(
        __dirname,
        "shims/next-auth-react-shim.tsx",
      );
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
