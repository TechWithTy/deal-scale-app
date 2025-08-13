import { faker } from "@faker-js/faker";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../data";

// * Represents the structure of a lead list in the database
export interface LeadList {
	id: string;
	listName: string;
	records: number;
}

// * Lazily generate a large set of mock lead lists only in testing mode
let cachedLeadLists: LeadList[] | null = null;
function getAllLeadLists(): LeadList[] {
	if (!NEXT_PUBLIC_APP_TESTING_MODE) return [];
	if (cachedLeadLists) return cachedLeadLists;
	cachedLeadLists = Array.from({ length: 100 }, () => ({
		id: faker.string.uuid(),
		listName: `${faker.company.name()} - ${faker.company.catchPhrase()}`,
		records: faker.number.int({ min: 50, max: 10000 }),
	}));
	return cachedLeadLists;
}

// * Simulates fetching paginated lead lists from an API
export const fetchFakeLeadLists = async (
	page: number,
	limit = 10,
): Promise<{ items: LeadList[]; hasMore: boolean }> => {
	console.log(`Fetching page ${page} with limit ${limit}`);

	// * Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// If testing mode is off, return empty results
	if (!NEXT_PUBLIC_APP_TESTING_MODE) {
		return { items: [], hasMore: false };
	}

	const source = getAllLeadLists();
	const offset = page * limit;
	const items = source.slice(offset, offset + limit);
	const hasMore = offset + limit < source.length;

	return { items, hasMore };
};
