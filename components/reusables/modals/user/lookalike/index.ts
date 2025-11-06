/**
 * Lookalike Audience Configuration Module
 * Exports main modal and related components
 * @module lookalike
 */

export { LookalikeConfigModal } from "./LookalikeConfigModal";
export { LookalikeResultsModal } from "./LookalikeResultsModal";
export { SimilaritySettings } from "./components/SimilaritySettings";
export { SalesTargeting } from "./components/SalesTargeting";
export { PropertyFilters } from "./components/PropertyFilters";
export { GeographicFilters } from "./components/GeographicFilters";
export { GeneralOptions } from "./components/GeneralOptions";
export { CostSummary } from "./components/CostSummary";
export { buildLookalikeConfig } from "./utils/configBuilder";
export { exportCandidatesToCsv, exportWithMetadata } from "./utils/exportToCsv";
export {
	generateLookalikeListName,
	extractVersionFromName,
	getNextVersion,
	isValidLookalikeListName,
	getSeedListName,
	incrementVersion,
	formatVersionNumber,
} from "./utils/versionHelper";
export type { FormValues } from "./types";
export { lookalikeConfigSchema } from "./types";
