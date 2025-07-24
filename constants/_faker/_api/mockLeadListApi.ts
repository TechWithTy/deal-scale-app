import { faker } from "@faker-js/faker";

// * Represents the structure of a lead list in the database
export interface LeadList {
	id: string;
	listName: string;
	records: number;
}

// * Generate a large set of mock lead lists
const allLeadLists: LeadList[] = Array.from({ length: 100 }, (_, i) => ({
	id: faker.string.uuid(),
	listName: `${faker.company.name()} - ${faker.company.catchPhrase()}`,
	records: faker.number.int({ min: 50, max: 10000 }),
}));

// * Simulates fetching paginated lead lists from an API
export const fetchFakeLeadLists = async (
	page: number,
	limit = 10,
): Promise<{ items: LeadList[]; hasMore: boolean }> => {
	console.log(`Fetching page ${page} with limit ${limit}`);

	// * Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const offset = page * limit;
	const items = allLeadLists.slice(offset, offset + limit);
	const hasMore = offset + limit < allLeadLists.length;

	return { items, hasMore };
};
