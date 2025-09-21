import type { FC } from "react";
import AgentVoiceDropdown, { type AgentOption } from "./AgentVoiceDropdown";

export type BasicPerson = {
	id: string;
	name: string;
	status?: "active" | "inactive" | "away" | string;
};

export type AllRecipientDropdownProps = {
	value?: string;
	onChange: (val: string) => void;
	availablePeople: BasicPerson[];
	transferType?:
		| "inbound_call"
		| "outbound_call"
		| "social"
		| "text"
		| "chat_live_person"
		| "appraisal"
		| "live_avatar";
	placeholderAgent?: string;
	placeholderEmployee?: string;
};

const AllRecipientDropdown: FC<AllRecipientDropdownProps> = ({
	value,
	onChange,
	availablePeople,
	transferType,
	placeholderAgent = "Select an agent",
	placeholderEmployee = "Select an employee or subuser",
}) => {
	const isLivePerson =
		transferType === "chat_live_person" || transferType === "appraisal";

	const mapStatus = (s?: string): "online" | "offline" | "away" => {
		if (!s) return "online";
		if (s === "inactive") return "offline";
		if (s === "away") return "away";
		return "online";
	};

	const aiAgentOptions: AgentOption[] = Array.from(
		new Map(
			availablePeople.map((p) => [
				p.id,
				{
					id: p.id,
					name: p.name,
					status: mapStatus(p.status),
					imageUrl: `https://i.pravatar.cc/64?u=${encodeURIComponent(p.id)}`,
					voiceUrl: "/calls/example-call-yt.mp3",
					description: `AI Agent ${p.name} can handle calls, texts, and follow-ups with your campaign contacts.`,
					capabilities: ["Calls", "Texts", "Follow-ups"],
					agentType: "Voice Agent",
				} as AgentOption,
			]),
		).values(),
	);

	const employeeOptions: AgentOption[] = Array.from(
		new Map(
			availablePeople.map((p) => [
				`emp-${p.id}`,
				{
					id: `emp-${p.id}`,
					name: p.name,
					status: mapStatus(p.status),
					imageUrl: `https://i.pravatar.cc/64?u=${encodeURIComponent(p.id + "-emp")}`,
					voiceUrl: undefined,
					description: `${p.name} is a team member who can handle live appraisals and handoffs.`,
					capabilities: ["Phone", "Scheduling", "Appraisals"],
					agentType: "Employee",
				} as AgentOption,
			]),
		).values(),
	);

	const options = isLivePerson ? employeeOptions : aiAgentOptions;
	const placeholder = isLivePerson ? placeholderEmployee : placeholderAgent;

	return (
		<AgentVoiceDropdown
			value={value}
			onChange={onChange}
			options={options}
			placeholder={placeholder}
		/>
	);
};

export default AllRecipientDropdown;
