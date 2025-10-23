import { primaryQuickStartCards } from "./cards-primary";
import { secondaryQuickStartCards } from "./cards-secondary";
import type { QuickStartCardDescriptor } from "./types";

export const quickStartCardDescriptors: readonly QuickStartCardDescriptor[] = [
	...primaryQuickStartCards,
	...secondaryQuickStartCards,
];
