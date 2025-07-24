import { APP_TESTING_MODE } from "@/constants/data";
import type {
	LeadTypeGlobal,
	LeadStatus,
	LeadSource,
	CommunicationPreference,
} from "@/types/_dashboard/leads";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import {
	leadSources,
	leadStatus,
	leadCommunicationMethods,
} from "@/constants/dashboard/leads";

export function generateMockLeads(count: number): LeadTypeGlobal[] {
	const statuses: LeadStatus[] = leadStatus;

	const sources: LeadSource[] = leadSources;

	const communicationMethods: CommunicationPreference[] =
		leadCommunicationMethods;

	return Array.from({ length: count }, (_, i) => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const now = new Date().toISOString();
		const status = faker.helpers.arrayElement(statuses);

		return {
			id: uuid(),
			createdAt: faker.date.past().toISOString(),
			updatedAt: faker.date.recent().toISOString(),
			firstName,
			lastName,
			email: faker.internet.email({ firstName, lastName }),
			phone: faker.phone.number(),
			alternatePhone: faker.helpers.maybe(() => faker.phone.number(), {
				probability: 0.3,
			}),
			company: faker.company.name(),
			title: faker.person.jobTitle(),
			preferredContactMethod: faker.helpers.arrayElements(
				communicationMethods,
				{ min: 1, max: 3 },
			),
			doNotContact: faker.datatype.boolean(0.1),
			summary: faker.lorem.paragraph(),
			status,
			source: faker.helpers.arrayElement(sources),
			sourceDetails: faker.lorem.sentence(),
			assignedTo: faker.helpers.maybe(
				() => ({
					id: uuid(),
					name: faker.person.fullName(),
					email: faker.internet.email(),
				}),
				{ probability: 0.7 },
			),
			properties: [
				{
					id: uuid(),
					address: {
						street: faker.location.streetAddress(),
						city: faker.location.city(),
						state: faker.location.state({ abbreviated: true }),
						zipCode: faker.location.zipCode(),
						country: "US",
						fullAddress: faker.location.streetAddress(true),
					},
					propertyType: faker.helpers.arrayElement([
						"Single Family",
						"Condo",
						"Townhouse",
						"Multi-Family",
					]),
					yearBuilt: faker.number.int({
						min: 1900,
						max: new Date().getFullYear(),
					}),
					lotSize: faker.number.int({ min: 1000, max: 10000 }),
					livingArea: faker.number.int({ min: 800, max: 5000 }),
					bedrooms: faker.number.int({ min: 1, max: 6 }),
					bathrooms: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
					isOwnerOccupied: faker.datatype.boolean(0.7),
					estimatedValue: faker.number.int({ min: 100000, max: 2000000 }),
					lastSalePrice: faker.number.int({ min: 50000, max: 1500000 }),
					lastSaleDate: faker.date
						.past({ years: 10 })
						.toISOString()
						.split("T")[0],

					estimatedRent: faker.number.int({ min: 1000, max: 10000 }),
					mlsNumber: faker.string.alphanumeric(8).toUpperCase(),
					parcelId: faker.string.alphanumeric(10),
					notes: faker.lorem.sentence(),
				},
			],
			preferredPropertyTypes: faker.helpers.arrayElements(
				["Single Family", "Condo", "Townhouse", "Multi-Family", "Land"],
				{ min: 1, max: 3 },
			),
			preferredLocations: Array.from(
				{ length: faker.number.int({ min: 1, max: 3 }) },
				() =>
					`${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
			),
			budgetRange: {
				min: faker.number.int({ min: 100000, max: 500000 }),
				max: faker.number.int({ min: 500001, max: 2000000 }),
			},
			lastContacted: faker.date.recent({ days: 30 }).toISOString(),

			followUpDate: faker.helpers.maybe(
				() => faker.date.soon({ days: 14 }).toISOString().split("T")[0],
				{ probability: 0.7 },
			),
			activities: Array.from(
				{ length: faker.number.int({ min: 1, max: 5 }) },
				(_, i) => ({
					id: uuid(),
					type: faker.helpers.arrayElement([
						"Call",
						"Email",
						"Meeting",
						"Note",
						"SMS",
						"Task",
						"Other",
					]),
					timestamp: faker.date.recent({ days: 30 }).toISOString(),
					title: faker.lorem.words(5),
					description: faker.lorem.paragraph(),
					user: {
						id: uuid(),
						name: faker.person.fullName(),
						email: faker.internet.email(),
					},
				}),
			),
			notes: faker.lorem.paragraphs(2),
			tags: faker.helpers.arrayElements(
				[
					"Hot Lead",
					"Investor",
					"First-time Buyer",
					"Relocating",
					"Pre-approved",
					"Cash Buyer",
				],
				{ min: 1, max: 4 },
			),
			socialLinks: {
				facebook: faker.internet.url(),
				linkedin: faker.internet.url(),
				instagram: faker.internet.url(),
				twitter: faker.internet.url(),
				zillow: faker.internet.url(),
				redfin: faker.internet.url(),
				realtor: faker.internet.url(),
			},
			metadata: {
				ipAddress: faker.internet.ip(),
				userAgent: faker.internet.userAgent(),
				campaign: {
					name: faker.helpers.maybe(() => faker.company.buzzPhrase(), {
						probability: 0.7,
					}),
					source: faker.helpers.arrayElement([
						"google",
						"facebook",
						"direct",
						"email",
						"referral",
					]),
					medium: faker.helpers.arrayElement([
						"organic",
						"cpc",
						"email",
						"social",
					]),
					term: faker.helpers.maybe(() => faker.lorem.words(2), {
						probability: 0.5,
					}),
					content: faker.helpers.maybe(() => faker.lorem.word(), {
						probability: 0.5,
					}),
					id: faker.helpers.maybe(() => uuid(), { probability: 0.7 }),
				},
				// Legacy fields
				lastUpdate: new Date().toISOString(),
				address1: faker.location.streetAddress(),
			},
		};
	});
}

export const mockGeneratedLeads = APP_TESTING_MODE && generateMockLeads(10);
