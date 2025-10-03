const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const purgecss = require("@fullhuman/postcss-purgecss");

const purgeCssContentGlobs = [
	"./app/**/*.{js,ts,jsx,tsx,mdx}",
	"./components/**/*.{js,ts,jsx,tsx,mdx}",
	"./lib/**/*.{js,ts,jsx,tsx}",
	"./utils/**/*.{js,ts,jsx,tsx}",
	"./src/**/*.{js,ts,jsx,tsx}",
	"./public/**/*.html",
];

const createPurgeCssPlugin = () =>
	purgecss({
		content: purgeCssContentGlobs,
		safelist: ["html", "body", "dark", /\bdata-theme$/],
		defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) ?? [],
	});

const createPostCssConfig = () => {
	const plugins = [tailwindcss];

	if (process.env.NODE_ENV === "production") {
		plugins.push(createPurgeCssPlugin());
	}

	plugins.push(autoprefixer);

	return { plugins };
};

module.exports = createPostCssConfig;
module.exports.createPurgeCssPlugin = createPurgeCssPlugin;
module.exports.purgeCssContentGlobs = purgeCssContentGlobs;
