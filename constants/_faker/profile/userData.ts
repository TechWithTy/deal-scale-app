import { APP_TESTING_MODE } from "@/constants/data";
import { faker } from "@faker-js/faker";

// Define the type for each billing history item
export type BillingHistoryItem = {
	invoice: string;
	amount: string;
	date: Date;
	status: "Paid" | "Unpaid"; // The status can only be "Paid" or "Unpaid"
};

// Define the type for payment details
export type PaymentDetails = {
	cardType: string;
	cardLastFour: string;
	expiry: string;
};

// Mock Data Generation Using Faker.js
const billingHistory: BillingHistoryItem[] = Array.from(
	{ length: 5 },
	(): BillingHistoryItem => ({
		invoice: faker.commerce.productName(), // Random product name for invoice
		amount: `USD $${faker.commerce.price({ min: 10, max: 500, dec: 2 })}`, // Random price between $10 and $500
		date: faker.date.past(), // Future date in the format (e.g., Sep 09, 2024)
		status: faker.helpers.arrayElement(["Paid", "Unpaid"]), // Randomly select "Paid" or "Unpaid"
	}),
);

const paymentDetails: PaymentDetails = {
	cardType: faker.finance.creditCardIssuer(), // Random credit card type (e.g., Visa, MasterCard)
	cardLastFour: faker.finance.creditCardNumber("####").slice(-4), // Last 4 digits of a credit card number
	expiry: faker.date
		.future({ years: 5 }) // Generate a future expiry date within 5 years
		.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }), // Format as MM/YYYY (e.g., 08/2028)
};

// Export the mocks if APP_TESTING_MODE is true
export const mockBillingHistory: BillingHistoryItem[] =
	APP_TESTING_MODE && billingHistory;
export const mockPaymentDetails: PaymentDetails =
	APP_TESTING_MODE && paymentDetails;
