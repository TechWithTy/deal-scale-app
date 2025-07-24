export interface UserProfileSubscription {
	id: string;
	name: string; // Plan name, e.g., "Basic", "Enterprise"
	type: "monthly" | "yearly";
	status: "active" | "inactive";
	price: string; // Subscription price
	aiCredits: {
		allotted: number; // Total AI credits allotted
		used: number; // AI credits used
		resetInDays: number; // Countdown for next credit reset in days
	};
	leads: {
		allotted: number; // Total leads allotted
		used: number; // Leads used
		resetInDays: number; // Countdown for next lead reset in days
	};
	skipTraces: {
		allotted: number; // Total skip traces allotted
		used: number; // Skip traces used
		resetInDays: number; // Countdown for next skip trace reset in days
	};
	renewalDate: string; // Date of renewal
	createdAt: string; // Date of creation
	planDetails: string; // Extra details about the plan
}

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
