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
			// Add more gmp-* elements here as needed
		}
	}
}
