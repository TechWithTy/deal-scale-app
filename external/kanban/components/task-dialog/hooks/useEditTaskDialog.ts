"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTaskStore } from "../../../utils/store";
import type { KanbanTask } from "../../../utils/types";
import type { AgentType } from "../utils/aiUtils";
import {
	buildMcpSnippet,
	parseMcpTools,
	parseNeeds,
	seedPreviewBase,
} from "../utils/aiUtils";

export interface UseEditTaskDialogArgs {
	task?: KanbanTask;
	mode?: "edit" | "create";
	initialTab?: "manual" | "ai";
	onOpenChange: (open: boolean) => void;
	open: boolean;
	prefill?: {
		assignType?: "lead" | "leadList" | "";
		title?: string;
		description?: string;
		dueDate?: string;
		scheduledDate?: string;
		scheduledTimezone?: string;
		appointmentDateTime?: string;
		appointmentTimezone?: string;
		youtubeUrl?: string;
	};
}

export function useEditTaskDialog({
	task,
	mode,
	initialTab,
	onOpenChange,
	open,
	prefill,
}: UseEditTaskDialogArgs) {
	const updateTask = useTaskStore((s) => s.updateTask);
	const addTask = useTaskStore((s) => s.addTask);

	const effectiveMode: "edit" | "create" = mode ?? (task ? "edit" : "create");

	const initialAssignType = useMemo<"lead" | "leadList" | "">(() => {
		if (prefill?.assignType) return prefill.assignType;
		if (task?.leadId) return "lead";
		if (task?.leadListId) return "leadList";
		return "lead";
	}, [task?.leadId, task?.leadListId, prefill?.assignType]);

	const [assignType, setAssignType] = useState<"lead" | "leadList" | "">(
		initialAssignType,
	);
	const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
		task?.leadId ?? null,
	);
	const [selectedLeadListId, setSelectedLeadListId] = useState<string | null>(
		task?.leadListId ?? null,
	);
	const [assignedUserId, setAssignedUserId] = useState<string>(
		task?.assignedToTeamMember || "",
	);
	const [formValid, setFormValid] = useState(true);

	const [activeTab, setActiveTab] = useState<"manual" | "ai">(
		initialTab ?? "manual",
	);
	const [agentType, setAgentType] = useState<AgentType>("text");
	const [aiPreviewText, setAiPreviewText] = useState("");
	const [aiPlanInput, setAiPlanInput] = useState("");
	const [aiPlanOutput, setAiPlanOutput] = useState("");
	const [aiNeeds, setAiNeeds] = useState("");
	const [aiMcp, setAiMcp] = useState("");
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
	const previewRef = useRef<HTMLDivElement | null>(null);

	const mockAgentsByType: Record<AgentType, { id: string; name: string }[]> = {
		text: [
			{ id: "t-1", name: "Texter Alpha" },
			{ id: "t-2", name: "Texter Beta" },
		],
		voice: [
			{ id: "v-1", name: "Voice Agent Ava" },
			{ id: "v-2", name: "Voice Agent Neo" },
		],
		social: [
			{ id: "s-1", name: "Social Slick" },
			{ id: "s-2", name: "Social Boost" },
		],
		direct_mail: [
			{ id: "m-1", name: "Mailer Pro" },
			{ id: "m-2", name: "Mailer Go" },
		],
	};

	const mcpTools = useMemo(() => parseMcpTools(aiMcp), [aiMcp]);
	const mcpToolsOrdered = useMemo(() => {
		if (!aiMcp) return [] as string[];
		const tools: string[] = [];
		const re = /\[MCP:([^\s\(\]]+)[^\]]*\]/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(aiMcp)) !== null) {
			tools.push(m[1]);
		}
		return tools;
	}, [aiMcp]);

	// Watch for MCP tool removals and trigger cleanup
	const prevToolsRef = useRef<string[]>([]);
	useEffect(() => {
		const prev = prevToolsRef.current;
		const removed = prev.filter((t) => !mcpToolsOrdered.includes(t));
		if (removed.length > 0) {
			removed.forEach((t) => {
				// Call removeTool even if MCP block is gone; our implementation cleans other areas too
				removeTool(t);
			});
		}
		prevToolsRef.current = mcpToolsOrdered;
	}, [mcpToolsOrdered]);

	const needs = useMemo(() => parseNeeds(aiPreviewText), [aiPreviewText]);
	const needsChips = useMemo(() => {
		if (aiNeeds) {
			// parse lines starting with '- '
			return aiNeeds
				.split(/\r?\n/)
				.map((l) => l.trim())
				.filter((l) => l.startsWith("- "))
				.map((l) => l.slice(2).trim())
				.filter(Boolean);
		}
		return needs;
	}, [aiNeeds, needs]);

	// Linkage between tools and needs for hover-highlight and cascade delete
	const toolNeedMap = useMemo(() => {
		const map: Record<string, string[]> = {};
		const targetNeed =
			assignType === "lead"
				? "leadId"
				: assignType === "leadList"
					? "leadListId"
					: undefined;
		mcpToolsOrdered.forEach((t) => {
			const linked: string[] = [];
			if (needsChips.includes("agentId")) linked.push("agentId");
			if (targetNeed && needsChips.includes(targetNeed))
				linked.push(targetNeed);
			map[t] = linked;
		});
		return map;
	}, [mcpToolsOrdered, needsChips, assignType]);

	const needToolMap = useMemo(() => {
		const map: Record<string, string[]> = {};
		Object.entries(toolNeedMap).forEach(([tool, ns]) => {
			ns.forEach((n) => {
				if (!map[n]) map[n] = [];
				if (!map[n].includes(tool)) map[n].push(tool);
			});
		});
		return map;
	}, [toolNeedMap]);

	const validateForm = (form: HTMLFormElement) => {
		const formData = new FormData(form);
		const title = formData.get("title") as string | null;
		const description = formData.get("description") as string | null;
		const dueDate = formData.get("dueDate") as string | null;
		if (!title || !description || !dueDate) return false;
		if (assignType === "lead" && !selectedLeadId) return false;
		if (assignType === "leadList" && !selectedLeadListId) return false;
		if (!assignedUserId) return false;
		if (
			activeTab === "ai" &&
			aiPreviewText.trim().length === 0 &&
			aiMcp.trim().length === 0
		)
			return false;
		return true;
	};

	const handleInputChange = (e: React.FormEvent<HTMLFormElement>) => {
		const formEl = e.currentTarget;
		setFormValid(validateForm(formEl));
	};

	useEffect(() => {
		if (open) {
			setActiveTab(initialTab ?? "manual");
			setAiPreviewText("");
			setAiMcp("");
			setSelectedAgentId(null);
		}
	}, [open, initialTab]);

	useEffect(() => {
		const formEl = document.getElementById(
			"edit-task-form",
		) as HTMLFormElement | null;
		if (formEl) {
			const baseValid = validateForm(formEl);
			const aiOk =
				activeTab === "ai" &&
				(aiPreviewText.trim().length > 0 || aiMcp.trim().length > 0);
			setFormValid(baseValid && (activeTab === "manual" ? true : aiOk));
		}
	}, [
		activeTab,
		aiPreviewText,
		aiMcp,
		assignType,
		selectedLeadId,
		selectedLeadListId,
		assignedUserId,
	]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);

		const title = formData.get("title");
		const description = formData.get("description");
		const dueDate = formData.get("dueDate");
		const scheduledDate = formData.get("scheduledDate");
		const scheduledTimezone = formData.get("scheduledTimezone");
		const appointmentDateTime = formData.get("appointmentDateTime");
		const appointmentTimezone = formData.get("appointmentTimezone");
		const youtubeUrl = formData.get("youtubeUrl");

		if (
			typeof title !== "string" ||
			typeof description !== "string" ||
			typeof dueDate !== "string"
		)
			return;

		const leadId =
			assignType === "lead" && selectedLeadId != null
				? String(selectedLeadId)
				: undefined;
		const leadListId =
			assignType === "leadList" && selectedLeadListId != null
				? String(selectedLeadListId)
				: undefined;

		const fileEntries = formData
			.getAll("attachmentFiles")
			.filter((v) => v instanceof File) as File[];
		const limitedFiles = fileEntries.slice(0, 6);
		const attachments =
			limitedFiles.length > 0
				? limitedFiles.map((file) => ({
						filename: file.name,
						url: URL.createObjectURL(file),
					}))
				: undefined;

		const finalDescription =
			activeTab === "ai"
				? [aiPreviewText, aiMcp].filter(Boolean).join("\n\n") ||
					(typeof description === "string" ? description : "")
				: description;

		// Derive date and time parts from combined appointmentDateTime
		const apptDateStr =
			typeof appointmentDateTime === "string" && appointmentDateTime.length > 0
				? appointmentDateTime.split("T")[0]
				: undefined;
		const apptTimeStr =
			typeof appointmentDateTime === "string" && appointmentDateTime.length > 0
				? (appointmentDateTime.split("T")[1] || "").slice(0, 5)
				: undefined;

		if (effectiveMode === "edit" && task) {
			updateTask(String(task.id), {
				title,
				description: finalDescription,
				dueDate,
				scheduledDate:
					typeof scheduledDate === "string" && scheduledDate.length > 0
						? scheduledDate
						: undefined,
				scheduledTimezone:
					typeof scheduledTimezone === "string" && scheduledTimezone.length > 0
						? scheduledTimezone
						: undefined,
				assignedToTeamMember: assignedUserId || undefined,
				appointmentDate: apptDateStr,
				appointmentTime: apptTimeStr,
				appointmentTimezone:
					typeof appointmentTimezone === "string" &&
					appointmentTimezone.length > 0
						? appointmentTimezone
						: undefined,
				leadId,
				leadListId,
				youtubeUrl:
					typeof youtubeUrl === "string" && youtubeUrl.length > 0
						? youtubeUrl
						: undefined,
				attachments,
			});
		} else {
			addTask(
				title,
				finalDescription as string,
				assignedUserId,
				dueDate,
				typeof scheduledDate === "string" && scheduledDate.length > 0
					? scheduledDate
					: undefined,
				typeof scheduledTimezone === "string" && scheduledTimezone.length > 0
					? scheduledTimezone
					: undefined,
				apptDateStr,
				apptTimeStr,
				typeof appointmentTimezone === "string" &&
					appointmentTimezone.length > 0
					? appointmentTimezone
					: undefined,
				leadId,
				leadListId,
				typeof youtubeUrl === "string" && youtubeUrl.length > 0
					? youtubeUrl
					: undefined,
				undefined,
				attachments,
			);
		}

		onOpenChange(false);
	};

	const initialValues = {
		title: prefill?.title ?? task?.title ?? "",
		description: prefill?.description ?? task?.description ?? "",
		dueDate: prefill?.dueDate ?? task?.dueDate ?? "",
		scheduledDate: prefill?.scheduledDate ?? task?.scheduledDate,
		scheduledTimezone: prefill?.scheduledTimezone ?? task?.scheduledTimezone,
		appointmentDateTime:
			prefill?.appointmentDateTime ??
			(task?.appointmentDate && task?.appointmentTime
				? `${task.appointmentDate}T${task.appointmentTime}`
				: undefined),
		appointmentTimezone:
			prefill?.appointmentTimezone ?? task?.appointmentTimezone,
		youtubeUrl: prefill?.youtubeUrl ?? task?.youtubeUrl,
	};

	const resetPreview = () => {
		setAiPreviewText("");
		setAiPlanInput("");
		setAiPlanOutput("");
		setAiNeeds("");
		setAiMcp("");
	};

	const generatePreview = () => {
		const formEl = document.getElementById(
			"edit-task-form",
		) as HTMLFormElement | null;
		const data = formEl ? new FormData(formEl) : undefined;
		const title = (data?.get("title") as string) || "";
		const due = (data?.get("dueDate") as string) || "";
		const desc = (data?.get("description") as string) || title;
		// Always regenerate the narrative from current inputs
		setAiPreviewText(seedPreviewBase(agentType, selectedAgentId, title, due));
		// Generate Plan with explicit Input and Output sections
		const who = assignedUserId
			? `Assignee: ${assignedUserId}`
			: "Assignee: Unassigned";
		const target =
			assignType === "lead" && selectedLeadId
				? `Target: leadId=${selectedLeadId}`
				: assignType === "leadList" && selectedLeadListId
					? `Target: leadListId=${selectedLeadListId}`
					: "Target: none";

		const apptDt = (data?.get("appointmentDateTime") as string) || "";
		const apptDate = apptDt ? apptDt.split("T")[0] : "";
		const apptTime = apptDt ? (apptDt.split("T")[1] || "").slice(0, 5) : "";
		const yt = (data?.get("youtubeUrl") as string) || "";
		const acceptance = (
			(data?.get("acceptanceCriteria") as string) || ""
		).trim();
		const negativeList = ((data?.get("negativeList") as string) || "").trim();
		const scheduledAction = (
			(data?.get("scheduledAction") as string) || ""
		).trim();

		const needsListForOutput: string[] = (() => {
			const base = new Set<string>(needs);
			if (assignType === "lead" && !selectedLeadId) base.add("leadId");
			if (assignType === "leadList" && !selectedLeadListId)
				base.add("leadListId");
			if (!selectedAgentId) base.add("agentId");
			return Array.from(base);
		})();

		const inputLines = [
			"Input:",
			`- Agent Type: ${agentType}`,
			`- AgentId: ${selectedAgentId ?? "n/a"}`,
			`- Title: ${title}`,
			`- ${who}`,
			`- ${target}`,
			`- Due: ${due || "n/a"}`,
			apptDate ? `- Appointment Date: ${apptDate}` : null,
			apptTime ? `- Appointment Time: ${apptTime}` : null,
			yt ? `- YouTube: ${yt}` : null,
			acceptance ? `- Acceptance Criteria: ${acceptance}` : null,
			negativeList ? `- Do Not Do: ${negativeList}` : null,
			scheduledAction ? `- Scheduled Action: ${scheduledAction}` : null,
			`- Summary: ${desc}`,
		].filter(Boolean) as string[];
		const toolOrder = mcpToolsOrdered.length
			? [
					"",
					"- Tool Calls (in order):",
					...mcpToolsOrdered.map((t, i) => `  ${i + 1}. ${t}`),
				]
			: [];
		setAiPlanInput([...inputLines, ...toolOrder].join("\n"));

		const toolInline = (() => {
			if (mcpToolsOrdered[0]) return `[MCP:${mcpToolsOrdered[0]}]`;
			switch (agentType) {
				case "text":
					return "[MCP:sms.send]";
				case "voice":
					return "[MCP:voice.call]";
				case "social":
					return "[MCP:social.post]";
				default:
					return "[MCP:mail.send]";
			}
		})();
		const needsInline = needsListForOutput.length
			? needsListForOutput.join(", ")
			: "nothing further";
		setAiPlanOutput(
			`Output:\n- I will use ${toolInline} to ${desc || title}. I need ${needsInline}.`,
		);

		const planKeys = [
			"Agent Type",
			"AgentId",
			"Title",
			"Assignee",
			"Target",
			"Due",
			"Appointment Date",
			"Appointment Time",
			"YouTube",
			"Summary",
			"Tool Calls",
			"Input:",
			"Output:",
		];
		const baseNarrative = seedPreviewBase(
			agentType,
			selectedAgentId,
			title,
			due || "",
		);
		const cleanedNarrative = baseNarrative
			.split(/\r?\n/)
			.filter((l) => {
				const line = l.trim();
				if (line.length === 0) return true;
				if (/^Plan:/i.test(line)) return false;
				if (/^\d+\./.test(line)) return false;
				return !planKeys.some((k) =>
					new RegExp(`^-?\s*${k}\s*:`, "i").test(line),
				);
			})
			.join("\n")
			.trim();
		setAiPreviewText(cleanedNarrative);

		const baseNeeds = new Set<string>(needs);
		if (assignType === "lead" && !selectedLeadId) baseNeeds.add("leadId");
		if (assignType === "leadList" && !selectedLeadListId)
			baseNeeds.add("leadListId");
		if (!selectedAgentId) baseNeeds.add("agentId");
		const needsList = Array.from(baseNeeds);
		setAiNeeds(
			needsList.length
				? `Needs:\n${needsList.map((n) => `- ${n}`).join("\n")}`
				: "",
		);

		setAiMcp(
			buildMcpSnippet(
				agentType,
				selectedAgentId,
				assignType,
				selectedLeadId,
				selectedLeadListId,
				desc,
			),
		);
	};

	// Remove a tool highlight from MCP block
	const removeTool = (tool: string) => {
		console.log("[EditTaskDialog] removeTool start", {
			tool,
			aiMcpBefore: aiMcp,
			aiNeedsBefore: aiNeeds,
			aiPlanOutputBefore: aiPlanOutput,
			aiPreviewTextBefore: aiPreviewText,
		});
		// Remove from MCP block if present
		if (aiMcp) {
			const re = new RegExp(
				String.raw`\[MCP:${tool.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\s*\([^\]]*\)\]`,
				"g",
			);
			const next = aiMcp.replace(re, "").trim();
			setAiMcp(next);
			console.log("[EditTaskDialog] removeTool MCP scrubbed", {
				re: re.source,
				aiMcpAfter: next,
			});
		}
		// Remove corresponding needs implied by the tool (agentId + target id) inline to avoid recursion
		const impliedNeeds: string[] = [
			"agentId",
			...(assignType === "lead"
				? ["leadId"]
				: assignType === "leadList"
					? ["leadListId"]
					: []),
		];
		console.log("[EditTaskDialog] removeTool impliedNeeds", {
			impliedNeeds,
			assignType,
		});
		// Safety: if all implied needs exist in chips, we'll allow full clear of Needs block after scrub
		const allImpliedPresent = impliedNeeds.every((n) =>
			needsChips.map((x) => x.toLowerCase()).includes(n.toLowerCase()),
		);
		if (aiNeeds) {
			const lines = aiNeeds.split(/\r?\n/).filter((l) => {
				const low = l.trim().toLowerCase();
				return !impliedNeeds.some((n) => low.endsWith(n.toLowerCase()));
			});
			const hasBullets = lines.some((l) => l.trim().startsWith("- "));
			const afterText = hasBullets ? lines.join("\n").trim() : "";
			setAiNeeds(allImpliedPresent ? "" : afterText);
			console.log("[EditTaskDialog] removeTool aiNeeds scrubbed", {
				hasBullets,
				allImpliedPresent,
				aiNeedsAfter: allImpliedPresent ? "" : afterText,
			});
		}
		if (aiPreviewText) {
			const nextPreview = aiPreviewText
				.split(/\r?\n/)
				.filter((l) => {
					const low = l.toLowerCase();
					if (!/^\s*-?\s*need:\s*/i.test(l)) return true;
					return !impliedNeeds.some((n) => low.includes(n.toLowerCase()));
				})
				.join("\n");
			setAiPreviewText(nextPreview);
			console.log("[EditTaskDialog] removeTool preview scrubbed", {
				aiPreviewTextAfter: nextPreview,
			});
		}

		// Scrub implied needs from the editable Output line ("I need ...")
		if (aiPlanOutput) {
			const lines = aiPlanOutput.split(/\r?\n/);
			const outIdx = lines.findIndex((l) => /I need /i.test(l));
			if (outIdx !== -1) {
				const line = lines[outIdx];
				// Extract the segment after 'I need '
				const m = line.match(/(.*I need )(.*?)(\.?\s*)$/i);
				if (m) {
					const prefix = m[1];
					const needsSeg = m[2];
					const suffix = m[3] ?? "";
					const items = needsSeg
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean)
						.filter(
							(n) =>
								!impliedNeeds
									.map((x) => x.toLowerCase())
									.includes(n.toLowerCase()),
						);
					const rebuilt = items.length ? items.join(", ") : "nothing further";
					lines[outIdx] = `${prefix}${rebuilt}${suffix}`;
					console.log("[EditTaskDialog] removeTool output needs rebuilt", {
						items,
						rebuilt,
					});
				}
				// Also remove [MCP:tool] token from output line if present
				const tokenRe = new RegExp(
					String.raw`\[MCP:${tool.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\]`,
					"g",
				);
				lines[outIdx] = lines[outIdx]
					.replace(tokenRe, "")
					.replace(/\s{2,}/g, " ")
					.trimStart();
				setAiPlanOutput(lines.join("\n"));
				console.log("[EditTaskDialog] removeTool output line scrubbed", {
					tokenRe: tokenRe.source,
					aiPlanOutputAfter: lines.join("\n"),
				});
			}
		}
		console.log("[EditTaskDialog] removeTool end");
	};

	// Remove a need highlight from needs block and scrub inline Need: lines
	const removeNeed = (need: string) => {
		console.log("[EditTaskDialog] removeNeed start", {
			need,
			aiNeedsBefore: aiNeeds,
			aiMcpBefore: aiMcp,
			aiPlanOutputBefore: aiPlanOutput,
			aiPreviewTextBefore: aiPreviewText,
		});
		if (aiNeeds) {
			const lines = aiNeeds
				.split(/\r?\n/)
				.filter((l) => !l.trim().toLowerCase().endsWith(need.toLowerCase()));
			const hasBullets = lines.some((l) => l.trim().startsWith("- "));
			setAiNeeds(hasBullets ? lines.join("\n").trim() : "");
			console.log("[EditTaskDialog] removeNeed aiNeeds scrubbed", {
				hasBullets,
				aiNeedsAfter: hasBullets ? lines.join("\n").trim() : "",
			});
		}
		if (aiPreviewText) {
			const nextPreview = aiPreviewText
				.split(/\r?\n/)
				.filter(
					(l) =>
						!/^\s*-?\s*Need:\s*/i.test(l) ||
						!l.toLowerCase().includes(need.toLowerCase()),
				)
				.join("\n");
			setAiPreviewText(nextPreview);
			console.log("[EditTaskDialog] removeNeed preview scrubbed", {
				aiPreviewTextAfter: nextPreview,
			});
		}
		// Cascade: remove any tools linked to this need
		const linkedTools = needToolMap[need] || [];
		console.log("[EditTaskDialog] removeNeed linkedTools", {
			linkedTools,
			need,
		});
		linkedTools.forEach((t) => removeTool(t));
		console.log("[EditTaskDialog] removeNeed end");
	};

	return {
		// metadata
		effectiveMode,

		// shared form state
		assignType,
		setAssignType,
		selectedLeadId,
		setSelectedLeadId,
		selectedLeadListId,
		setSelectedLeadListId,
		assignedUserId,
		setAssignedUserId,
		formValid,
		setFormValid,

		// tabs/ai state
		activeTab,
		setActiveTab,
		agentType,
		setAgentType,
		aiPreviewText,
		setAiPreviewText,
		aiMcp,
		setAiMcp,
		selectedAgentId,
		setSelectedAgentId,
		previewRef,

		// derived
		mcpTools,
		mcpToolsOrdered,
		needs,
		needsChips,
		initialValues,

		// handlers
		handleSubmit,
		handleInputChange,
		resetPreview,
		mockAgentsByType,
		generatePreview,
		aiPlanInput,
		aiPlanOutput,
		setAiPlanOutput,
		aiNeeds,
		removeTool,
		removeNeed,
		toolNeedMap,
		needToolMap,
	} as const;
}
