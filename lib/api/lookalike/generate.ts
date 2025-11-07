import type { LookalikeCandidate, LookalikeConfig } from "@/types/lookalike";

// Mock lead data for generating lookalike candidates
const MOCK_FIRST_NAMES = [
	"John",
	"Sarah",
	"Michael",
	"Jennifer",
	"David",
	"Emily",
	"Robert",
	"Lisa",
	"James",
	"Maria",
];
const MOCK_LAST_NAMES = [
	"Smith",
	"Johnson",
	"Williams",
	"Brown",
	"Jones",
	"Garcia",
	"Miller",
	"Davis",
	"Rodriguez",
	"Martinez",
];
const MOCK_CITIES = [
	"Denver",
	"Phoenix",
	"Austin",
	"Portland",
	"Seattle",
	"Nashville",
	"Charlotte",
	"Atlanta",
	"Miami",
	"Tampa",
];
const MOCK_STATES = ["CO", "AZ", "TX", "OR", "WA", "TN", "NC", "GA", "FL"];
const MOCK_PROPERTY_TYPES = [
	"single-family",
	"multi-family",
	"condo",
	"land",
] as const;

/**
 * Mock function to generate lookalike audience candidates
 * In production, this would:
 * 1. Get seed lead embeddings from database
 * 2. Run vector similarity search via pgvector
 * 3. Apply filters to candidates
 * 4. Return top N similar leads
 */
export async function generateLookalikeAudience(
	config: LookalikeConfig,
): Promise<LookalikeCandidate[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	const targetSize = config.targetSize || 100;
	const threshold = config.similarityThreshold;

	// Generate mock candidates - generate more than needed to account for filtering
	const candidates: LookalikeCandidate[] = [];
	let attempts = 0;
	const maxAttempts = targetSize * 5; // Generate up to 5x to ensure we get enough after filtering

	while (candidates.length < targetSize && attempts < maxAttempts) {
		attempts++;

		// Generate similarity score between threshold and 100
		const score = Math.random() * (100 - threshold) + threshold;

		const firstName =
			MOCK_FIRST_NAMES[Math.floor(Math.random() * MOCK_FIRST_NAMES.length)];
		const lastName =
			MOCK_LAST_NAMES[Math.floor(Math.random() * MOCK_LAST_NAMES.length)];
		const city = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)];
		const state = MOCK_STATES[Math.floor(Math.random() * MOCK_STATES.length)];
		const propertyType =
			MOCK_PROPERTY_TYPES[
				Math.floor(Math.random() * MOCK_PROPERTY_TYPES.length)
			];

		// Generate contact info based on requirements
		const needsPhone = config.generalOptions.requirePhone;
		const needsEmail = config.generalOptions.requireEmail;
		const phoneNumber =
			needsPhone || Math.random() > 0.3
				? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
				: undefined;
		const email =
			needsEmail || Math.random() > 0.4
				? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
				: undefined;

		const candidate: LookalikeCandidate = {
			id: `candidate_${Date.now()}_${attempts}`,
			leadId: `lead_${Date.now()}_${attempts}`,
			firstName,
			lastName,
			address: `${Math.floor(Math.random() * 9999)} ${["Main", "Oak", "Maple", "Pine", "Cedar"][Math.floor(Math.random() * 5)]} St`,
			city,
			state,
			zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
			propertyType,
			similarityScore: Math.round(score * 10) / 10,
			estimatedValue: Math.floor(Math.random() * 500000) + 150000,
			equity: Math.floor(Math.random() * 300000) + 50000,
			ownershipDuration: `${Math.floor(Math.random() * 15) + 1} years`,
			phoneNumber,
			email,
		};

		// Apply property type filter if specified
		if (
			config.propertyFilters.propertyTypes &&
			config.propertyFilters.propertyTypes.length > 0
		) {
			if (
				!config.propertyFilters.propertyTypes.includes(candidate.propertyType)
			) {
				continue;
			}
		}

		// Apply price range filter if specified
		if (config.propertyFilters.priceRange) {
			const { min, max } = config.propertyFilters.priceRange;
			if (candidate.estimatedValue) {
				if (min && candidate.estimatedValue < min) continue;
				if (max && candidate.estimatedValue > max) continue;
			}
		}

		// Apply state filter if specified
		if (config.geoFilters.states && config.geoFilters.states.length > 0) {
			if (!config.geoFilters.states.includes(candidate.state)) {
				continue;
			}
		}

		// Apply general options (now guaranteed to pass since we generated contact info accordingly)
		if (config.generalOptions.requirePhone && !candidate.phoneNumber) {
			continue;
		}

		if (config.generalOptions.requireEmail && !candidate.email) {
			continue;
		}

		candidates.push(candidate);
	}

	// Sort by similarity score descending
	candidates.sort((a, b) => b.similarityScore - a.similarityScore);

	console.log(
		`[API] Generated ${candidates.length} candidates from ${attempts} attempts`,
	);

	return candidates;
}

/**
 * Mock function to estimate audience size based on config
 * Returns a quick estimate without full generation
 */
export async function estimateAudienceSize(
	config: LookalikeConfig,
): Promise<number> {
	// Simulate quick API call
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Base size from seed list (typically generates 10-50x the seed size)
	const baseMultiplier = 25;
	let estimate = config.seedLeadCount * baseMultiplier;

	// Apply filter reductions
	if (
		config.propertyFilters.propertyTypes &&
		config.propertyFilters.propertyTypes.length > 0
	) {
		estimate *= 0.6; // Reduce by 40%
	}

	if (
		config.geoFilters.states &&
		config.geoFilters.states.length > 0 &&
		config.geoFilters.states.length < 10
	) {
		estimate *= 0.5; // Reduce by 50% for limited geo
	}

	if (
		config.generalOptions.requirePhone &&
		config.generalOptions.requireEmail
	) {
		estimate *= 0.3; // Significant reduction for both required
	} else if (
		config.generalOptions.requirePhone ||
		config.generalOptions.requireEmail
	) {
		estimate *= 0.7;
	}

	if (config.salesTargeting.cashBuyerOnly) {
		estimate *= 0.4;
	}

	// Apply similarity threshold impact
	const thresholdFactor = (100 - config.similarityThreshold) / 40; // Higher threshold = fewer results
	estimate *= thresholdFactor;

	return Math.max(Math.floor(estimate), 10);
}
