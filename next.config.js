const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: { ignoreDuringBuilds: true },
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
	// Add webpack configuration to prevent hashing errors
	webpack: (config, { isServer }) => {
		// Explicitly disable Webpack's wasm hashing to avoid WasmHash crashes
		process.env.WEBPACK_USE_WASM_HASH = "0";

		// Ensure config objects exist
		config.resolve = config.resolve || {};
		config.output = config.output || {};
		config.optimization = config.optimization || {};

		// Set up aliases
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@root": path.resolve(__dirname),
			"@": path.resolve(__dirname),
			"@/external": path.resolve(__dirname, "external"),
			"@/external/shadcn-table": path.resolve(
				__dirname,
				"external/shadcn-table",
			),
			"@/external/activity-graph": path.resolve(
				__dirname,
				"external/activity-graph",
			),
			"@/external/kanban": path.resolve(__dirname, "external/kanban"),
			"@/external/ai-summary-expandable": path.resolve(
				__dirname,
				"external/ai-summary-expandable",
			),
		};

		// Force a stable hash function to avoid WasmHash crashes
		config.output.hashFunction = "xxhash64";

		// Disable realContentHash which can trigger wasm hashing
		config.optimization.realContentHash = false;

		// Handle undefined values that might cause hashing issues
		if (!config.output.hashDigest) {
			config.output.hashDigest = "hex";
		}

		if (!config.output.hashDigestLength) {
			config.output.hashDigestLength = 20;
		}

		return config;
	},
};

module.exports = nextConfig;
