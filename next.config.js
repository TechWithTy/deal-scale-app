const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Demo mode: allow build despite type errors in external package
	typescript: { ignoreBuildErrors: true },
	// Ensure external package compiles with the app's dependency graph
	transpilePackages: ["external/shadcn-table"],
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
		config.experiments = config.experiments || {};
		// Disable persistent caching to avoid corrupted cache causing hashing crashes
		config.cache = false;

		// Set up aliases
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@root": path.resolve(__dirname),
			"@ssf": path.resolve(__dirname, "external/score-streak-flow/src"),
			// Keep app-local aliases only; avoid forcing React singletons to prevent RSC context issues
		};

		// Force a Node built-in hash function (avoid wasm-based hashers on Windows)
		config.output.hashFunction = "sha256";

		// Disable realContentHash which can trigger wasm hashing
		config.optimization.realContentHash = false;

		// Handle undefined values that might cause hashing issues
		if (!config.output.hashDigest) {
			config.output.hashDigest = "hex";
		}

		if (!config.output.hashDigestLength) {
			config.output.hashDigestLength = 20;
		}

		// Explicitly turn off WebAssembly experiments to reduce wasm code paths
		config.experiments.asyncWebAssembly = false;
		config.experiments.syncWebAssembly = false;

		return config;
	},
};

module.exports = nextConfig;
