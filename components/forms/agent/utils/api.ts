// ? This is a mock API to simulate backend functionality for AI agents.
// * It uses an in-memory array to store agents and simulates async operations.

import type { Agent } from "./schema";

// --- Mock Data ---
const voices = [
	{ id: "voice-1", name: "Standard Male Voice" },
	{ id: "voice-2", name: "Standard Female Voice" },
	{ id: "cloned-voice-john", name: "Cloned Voice - John D." },
];

const voicemails = [
	{ id: "voicemail-1", name: "Standard Voicemail" },
	{ id: "voicemail-2", name: "Follow-up Voicemail" },
];

const backgroundNoises = [
	{ id: "noise-1", name: "Coffee Shop Ambience" },
	{ id: "noise-2", name: "Quiet Office Hum" },
];

const avatars = [
	{
		id: "1",
		name: "Alex",
		image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
	},
	{
		id: "2",
		name: "Jordan",
		image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
	},
	{
		id: "3",
		name: "Taylor",
		image: "https://i.pravatar.cc/150?u=a04258114e29026702d",
	},
];

let agents: Agent[] = [
	{
		isPublic: true,
		isFree: false,
		priceMultiplier: 1,
		billingCycle: "monthly",
		id: "1",
		image: "/placeholder-agent.png",
		name: "Q3 Top Performer",
		type: "phone",
		description: "This is a high-performing agent for phone campaigns.",
		voice: "Cloned Voice - John D.",
		campaignGoal: "Book 100 Demos",
		salesScript: "Introductory Pitch v2",
		persona: "Enthusiastic & Knowledgeable",
		backgroundNoise: "None",
		voicemailScript: "Standard Voicemail Drop",
	},
];

const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- API Functions ---

export const fetchAgents = async (): Promise<Agent[]> => {
	await simulateDelay(500);
	return agents;
};

export const fetchAgentById = async (
	id: string,
): Promise<Agent | undefined> => {
	await simulateDelay(300);
	return agents.find((agent) => agent.id === id);
};

export const fetchVoices = async () => {
	await simulateDelay(50);
	return voices;
};

export const fetchVoicemails = async () => {
	await simulateDelay(50);
	return voicemails;
};

export const fetchBackgroundNoises = async () => {
	await simulateDelay(50);
	return backgroundNoises;
};

export const fetchAvatars = async () => {
	await simulateDelay(50);
	return avatars;
};

export const createAgent = async (data: Omit<Agent, "id">): Promise<Agent> => {
	await simulateDelay(500);
	const newAgent: Agent = {
		id: String(Date.now()),
		...data,
	};
	agents.push(newAgent);
	return newAgent;
};

export const updateAgent = async (
	id: string,
	data: Partial<Agent>,
): Promise<Agent | undefined> => {
	await simulateDelay(500);
	const agentIndex = agents.findIndex((agent) => agent.id === id);
	if (agentIndex !== -1) {
		agents[agentIndex] = { ...agents[agentIndex], ...data };
		return agents[agentIndex];
	}
	return undefined;
};

export const deleteAgent = async (id: string): Promise<boolean> => {
	await simulateDelay(500);
	const initialLength = agents.length;
	agents = agents.filter((agent) => agent.id !== id);
	return agents.length < initialLength;
};
