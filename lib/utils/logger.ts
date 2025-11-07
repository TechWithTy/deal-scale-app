/**
 * Development Logger Utility
 *
 * @description Provides conditional logging that only runs in development
 * @description Integrates with PostHog for production event tracking
 */

const isDevelopment = process.env.NODE_ENV === "development";

interface LogContext {
	[key: string]: unknown;
}

/**
 * Development-only debug logger
 */
export const devLog = (message: string, context?: LogContext): void => {
	if (isDevelopment) {
		console.log(`[Dev] ${message}`, context || "");
	}
};

/**
 * Development-only warning logger
 */
export const devWarn = (message: string, context?: LogContext): void => {
	if (isDevelopment) {
		console.warn(`[Dev Warning] ${message}`, context || "");
	}
};

/**
 * Error logger - always logs but with structured format
 */
export const logError = (
	message: string,
	error?: unknown,
	context?: LogContext,
): void => {
	const errorData = {
		message,
		error:
			error instanceof Error
				? {
						name: error.name,
						message: error.message,
						stack: isDevelopment ? error.stack : undefined,
					}
				: error,
		context,
		timestamp: new Date().toISOString(),
	};

	console.error("[Error]", errorData);

	// TODO: Send to error tracking service in production
	// if (!isDevelopment && window.posthog) {
	//   window.posthog.capture('error', errorData);
	// }
};

/**
 * Track user event (development logging + PostHog in production)
 */
export const trackEvent = (
	eventName: string,
	properties?: LogContext,
): void => {
	if (isDevelopment) {
		console.log(`[Event] ${eventName}`, properties || "");
	}

	// TODO: PostHog tracking in production
	// if (typeof window !== 'undefined' && window.posthog) {
	//   window.posthog.capture(eventName, properties);
	// }
};

export default {
	devLog,
	devWarn,
	logError,
	trackEvent,
};
