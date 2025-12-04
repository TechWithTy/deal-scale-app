/**
 * Mock Data for Resources Page
 * Contains sample training videos, custom GPTs, simulations, and mentors
 */

import type {
	CustomGPT,
	Mentor,
	Simulation,
	TrainingVideo,
} from "@/types/_dashboard/resources";

// Training Videos Data
export const trainingVideos: TrainingVideo[] = [
	{
		id: "tv-1",
		title: "Deal Scale Platform Walkthrough",
		description:
			"Complete overview of the Deal Scale platform, features, and how to get started with your first campaign.",
		youtubeUrl: "https://www.youtube.com/watch?v=hyosynoNbSU",
		thumbnail: "https://img.youtube.com/vi/hyosynoNbSU/maxresdefault.jpg",
		duration: "15:30",
		category: "getting-started",
		publishedAt: "2024-01-15",
	},
	{
		id: "tv-2",
		title: "Lead Generation Strategies",
		description:
			"Learn proven strategies for generating high-quality real estate leads using Deal Scale's AI-powered tools.",
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
		duration: "22:45",
		category: "lead-generation",
		publishedAt: "2024-02-01",
	},
	{
		id: "tv-3",
		title: "Campaign Setup & Automation",
		description:
			"Step-by-step guide to setting up automated campaigns and maximizing your conversion rates.",
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
		duration: "18:20",
		category: "campaigns",
		publishedAt: "2024-02-10",
	},
	{
		id: "tv-4",
		title: "Advanced AI Assistant Features",
		description:
			"Unlock the full potential of Deal Scale's AI assistants for market analysis and deal evaluation.",
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
		duration: "25:10",
		category: "advanced",
		publishedAt: "2024-02-20",
	},
	{
		id: "tv-5",
		title: "Kanban Board Mastery",
		description:
			"Master the AI-powered Kanban board to track deals and manage your pipeline efficiently.",
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
		duration: "12:45",
		category: "getting-started",
		publishedAt: "2024-03-01",
	},
	{
		id: "tv-6",
		title: "Analytics & Reporting Deep Dive",
		description:
			"Learn how to leverage Deal Scale's analytics tools to make data-driven investment decisions.",
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
		duration: "20:15",
		category: "advanced",
		publishedAt: "2024-03-10",
	},
];

// Custom GPTs/LLMs Data
export const customGPTs: CustomGPT[] = [
	{
		id: "gpt-1",
		name: "Real Estate Deal Analyzer GPT",
		description:
			"AI-powered tool to analyze property deals, calculate ROI, and identify potential risks in seconds.",
		url: "https://chat.openai.com/g/g-example-deal-analyzer",
		icon: "🏠",
		category: "deal-analysis",
		isPremium: false,
	},
	{
		id: "gpt-2",
		name: "Property Marketing Copy Writer",
		description:
			"Generate compelling property listings, marketing emails, and social media content for your real estate business.",
		url: "https://chat.openai.com/g/g-example-marketing",
		icon: "✍️",
		category: "marketing",
		isPremium: false,
	},
	{
		id: "gpt-3",
		name: "Market Research Assistant",
		description:
			"Get instant market insights, comp analysis, and neighborhood research for any location.",
		url: "https://chat.openai.com/g/g-example-market-research",
		icon: "📊",
		category: "real-estate",
		isPremium: true,
	},
	{
		id: "gpt-4",
		name: "Automation Workflow Builder",
		description:
			"Design and optimize automated workflows for lead nurturing, follow-ups, and deal management.",
		url: "https://chat.openai.com/g/g-example-automation",
		icon: "⚙️",
		category: "automation",
		isPremium: false,
	},
	{
		id: "gpt-5",
		name: "Investment Strategy Advisor",
		description:
			"Get personalized investment strategies based on your goals, risk tolerance, and market conditions.",
		url: "https://chat.openai.com/g/g-example-strategy",
		icon: "💼",
		category: "deal-analysis",
		isPremium: true,
	},
	{
		id: "gpt-6",
		name: "Negotiation Script Generator",
		description:
			"Create effective negotiation scripts and talking points for sellers, buyers, and agents.",
		url: "https://chat.openai.com/g/g-example-negotiation",
		icon: "🤝",
		category: "real-estate",
		isPremium: false,
	},
];

// Investment Simulations Data (Discord Resources)
export const simulations: Simulation[] = [
	{
		id: "sim-1",
		name: "ROI Calculator Scenarios",
		description:
			"Access pre-built ROI scenarios and templates in our Discord. Compare different investment strategies and outcomes.",
		discordChannelId: "1234567890",
		discordLink: "https://discord.gg/BNrsYRPtFN",
		type: "roi",
		difficulty: "beginner",
	},
	{
		id: "sim-2",
		name: "Market Analysis Templates",
		description:
			"Download comprehensive market analysis templates shared by the community. Perfect for evaluating new markets.",
		discordChannelId: "1234567891",
		discordLink: "https://discord.gg/BNrsYRPtFN",
		type: "market-analysis",
		difficulty: "intermediate",
	},
	{
		id: "sim-3",
		name: "Deal Comparison Framework",
		description:
			"Learn how to compare multiple deals side-by-side using our proven framework. Includes real examples.",
		discordChannelId: "1234567892",
		discordLink: "https://discord.gg/BNrsYRPtFN",
		type: "deal-comparison",
		difficulty: "intermediate",
	},
	{
		id: "sim-4",
		name: "Portfolio Growth Simulator",
		description:
			"Model your portfolio growth over time with various investment scenarios. Visualize your path to financial freedom.",
		discordChannelId: "1234567893",
		discordLink: "https://discord.gg/BNrsYRPtFN",
		type: "portfolio",
		difficulty: "advanced",
	},
	{
		id: "sim-5",
		name: "Fix & Flip Calculator",
		description:
			"Access detailed fix and flip calculations with repair cost estimators and profit projections.",
		discordChannelId: "1234567894",
		discordLink: "https://discord.gg/BNrsYRPtFN",
		type: "roi",
		difficulty: "beginner",
	},
	{
		id: "sim-6",
		name: "Rental Property Cash Flow Models",
		description:
			"Explore various rental property scenarios with detailed cash flow analysis and expense tracking.",
		discordChannelId: "1234567895",
		discordLink: "https://discord.gg/BNrsYRPtFN",
		type: "roi",
		difficulty: "intermediate",
	},
];

// Investor Mentors Data
export const mentors: Mentor[] = [
	{
		id: "mentor-1",
		name: "Sarah Johnson",
		avatar: "/avatars/mentor-1.jpg",
		expertise: ["Residential", "Fix & Flip", "Market Analysis"],
		bio: "20+ years in residential real estate with over 150 successful fix & flip projects. Specializes in helping new investors identify undervalued properties.",
		availability: "available",
		contactMethod: "discord",
		contactInfo: "@SarahJ_RealEstate",
		yearsExperience: 20,
		specialties: "Residential investing, property renovation, market timing",
	},
	{
		id: "mentor-2",
		name: "Michael Chen",
		avatar: "/avatars/mentor-2.jpg",
		expertise: ["Commercial", "Multi-Family", "Portfolio Management"],
		bio: "Commercial real estate investor managing a $50M+ portfolio. Expert in multi-family properties and commercial development.",
		availability: "available",
		contactMethod: "calendar",
		contactInfo: "https://calendly.com/michael-chen-mentor",
		yearsExperience: 15,
		specialties: "Commercial real estate, syndication, portfolio scaling",
	},
	{
		id: "mentor-3",
		name: "Jessica Martinez",
		avatar: "/avatars/mentor-3.jpg",
		expertise: ["Wholesaling", "Marketing", "Lead Generation"],
		bio: "Built a 7-figure wholesaling business from scratch. Now teaching others how to generate consistent deal flow.",
		availability: "busy",
		contactMethod: "discord",
		contactInfo: "@JessicaM_Wholesale",
		yearsExperience: 8,
		specialties: "Wholesaling, marketing automation, lead acquisition",
	},
	{
		id: "mentor-4",
		name: "David Thompson",
		avatar: "/avatars/mentor-4.jpg",
		expertise: ["Financing", "Creative Deals", "Subject-to"],
		bio: "Financing strategist specializing in creative deal structures. Helped investors close over $100M in transactions.",
		availability: "available",
		contactMethod: "email",
		contactInfo: "david.thompson@dealscale.io",
		yearsExperience: 18,
		specialties: "Creative financing, seller financing, partnership structures",
	},
	{
		id: "mentor-5",
		name: "Amanda Williams",
		avatar: "/avatars/mentor-5.jpg",
		expertise: ["Luxury Properties", "International Markets", "Networking"],
		bio: "Luxury real estate specialist with global market experience. Expert in high-end property acquisitions and investor networking.",
		availability: "offline",
		contactMethod: "calendar",
		contactInfo: "https://calendly.com/amanda-williams-luxury",
		yearsExperience: 12,
		specialties: "Luxury markets, international investing, high-net-worth clients",
	},
	{
		id: "mentor-6",
		name: "Robert Garcia",
		avatar: "/avatars/mentor-6.jpg",
		expertise: ["Short-Term Rentals", "Airbnb", "Property Management"],
		bio: "Short-term rental expert managing 30+ Airbnb properties. Teaches optimization strategies for maximum returns.",
		availability: "available",
		contactMethod: "discord",
		contactInfo: "@RobertG_STR",
		yearsExperience: 6,
		specialties: "Airbnb optimization, vacation rentals, property automation",
	},
	{
		id: "mentor-7",
		name: "Linda Foster",
		avatar: "/avatars/mentor-7.jpg",
		expertise: ["Tax Strategies", "Asset Protection", "Legal Compliance"],
		bio: "CPA and real estate investor specializing in tax optimization and asset protection strategies for investors.",
		availability: "available",
		contactMethod: "email",
		contactInfo: "linda.foster@dealscale.io",
		yearsExperience: 25,
		specialties: "Tax planning, 1031 exchanges, entity structuring",
	},
	{
		id: "mentor-8",
		name: "James Lee",
		avatar: "/avatars/mentor-8.jpg",
		expertise: ["Land Development", "New Construction", "Zoning"],
		bio: "Land development specialist with experience in residential and commercial projects. Expert in navigating zoning and permits.",
		availability: "busy",
		contactMethod: "calendar",
		contactInfo: "https://calendly.com/james-lee-development",
		yearsExperience: 22,
		specialties: "Land acquisition, development projects, municipal relations",
	},
];

