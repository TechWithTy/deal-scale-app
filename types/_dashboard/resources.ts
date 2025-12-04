/**
 * Resource Types for Dashboard Resources Page
 * Includes Training Videos, Custom GPTs/LLMs, Simulations, and Mentors
 */

// Training Video Resource
export interface TrainingVideo {
	id: string;
	title: string;
	description: string;
	youtubeUrl: string;
	thumbnail: string;
	duration: string; // Format: "10:30" (mm:ss)
	category: "getting-started" | "lead-generation" | "campaigns" | "advanced";
	publishedAt?: string;
}

// Custom GPT/LLM Tool Resource
export interface CustomGPT {
	id: string;
	name: string;
	description: string;
	url: string;
	icon: string; // Icon name or URL
	category: "real-estate" | "deal-analysis" | "marketing" | "automation";
	isPremium?: boolean;
}

// Investment Simulation Resource (Discord-based)
export interface Simulation {
	id: string;
	name: string;
	description: string;
	discordChannelId: string;
	discordLink: string;
	type: "roi" | "market-analysis" | "deal-comparison" | "portfolio";
	difficulty?: "beginner" | "intermediate" | "advanced";
}

// Investor Mentor Resource
export interface Mentor {
	id: string;
	name: string;
	avatar: string; // Avatar URL or path
	expertise: string[]; // e.g., ["Residential", "Commercial", "Flipping"]
	bio: string;
	availability: "available" | "busy" | "offline";
	contactMethod: "discord" | "email" | "calendar";
	contactInfo?: string; // Discord username, email, or calendar link
	yearsExperience?: number;
	specialties?: string;
}

// Resource Section Types (for grouping)
export type ResourceCategory =
	| "training-videos"
	| "custom-gpts"
	| "simulations"
	| "mentors";

// Combined Resource Type
export type Resource = TrainingVideo | CustomGPT | Simulation | Mentor;
