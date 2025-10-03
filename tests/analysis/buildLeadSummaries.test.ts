import { describe, expect, it } from "vitest";

import { buildLeadSummaries } from "@/lib/analysis/buildLeadSummaries";
import {
        createRealtorProperty,
        createRentCastProperty,
        type Property,
} from "@/types/_dashboard/property";

describe("buildLeadSummaries", () => {
        const referenceDate = new Date("2025-08-26T00:00:00.000Z");

        const buildSampleProperties = (): Property[] => {
                const realtorA = createRealtorProperty({
                        id: "realtor-a",
                        address: {
                                street: "123 Main St",
                                unit: null,
                                city: "Greenville",
                                state: "SC",
                                zipCode: "29611",
                                fullStreetLine: "123 Main St",
                                latitude: 34.85,
                                longitude: -82.41,
                        },
                        details: {
                                beds: 3,
                                fullBaths: 2,
                                halfBaths: null,
                                sqft: 1600,
                                yearBuilt: 1995,
                                lotSqft: 5000,
                                propertyType: "Single Family",
                                stories: 2,
                                style: "Traditional",
                                construction: "Brick",
                                roof: "Shingle",
                                parking: "Garage",
                        },
                        metadata: {
                                source: "realtor",
                                lastUpdated: "2025-08-20T00:00:00.000Z",
                                listPrice: 300000,
                                pricePerSqft: 187.5,
                                status: "Active",
                                mlsId: "MLS123",
                                mls: "GGAR",
                                listDate: "2025-07-15T00:00:00.000Z",
                                lastSoldDate: "2022-07-01T00:00:00.000Z",
                                daysOnMarket: 60,
                                hoaFee: 0,
                                parkingGarage: 2,
                                nearbySchools: "Greenville County",
                                neighborhoods: "West Greenville",
                                agent: {
                                        name: "Jamie Agent",
                                        email: "jamie@example.com",
                                        phones: [
                                                {
                                                        number: "8645551111",
                                                        primary: true,
                                                        type: "Office",
                                                        ext: null,
                                                },
                                        ],
                                        broker: "DealScale Realty",
                                },
                        },
                        media: {
                                images: [],
                                virtualTours: [],
                        },
                        description: "Test property",
                });

                const realtorB = createRealtorProperty({
                        id: "realtor-b",
                        address: {
                                street: "456 Oak Ave",
                                unit: null,
                                city: "Greenville",
                                state: "SC",
                                zipCode: "29611",
                                fullStreetLine: "456 Oak Ave",
                                latitude: 34.84,
                                longitude: -82.43,
                        },
                        details: {
                                beds: 4,
                                fullBaths: 3,
                                halfBaths: 1,
                                sqft: 2400,
                                yearBuilt: 2010,
                                lotSqft: 7000,
                                propertyType: "Multi-Family",
                                stories: 3,
                                style: "Modern",
                                construction: "Frame",
                                roof: "Metal",
                                parking: "Driveway",
                        },
                        metadata: {
                                source: "realtor",
                                lastUpdated: "2025-08-10T00:00:00.000Z",
                                listPrice: 480000,
                                pricePerSqft: 200,
                                status: "Active",
                                mlsId: "MLS456",
                                mls: "GGAR",
                                listDate: "2025-07-01T00:00:00.000Z",
                                lastSoldDate: "2021-05-01T00:00:00.000Z",
                                daysOnMarket: 35,
                                hoaFee: 0,
                                parkingGarage: 0,
                                nearbySchools: "Greenville County",
                                neighborhoods: "West Greenville",
                                agent: {
                                        name: "Taylor Agent",
                                        email: "taylor@example.com",
                                        phones: [
                                                {
                                                        number: "8645552222",
                                                        primary: true,
                                                        type: "Mobile",
                                                        ext: null,
                                                },
                                        ],
                                        broker: "DealScale Realty",
                                },
                        },
                        media: {
                                images: [],
                                virtualTours: [],
                        },
                        description: "Second property",
                });

                const rentcastA = createRentCastProperty({
                        id: "rentcast-a",
                        address: {
                                street: "789 Pine Rd",
                                unit: null,
                                city: "Greenville",
                                state: "SC",
                                zipCode: "29611",
                                fullStreetLine: "789 Pine Rd",
                                latitude: 34.83,
                                longitude: -82.42,
                        },
                        details: {
                                beds: 3,
                                fullBaths: 2,
                                halfBaths: null,
                                sqft: 1500,
                                yearBuilt: 2005,
                                lotSqft: 4500,
                                propertyType: "Townhouse",
                                stories: 2,
                                style: "Contemporary",
                                construction: "Frame",
                                roof: "Composite",
                                parking: "Garage",
                        },
                        metadata: {
                                source: "rentcast",
                                lastUpdated: "2025-08-05T00:00:00.000Z",
                                lastSaleDate: "2023-06-15T00:00:00.000Z",
                                lastSalePrice: 320000,
                        },
                        listing: {
                                id: "rent-1",
                                formattedAddress: "789 Pine Rd",
                                addressLine1: "789 Pine Rd",
                                addressLine2: null,
                                city: "Greenville",
                                state: "SC",
                                zipCode: "29611",
                                county: "Greenville",
                                latitude: 34.83,
                                longitude: -82.42,
                                propertyType: "Townhouse",
                                status: "Active",
                                price: 1600,
                                listingType: "Standard",
                                listedDate: "2025-07-20T00:00:00.000Z",
                                removedDate: null,
                                daysOnMarket: 12,
                        },
                });

                const rentcastB = createRentCastProperty({
                        id: "rentcast-b",
                        address: {
                                street: "321 Birch Ln",
                                unit: null,
                                city: "Greenville",
                                state: "SC",
                                zipCode: "29611",
                                fullStreetLine: "321 Birch Ln",
                                latitude: 34.82,
                                longitude: -82.45,
                        },
                        details: {
                                beds: 4,
                                fullBaths: 3,
                                halfBaths: 1,
                                sqft: 2100,
                                yearBuilt: 2015,
                                lotSqft: 6500,
                                propertyType: "Single Family",
                                stories: 2,
                                style: "Craftsman",
                                construction: "Brick",
                                roof: "Shingle",
                                parking: "Garage",
                        },
                        metadata: {
                                source: "rentcast",
                                lastUpdated: "2025-07-01T00:00:00.000Z",
                                lastSaleDate: "2022-04-01T00:00:00.000Z",
                                lastSalePrice: 260000,
                        },
                        listing: {
                                id: "rent-2",
                                formattedAddress: "321 Birch Ln",
                                addressLine1: "321 Birch Ln",
                                addressLine2: null,
                                city: "Greenville",
                                state: "SC",
                                zipCode: "29611",
                                county: "Greenville",
                                latitude: 34.82,
                                longitude: -82.45,
                                propertyType: "Single Family",
                                status: "Active",
                                price: 1500,
                                listingType: "Standard",
                                listedDate: "2025-06-10T00:00:00.000Z",
                                removedDate: null,
                                daysOnMarket: 20,
                        },
                });

                return [realtorA, realtorB, rentcastA, rentcastB];
        };

        it("derives blended metrics for investors, wholesalers, and buyers", () => {
                const result = buildLeadSummaries(buildSampleProperties(), "29611", {
                        now: referenceDate,
                });

                expect(result.metrics.price.median).toBe(310000);
                expect(result.metrics.price.min).toBe(260000);
                expect(result.metrics.price.max).toBe(480000);
                expect(result.metrics.dom.median).toBe(28);
                expect(result.metrics.inventory.newListings).toBe(3);
                expect(result.metrics.rent.yieldPct).toBeCloseTo(6, 1);
                expect(result.metrics.propertyTypes.topForInvestors?.type).toBe(
                        "Single Family",
                );
                expect(result.metrics.propertyTypes.fastest?.type).toBe("Townhouse");
                expect(result.metrics.spreadPct).toBeCloseTo(16.13, 2);
                expect(result.investor.copy).toContain("Investor Sentiment for 29611");
                expect(result.wholesaler.section.cards.length).toBeGreaterThan(0);
                expect(result.buyer.section.overallScore).toBeGreaterThan(0);
        });

        it("provides safe fallbacks when data is missing", () => {
                const result = buildLeadSummaries([], "Unknown", { now: referenceDate });

                expect(result.metrics.price.median).toBeNull();
                expect(result.metrics.dom.median).toBeNull();
                expect(result.metrics.inventory.totalListings).toBe(0);
                expect(result.investor.section.overallScore).toBe(50);
                expect(result.wholesaler.copy).toContain("Unknown");
        });
});
