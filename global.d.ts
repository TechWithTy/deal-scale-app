import type { PrismaClient } from "@prisma/client";
import type React from "react";

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient;
		}
	}

	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{
			outcome: "accepted" | "dismissed";
			platform: string;
		}>;
		prompt: () => Promise<void>;
	}

	// Allow Google Maps Places UI Kit web components in TSX
	namespace JSX {
		interface IntrinsicElements {
			"gmp-place-search": React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			>;
			"gmp-place-nearby-search-request": React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			> & {
				// properties used in our code
				maxResultCount?: number;
				locationRestriction?: {
					center: google.maps.LatLngLiteral;
					radius: number;
				};
				includedTypes?: string[];
			};
			// Deal Action Bar web component
			"deal-action-bar": React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			> & {
				"ai-suggest-endpoint"?: string;
				variant?: "dialog" | "floating";
				keyboard?: boolean | "true" | "false" | "0" | "1";
				"initial-query"?: string;
				"pom-flow-url"?: string;
				"open-on-select"?: boolean | "true" | "false" | "0" | "1";
				"select-container"?: string;
				token?: string;
			};
			// Add more gmp-* elements here as needed
		}
	}

	interface Window {
		DealActionBar?: {
			open: () => void;
			close: () => void;
			toggle: () => void;
			register: (items: unknown[]) => void; // using unknown[] to avoid circular import while staying type-safe
			setVariant: (v: "dialog" | "floating") => void;
			setInitialQuery: (q: string) => void;
			setEndpoint: (ep: string) => void;
			setKeyboard: (enabled: boolean) => void;
			setOpenOnSelect?: (enabled: boolean) => void;
			setSelectContainer?: (selector?: string) => void;
			// Optional bearer token forwarded to the AI suggest proxy
			token?: string;
			define?: (tag?: string) => void;
			init?: (
				attrs?: Record<string, string | number | boolean>,
				mountTo?: HTMLElement,
			) => HTMLElement;
			element?: HTMLElement;
		};
		// Optional analytics SDKs injected at runtime
		posthog?: {
			capture: (event: string, properties?: Record<string, unknown>) => void;
			identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
			group?: (groupType: string, groupKey: string) => void;
		};
		clarity?: (
			type: "event",
			name: string,
			properties?: Record<string, unknown>,
		) => void;
		// Supademo SDK - global function injected by script tag
		Supademo?: (
			apiKey: string,
			options?: {
				variables?: Record<string, string>;
			},
		) => void;
	}
}

// Fallback types for external libs without bundled type declarations
declare module "react-wheel-of-prizes";
