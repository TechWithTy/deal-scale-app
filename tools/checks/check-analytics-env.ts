import dotenv from "dotenv";

const loadEnvConfig = (): void => {
	dotenv.config();
};

interface FieldDescriptor {
	privateName: string;
	fallbackName: string;
	label: string;
}

const fields: FieldDescriptor[] = [
	{
		privateName: "CLARITY_PROJECT_ID",
		fallbackName: "NEXT_PUBLIC_CLARITY_PROJECT_ID",
		label: "Microsoft Clarity project ID",
	},
	{
		privateName: "GOOGLE_ANALYTICS_ID",
		fallbackName: "NEXT_PUBLIC_GOOGLE_ANALYTICS",
		label: "Google Analytics measurement ID",
	},
	{
		privateName: "GOOGLE_TAG_MANAGER_ID",
		fallbackName: "NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID",
		label: "Google Tag Manager container ID",
	},
	{
		privateName: "ZOHO_SALES_IQ_WIDGET_CODE",
		fallbackName: "NEXT_PUBLIC_ZOHOSALESIQ_WIDGETCODE",
		label: "Zoho SalesIQ widget code",
	},
];

export interface AnalyticsEnvReport {
	missing: string[];
	fallbackWarnings: string[];
}

export const evaluateAnalyticsEnv = (
	env: NodeJS.ProcessEnv,
): AnalyticsEnvReport => {
	const missing: string[] = [];
	const fallbackWarnings: string[] = [];

	for (const field of fields) {
		const privateValue = env[field.privateName];
		const fallbackValue = env[field.fallbackName];

		if (!privateValue && !fallbackValue) {
			missing.push(
				`• ${field.label} is missing. Add ${field.privateName} to your environment and restart the dev server.`,
			);
			continue;
		}

		if (!privateValue && fallbackValue) {
			fallbackWarnings.push(
				`• Using ${field.fallbackName} fallback for ${field.label}. Prefer configuring ${field.privateName}.`,
			);
		}
	}

	return { missing, fallbackWarnings };
};

const reportAnalyticsEnv = ({
	missing,
	fallbackWarnings,
}: AnalyticsEnvReport): void => {
	const allowMissingAnalytics =
		process.env.ALLOW_MISSING_ANALYTICS === "1" ||
		process.env.SKIP_ANALYTICS_ENV_CHECK === "1" ||
		process.env.NODE_ENV !== "production";

	if (fallbackWarnings.length > 0) {
		console.warn(
			`[analytics-env] Development fallbacks in use:\n${fallbackWarnings.join("\n")}`,
		);
	}

	if (missing.length > 0) {
		if (allowMissingAnalytics) {
			console.warn(
				`[analytics-env] Missing analytics configuration (suppressed in dev):\n${missing.join("\n")}`,
			);
			console.warn(
				"Set ALLOW_MISSING_ANALYTICS=0 to enforce analytics env vars, or configure the values above.\n",
			);
		} else {
			console.error(
				`[analytics-env] Missing analytics configuration:\n${missing.join("\n")}`,
			);
			console.error(
				"Analytics providers will not load until these values are provided and the server is restarted.\n",
			);
		}
	} else {
		console.log("[analytics-env] Analytics environment variables detected.");
	}
};

export const runAnalyticsEnvCheck = (): AnalyticsEnvReport => {
	loadEnvConfig();

	const report = evaluateAnalyticsEnv(process.env);
	reportAnalyticsEnv(report);
	return report;
};

const executedDirectly = (() => {
	const entryFile = process.argv[1];

	if (!entryFile) {
		return false;
	}

	return /check-analytics-env\.(ts|js|mjs|cjs)$/.test(entryFile);
})();

if (executedDirectly && process.env.JEST_WORKER_ID === undefined) {
	runAnalyticsEnvCheck();
}
