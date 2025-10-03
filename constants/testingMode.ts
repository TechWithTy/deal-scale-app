export type AppTestingMode = "dev" | "alpha" | "beta" | "release" | "off";

const truthyModes = new Set(["true", "1", "yes", "on", "dev"]);
const alphaModes = new Set(["alpha", "preview"]);

export function resolveAppTestingMode(value: string | null | undefined): AppTestingMode {
        const normalized = String(value ?? "")
                .trim()
                .toLowerCase();

        if (!normalized) {
                return "off";
        }

        if (alphaModes.has(normalized)) {
                return "alpha";
        }

        if (truthyModes.has(normalized)) {
                return "dev";
        }

        if (normalized === "off" || normalized === "false" || normalized === "0") {
                return "off";
        }

        return "off";
}

export const APP_TESTING_MODE = resolveAppTestingMode(
        process.env.NEXT_PUBLIC_APP_TESTING_MODE,
);

export const NEXT_PUBLIC_APP_TESTING_MODE = APP_TESTING_MODE !== "off";

export const IS_DEV_TEST_MODE = APP_TESTING_MODE === "dev";

export const IS_ALPHA_TEST_MODE = APP_TESTING_MODE === "alpha";
