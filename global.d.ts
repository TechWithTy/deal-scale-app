import type { PrismaClient } from "@prisma/client";
import type React from "react";

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient;
		}
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
			register: (items: any[]) => void; // using any[] here to avoid circular import, runtime-only surface
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
	}
}

// Fallback types for external libs without bundled type declarations
declare module "react-wheel-of-prizes";
