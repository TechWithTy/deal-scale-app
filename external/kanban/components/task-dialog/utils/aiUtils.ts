export type AgentType = "text" | "voice" | "social" | "direct_mail";

export function parseMcpTools(aiMcp: string): string[] {
	const tools: string[] = [];
	const re = /\[MCP:([^\(\]\s]+)\s*\(/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(aiMcp)) !== null) {
		tools.push(m[1]);
	}
	return Array.from(new Set(tools));
}

export function parseNeeds(aiPreviewText: string): string[] {
	const lines = aiPreviewText.split(/\r?\n/);
	const found: string[] = [];
	for (const line of lines) {
		const m = line.match(/(?:^-\s*)?Need:\s*(.+)$/i);
		if (m && m[1]) found.push(m[1].trim());
	}
	return found;
}

export function buildMcpSnippet(
	agentType: AgentType,
	selectedAgentId: string | null,
	assignType: "lead" | "leadList" | "",
	selectedLeadId: string | null,
	selectedLeadListId: string | null,
	desc: string,
): string {
	const leadRef =
		assignType === "lead" && selectedLeadId
			? `leadId: ${selectedLeadId}`
			: assignType === "leadList" && selectedLeadListId
				? `leadListId: ${selectedLeadListId}`
				: "";

	switch (agentType) {
		case "text":
			return `[MCP:sms.send({ ${leadRef}, agentId: "${selectedAgentId}", message: "${desc}" })]`;
		case "voice":
			return `[MCP:voice.call({ ${leadRef}, agentId: "${selectedAgentId}", script: "${desc}" })]`;
		case "social":
			return `[MCP:social.post({ ${leadRef}, agentId: "${selectedAgentId}", content: "${desc}" })]`;
		default:
			return `[MCP:mail.send({ ${leadRef}, agentId: "${selectedAgentId}", template: "Outreach", note: "${desc}" })]`;
	}
}

export function seedPreviewBase(
	agentType: AgentType,
	selectedAgentId: string | null,
	title: string,
	due: string,
): string {
	const agentLine = selectedAgentId
		? `AgentId: ${selectedAgentId}`
		: "AgentId: n/a";
	const base = `Agent Type: ${agentType}\n${agentLine}\nTitle: ${title}\nDue: ${due}\n`;
	return base.trim();
}
