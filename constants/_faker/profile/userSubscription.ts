import { APP_TESTING_MODE } from "../../data";

export interface UserProfileSubscription {
	id: string;
	stripeSubscriptionID: string;
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

const planDetails = {
	earlyAdopter: {
		name: "Early Adopter",
		price: "1200",
		aiCredits: {
			allotted: 1200,
			used: 200, // Example usage
			resetInDays: 15, // Example reset countdown
		},
		leads: {
			allotted: 200,
			used: 50, // Example usage
			resetInDays: 15, // Example reset countdown for leads
		},
		skipTraces: {
			allotted: 50,
			used: 10, // Example usage
			resetInDays: 15, // Example reset countdown for skip traces
		},
	},
	basic: {
		name: "Basic",
		price: "2400",
		aiCredits: {
			allotted: 2400,
			used: 500, // Example usage
			resetInDays: 30, // Example reset countdown
		},
		leads: {
			allotted: 500,
			used: 200, // Example usage
			resetInDays: 30, // Example reset countdown for leads
		},
		skipTraces: {
			allotted: 100,
			used: 50, // Example usage
			resetInDays: 30, // Example reset countdown for skip traces
		},
	},
	enterprise: {
		name: "Enterprise",
		price: "5000",
		aiCredits: {
			allotted: 5000,
			used: 1000, // Example usage
			resetInDays: 7, // Example reset countdown
		},
		leads: {
			allotted: 1000,
			used: 300, // Example usage
			resetInDays: 7, // Example reset countdown for leads
		},
		skipTraces: {
			allotted: 300,
			used: 100, // Example usage
			resetInDays: 7, // Example reset countdown for skip traces
		},
	},
};

// Function to generate mock subscriptions based on the plan details
const generateMockSubscriptions = (): UserProfileSubscription[] => {
	const subscriptions: UserProfileSubscription[] = [
		{
			id: "1", // Unique identifier for the subscription
			stripeSubscriptionID: "sadasasa",
			name: planDetails.earlyAdopter.name,
			type: "monthly",
			status: "active",
			price: `$${planDetails.earlyAdopter.price}`,
			aiCredits: {
				allotted: planDetails.earlyAdopter.aiCredits.allotted,
				used: planDetails.earlyAdopter.aiCredits.used,
				resetInDays: planDetails.earlyAdopter.aiCredits.resetInDays,
			},
			leads: {
				allotted: planDetails.earlyAdopter.leads.allotted,
				used: planDetails.earlyAdopter.leads.used,
				resetInDays: planDetails.earlyAdopter.leads.resetInDays,
			},
			skipTraces: {
				allotted: planDetails.earlyAdopter.skipTraces.allotted,
				used: planDetails.earlyAdopter.skipTraces.used,
				resetInDays: planDetails.earlyAdopter.skipTraces.resetInDays,
			},
			renewalDate: "Sep 09, 2024", // Example renewal date
			createdAt: "Sep 09, 2023", // Example creation date
			planDetails:
				"This is an early adopter subscription plan offering AI features at a discounted rate.",
		},
		{
			id: "2",
			name: planDetails.basic.name,
			stripeSubscriptionID: "sadasasa",

			type: "yearly",
			status: "inactive",
			price: `$${planDetails.basic.price}`,
			aiCredits: {
				allotted: planDetails.basic.aiCredits.allotted,
				used: planDetails.basic.aiCredits.used,
				resetInDays: planDetails.basic.aiCredits.resetInDays,
			},
			leads: {
				allotted: planDetails.basic.leads.allotted,
				used: planDetails.basic.leads.used,
				resetInDays: planDetails.basic.leads.resetInDays,
			},
			skipTraces: {
				allotted: planDetails.basic.skipTraces.allotted,
				used: planDetails.basic.skipTraces.used,
				resetInDays: planDetails.basic.skipTraces.resetInDays,
			},
			renewalDate: "Aug 12, 2024",
			createdAt: "Aug 12, 2023",
			planDetails:
				"This basic plan includes 2400 AI credits and access to 500 leads and 100 skip traces.",
		},
		{
			id: "3",
			name: planDetails.enterprise.name,
			stripeSubscriptionID: "sadasasa",

			type: "yearly",
			status: "active",
			price: `$${planDetails.enterprise.price}`,
			aiCredits: {
				allotted: planDetails.enterprise.aiCredits.allotted,
				used: planDetails.enterprise.aiCredits.used,
				resetInDays: planDetails.enterprise.aiCredits.resetInDays,
			},
			leads: {
				allotted: planDetails.enterprise.leads.allotted,
				used: planDetails.enterprise.leads.used,
				resetInDays: planDetails.enterprise.leads.resetInDays,
			},
			skipTraces: {
				allotted: planDetails.enterprise.skipTraces.allotted,
				used: planDetails.enterprise.skipTraces.used,
				resetInDays: planDetails.enterprise.skipTraces.resetInDays,
			},
			renewalDate: "Jan 01, 2025",
			createdAt: "Jan 01, 2024",
			planDetails:
				"Enterprise plan offers top-tier access with 5000 AI credits, 1000 leads, and 300 skip traces.",
		},
	];

	return subscriptions;
};

// Usage of mock data for testing
export const mockSubscriptions =
	APP_TESTING_MODE && generateMockSubscriptions();
