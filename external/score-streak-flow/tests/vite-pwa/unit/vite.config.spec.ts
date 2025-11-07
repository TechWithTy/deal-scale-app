import type { PluginOption } from "vite";
import { describe, expect, it } from "vitest";
import config from "../../../vite.config";

const extractPluginNames = (plugins: PluginOption | PluginOption[] | undefined) => {
	if (!plugins) {
		return [];
	}

	const flatten = (input: PluginOption | PluginOption[]): PluginOption[] => {
		if (Array.isArray(input)) {
			return input.flatMap((entry) => flatten(entry));
		}

		return [input];
	};

	return flatten(plugins)
		.map((plugin) => {
			if (!plugin) {
				return null;
			}

			if (typeof plugin === "function") {
				return null;
			}

			return "name" in plugin ? plugin.name : null;
		})
		.filter((name): name is string => Boolean(name));
};

describe("vite.config.ts", () => {
	it("registers the Vite PWA plugin", async () => {
		const resolved = await config({ command: "build", mode: "production" });

		const pluginNames = extractPluginNames(resolved.plugins);

		expect(pluginNames).toContain("vite-plugin-pwa");
	});
});

