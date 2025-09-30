const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Essential configurations
	transpilePackages: ["shadcn-table"],
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },

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

	// Simplified webpack configuration
	webpack: (config, { isServer }) => {
		// Basic path aliases
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@": path.resolve(__dirname),
			"external": path.resolve(__dirname, "external"),
		};

		return config;
	},
};

module.exports = nextConfig;
