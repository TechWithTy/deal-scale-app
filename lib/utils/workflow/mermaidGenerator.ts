/**
 * Mermaid Flowchart Generator for Workflows
 * Supports n8n, Make.com, and Kestra with edge case handling
 *
 * Based on workflow translation best practices:
 * - Handles triggers, nodes, edges, variables, loops, parallel branches
 * - Supports retry logic, error handlers, sub-flows
 * - Provides fallbacks for unmappable node types
 */

export interface WorkflowNode {
	id: string;
	type: string;
	name: string;
	description?: string;
	disabled?: boolean;
	properties?: Record<string, any>;
	retry?: {
		maxAttempts?: number;
		interval?: string;
		type?: string;
	};
	timeout?: string;
	// For flowable tasks
	subtasks?: WorkflowNode[];
	cases?: Array<{ label: string; targetTaskId: string }>;
	condition?: string;
	// For loops
	items?: string;
	// For sub-flows
	flowId?: string;
	inputs?: Record<string, any>;
}

export interface WorkflowDefinition {
	id: string;
	name: string;
	description?: string;
	namespace?: string;
	platform: "n8n" | "make" | "kestra" | "poml";

	// Metadata
	version?: string;
	disabled?: boolean;

	// Flow-level config
	retry?: {
		maxAttempts?: number;
		interval?: string;
	};
	concurrencyLimit?: number;

	// Workflow elements
	triggers?: Array<{
		id: string;
		type: string;
		properties: Record<string, any>;
	}>;
	nodes: WorkflowNode[];
	edges: Array<{ from: string; to: string; label?: string }>;
	variables?: Record<string, string>;
	inputs?: Array<{
		name: string;
		type: string;
		description?: string;
	}>;
	outputs?: Array<{
		name: string;
		value: string;
	}>;

	// Error handling
	errors?: Array<{
		id: string;
		type: string;
		properties?: Record<string, any>;
	}>;
}

/**
 * Sanitize node ID for Mermaid diagram
 */
function sanitizeId(id: string): string {
	return id
		.replace(/[^a-zA-Z0-9_]/g, "_")
		.replace(/^[0-9]/, "n_$&")
		.toLowerCase();
}

/**
 * Sanitize label text for Mermaid
 */
function sanitizeLabel(label: string): string {
	return label.replace(/"/g, '\\"').replace(/\n/g, " ").slice(0, 50); // Limit length for readability
}

/**
 * Get node shape based on type
 */
function getNodeShape(node: WorkflowNode): { prefix: string; suffix: string } {
	const type = node.type.toLowerCase();

	// Triggers - Stadium shape
	if (
		type.includes("trigger") ||
		type.includes("webhook") ||
		type.includes("schedule")
	) {
		return { prefix: "([", suffix: "])" };
	}

	// Decision/Switch - Diamond
	if (
		type.includes("switch") ||
		type.includes("router") ||
		type.includes("if") ||
		type.includes("decision")
	) {
		return { prefix: "{", suffix: "}" };
	}

	// Sub-flows - Hexagon
	if (type.includes("subflow") || type.includes("workflow")) {
		return { prefix: "{{", suffix: "}}" };
	}

	// Parallel - Double brackets
	if (type.includes("parallel")) {
		return { prefix: "[[", suffix: "]]" };
	}

	// Error handlers - Asymmetric
	if (
		type.includes("error") ||
		type.includes("catch") ||
		type.includes("handler")
	) {
		return { prefix: ">", suffix: "]" };
	}

	// Loop/ForEach - Trapezoid
	if (
		type.includes("loop") ||
		type.includes("foreach") ||
		type.includes("iterate")
	) {
		return { prefix: "[/", suffix: "\\]" };
	}

	// Default - Rectangle
	return { prefix: "[", suffix: "]" };
}

/**
 * Get node style class based on type
 */
function getNodeStyle(node: WorkflowNode): string | null {
	const type = node.type.toLowerCase();

	if (type.includes("trigger") || type.includes("webhook")) {
		return "fill:#8b5cf6,stroke:#a78bfa,color:#fff";
	}

	if (type.includes("error") || type.includes("catch")) {
		return "fill:#ef4444,stroke:#f87171,color:#fff";
	}

	if (type.includes("parallel")) {
		return "fill:#3b82f6,stroke:#60a5fa,color:#fff";
	}

	if (
		type.includes("switch") ||
		type.includes("router") ||
		type.includes("decision")
	) {
		return "fill:#f59e0b,stroke:#fbbf24,color:#fff";
	}

	if (type.includes("subflow")) {
		return "fill:#ec4899,stroke:#f472b6,color:#fff";
	}

	if (node.disabled) {
		return "fill:#6b7280,stroke:#9ca3af,color:#fff,stroke-dasharray: 5 5";
	}

	return null;
}

/**
 * Render a single node in Mermaid syntax
 */
function renderNode(node: WorkflowNode): string {
	const id = sanitizeId(node.id);
	const label = sanitizeLabel(node.name || node.type);
	const shape = getNodeShape(node);

	// Add indicators for special features
	const indicators: string[] = [];
	if (node.retry) indicators.push("🔄");
	if (node.timeout) indicators.push("⏱️");
	if (node.disabled) indicators.push("⏸️");

	const fullLabel =
		indicators.length > 0 ? `${indicators.join("")} ${label}` : label;

	return `${id}${shape.prefix}"${fullLabel}"${shape.suffix}`;
}

/**
 * Generate Mermaid diagram for a workflow
 */
export function generateMermaidDiagram(workflow: WorkflowDefinition): string {
	const lines: string[] = ["graph TD"];
	const styles: string[] = [];
	const processedNodes = new Set<string>();
	const nodeStyleMap = new Map<string, string>();

	// Add start node
	lines.push("    Start([▶ Start])");
	styles.push("classDef startNode fill:#10b981,stroke:#34d399,color:#fff");
	styles.push("class Start startNode");

	// Process triggers first
	if (workflow.triggers && workflow.triggers.length > 0) {
		workflow.triggers.forEach((trigger, idx) => {
			const triggerId = sanitizeId(trigger.id);
			const triggerLabel = sanitizeLabel(trigger.type);
			lines.push(`    ${triggerId}(["⚡ ${triggerLabel}"])`);
			lines.push(`    Start --> ${triggerId}`);
			processedNodes.add(triggerId);

			// Connect trigger to first node
			if (workflow.nodes.length > 0) {
				const firstNode = sanitizeId(workflow.nodes[0].id);
				lines.push(`    ${triggerId} --> ${firstNode}`);
			}
		});
	} else if (workflow.nodes.length > 0) {
		// No triggers, connect start to first node
		const firstNode = sanitizeId(workflow.nodes[0].id);
		lines.push(`    Start --> ${firstNode}`);
	}

	// Process nodes
	workflow.nodes.forEach((node, idx) => {
		const nodeId = sanitizeId(node.id);

		if (!processedNodes.has(nodeId)) {
			// Render the node
			const nodeDeclaration = renderNode(node);
			lines.push(`    ${nodeDeclaration}`);
			processedNodes.add(nodeId);

			// Add style if needed
			const style = getNodeStyle(node);
			if (style) {
				nodeStyleMap.set(nodeId, style);
			}

			// Handle special node types
			if (node.subtasks && node.subtasks.length > 0) {
				// Parallel or nested tasks
				if (node.type.toLowerCase().includes("parallel")) {
					// Create parallel branches
					node.subtasks.forEach((subtask, subIdx) => {
						const subtaskId = sanitizeId(subtask.id);
						const subtaskDecl = renderNode(subtask);
						lines.push(`    ${subtaskDecl}`);
						lines.push(`    ${nodeId} --> ${subtaskId}`);

						// Parallel branches converge
						if (subIdx === node.subtasks!.length - 1) {
							const convergeId = `${nodeId}_converge`;
							lines.push(`    ${convergeId}(( ))`);
							node.subtasks!.forEach((st) => {
								lines.push(`    ${sanitizeId(st.id)} --> ${convergeId}`);
							});
						}
					});
				} else {
					// Sequential nested tasks
					node.subtasks.forEach((subtask, subIdx) => {
						const subtaskId = sanitizeId(subtask.id);
						const subtaskDecl = renderNode(subtask);
						lines.push(`    ${subtaskDecl}`);

						if (subIdx === 0) {
							lines.push(`    ${nodeId} --> ${subtaskId}`);
						}

						if (subIdx > 0) {
							const prevId = sanitizeId(node.subtasks![subIdx - 1].id);
							lines.push(`    ${prevId} --> ${subtaskId}`);
						}
					});
				}
			}

			// Handle switch/router cases
			if (node.cases && node.cases.length > 0) {
				node.cases.forEach((caseItem) => {
					const targetId = sanitizeId(caseItem.targetTaskId);
					const label = sanitizeLabel(caseItem.label);
					lines.push(`    ${nodeId} -->|"${label}"| ${targetId}`);
				});
			}

			// Handle loop tasks
			if (
				node.type.toLowerCase().includes("foreach") ||
				node.type.toLowerCase().includes("loop")
			) {
				// Create loop back edge
				if (node.subtasks && node.subtasks.length > 0) {
					const lastSubtask = node.subtasks[node.subtasks.length - 1];
					const lastId = sanitizeId(lastSubtask.id);
					lines.push(`    ${lastId} -.->|"Loop"| ${nodeId}`);
				}
			}
		}
	});

	// Process edges (explicit connections)
	workflow.edges.forEach((edge) => {
		const fromId = sanitizeId(edge.from);
		const toId = sanitizeId(edge.to);

		if (edge.label) {
			const label = sanitizeLabel(edge.label);
			lines.push(`    ${fromId} -->|"${label}"| ${toId}`);
		} else {
			lines.push(`    ${fromId} --> ${toId}`);
		}
	});

	// Add end node
	const lastNode =
		workflow.nodes.length > 0
			? sanitizeId(workflow.nodes[workflow.nodes.length - 1].id)
			: "Start";

	lines.push("    End([■ End])");

	// Connect last node to end if no explicit edges
	if (workflow.edges.length === 0 && workflow.nodes.length > 0) {
		lines.push(`    ${lastNode} --> End`);
	} else if (workflow.edges.length > 0) {
		// Find terminal nodes (nodes with no outgoing edges)
		const nodesWithOutgoing = new Set(
			workflow.edges.map((e) => sanitizeId(e.from)),
		);
		const terminalNodes = workflow.nodes
			.filter((n) => !nodesWithOutgoing.has(sanitizeId(n.id)))
			.map((n) => sanitizeId(n.id));

		terminalNodes.forEach((nodeId) => {
			if (nodeId !== "Start") {
				lines.push(`    ${nodeId} --> End`);
			}
		});
	}

	styles.push("classDef endNode fill:#ef4444,stroke:#f87171,color:#fff");
	styles.push("class End endNode");

	// Add error handlers if present
	if (workflow.errors && workflow.errors.length > 0) {
		workflow.errors.forEach((error) => {
			const errorId = sanitizeId(error.id);
			const errorLabel = sanitizeLabel(error.type);
			lines.push(`    ${errorId}>"❌ ${errorLabel}"]`);
			styles.push(`style ${errorId} fill:#dc2626,stroke:#ef4444,color:#fff`);
		});
	}

	// Apply custom styles
	nodeStyleMap.forEach((style, nodeId) => {
		styles.push(`style ${nodeId} ${style}`);
	});

	// Add subgraphs for grouped tasks (optional enhancement)
	// This could be extended to show parallel branches or sub-flows as subgraphs

	return [...lines, "", ...styles].join("\n");
}

/**
 * Parse POML into WorkflowDefinition
 */
export function parsePOMLToWorkflow(poml: string): WorkflowDefinition {
	const nodes: WorkflowNode[] = [];
	const edges: Array<{ from: string; to: string; label?: string }> = [];
	const variables: Record<string, string> = {};
	const triggers: Array<{
		id: string;
		type: string;
		properties: Record<string, any>;
	}> = [];

	// Extract workflow name
	const nameMatch = poml.match(/<workflow[^>]*name=["']([^"']+)["']/i);
	const name = nameMatch ? nameMatch[1] : "Untitled Workflow";

	// Extract triggers
	const triggerRegex =
		/<trigger[^>]*type=["']([^"']+)["'][^>]*>([\s\S]*?)<\/trigger>/gi;
	let triggerMatch;
	while ((triggerMatch = triggerRegex.exec(poml)) !== null) {
		const triggerType = triggerMatch[1];
		const triggerContent = triggerMatch[2];

		// Extract event from trigger content
		const eventMatch = triggerContent.match(/<event>([^<]+)<\/event>/i);
		const event = eventMatch ? eventMatch[1] : triggerType;

		triggers.push({
			id: `trigger_${triggers.length + 1}`,
			type: triggerType,
			properties: { event },
		});
	}

	// Extract phases/tasks
	const phaseRegex =
		/<phase[^>]*name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/phase>/gi;
	let phaseMatch;
	let previousPhaseId: string | null = null;

	while ((phaseMatch = phaseRegex.exec(poml)) !== null) {
		const phaseName = phaseMatch[1];
		const phaseContent = phaseMatch[2];
		const phaseId = `phase_${sanitizeId(phaseName)}`;

		// Extract tasks within phase
		const taskRegex = /<task[^>]*>([\s\S]*?)<\/task>/gi;
		const tasks: string[] = [];
		let taskMatch;

		while ((taskMatch = taskRegex.exec(phaseContent)) !== null) {
			tasks.push(taskMatch[1].trim());
		}

		// Create node for this phase
		const phaseNode: WorkflowNode = {
			id: phaseId,
			type: "phase",
			name: phaseName,
			description: tasks.join("; "),
			subtasks: tasks.map((task, idx) => ({
				id: `${phaseId}_task_${idx + 1}`,
				type: "task",
				name: task.slice(0, 50),
			})),
		};

		nodes.push(phaseNode);

		// Connect to previous phase
		if (previousPhaseId) {
			edges.push({ from: previousPhaseId, to: phaseId });
		}

		previousPhaseId = phaseId;
	}

	// Extract variables
	const varRegex = /\{\{(\w+)\}\}/g;
	let varMatch;
	while ((varMatch = varRegex.exec(poml)) !== null) {
		const varName = varMatch[1];
		if (!variables[varName]) {
			variables[varName] = `{{${varName}}}`;
		}
	}

	// Extract parallel tasks
	const parallelRegex = /<parallel[^>]*>([\s\S]*?)<\/parallel>/gi;
	let parallelMatch;
	while ((parallelMatch = parallelRegex.exec(poml)) !== null) {
		const parallelContent = parallelMatch[1];
		const parallelId = `parallel_${nodes.length + 1}`;

		// Extract calls within parallel
		const callRegex =
			/<call[^>]*agent=["']([^"']+)["'][^>]*function=["']([^"']+)["'][^>]*\/>/gi;
		const subtasks: WorkflowNode[] = [];
		let callMatch;

		while ((callMatch = callRegex.exec(parallelContent)) !== null) {
			const agent = callMatch[1];
			const func = callMatch[2];

			subtasks.push({
				id: `${parallelId}_${sanitizeId(agent)}`,
				type: "agent_call",
				name: `${agent}.${func}`,
			});
		}

		if (subtasks.length > 0) {
			nodes.push({
				id: parallelId,
				type: "parallel",
				name: "Parallel Tasks",
				subtasks,
			});
		}
	}

	return {
		id: sanitizeId(name),
		name,
		description: "Generated from POML",
		platform: "kestra",
		nodes,
		edges,
		variables,
		triggers,
	};
}

/**
 * Parse n8n workflow JSON to WorkflowDefinition
 */
export function parseN8nWorkflow(n8nJson: any): WorkflowDefinition {
	const nodes: WorkflowNode[] = [];
	const edges: Array<{ from: string; to: string }> = [];

	// Parse n8n nodes
	if (n8nJson.nodes && Array.isArray(n8nJson.nodes)) {
		n8nJson.nodes.forEach((n8nNode: any) => {
			nodes.push({
				id: n8nNode.name || n8nNode.id || `node_${nodes.length}`,
				type: n8nNode.type || "unknown",
				name: n8nNode.name || n8nNode.type || "Unnamed",
				description: n8nNode.notes,
				disabled: n8nNode.disabled,
				properties: n8nNode.parameters || {},
			});
		});
	}

	// Parse n8n connections
	if (n8nJson.connections && typeof n8nJson.connections === "object") {
		Object.entries(n8nJson.connections).forEach(
			([sourceNode, connections]: [string, any]) => {
				if (connections.main && Array.isArray(connections.main)) {
					connections.main.forEach((connArray: any[]) => {
						connArray.forEach((conn: any) => {
							if (conn.node) {
								edges.push({
									from: sourceNode,
									to: conn.node,
								});
							}
						});
					});
				}
			},
		);
	}

	return {
		id: n8nJson.id || "n8n_workflow",
		name: n8nJson.name || "n8n Workflow",
		description: n8nJson.meta?.description,
		platform: "n8n",
		nodes,
		edges,
	};
}

/**
 * Parse Make.com scenario to WorkflowDefinition
 */
export function parseMakeScenario(makeJson: any): WorkflowDefinition {
	const nodes: WorkflowNode[] = [];
	const edges: Array<{ from: string; to: string }> = [];

	// Parse Make modules
	if (makeJson.modules && Array.isArray(makeJson.modules)) {
		makeJson.modules.forEach((module: any, idx: number) => {
			const moduleId = `module_${module.id || idx + 1}`;

			nodes.push({
				id: moduleId,
				type: module.module || "unknown",
				name: module.mapper?.name || module.module || "Unnamed Module",
				description: module.note,
				properties: module.mapper || {},
			});

			// Connect sequential modules
			if (idx > 0) {
				edges.push({
					from: `module_${makeJson.modules[idx - 1].id || idx}`,
					to: moduleId,
				});
			}
		});
	}

	// Parse routes (branching in Make)
	if (makeJson.routes && Array.isArray(makeJson.routes)) {
		makeJson.routes.forEach((route: any) => {
			if (route.flow && Array.isArray(route.flow)) {
				route.flow.forEach((connection: any) => {
					if (connection.src && connection.tgt) {
						edges.push({
							from: `module_${connection.src}`,
							to: `module_${connection.tgt}`,
							label: connection.label,
						});
					}
				});
			}
		});
	}

	return {
		id: makeJson.id || "make_scenario",
		name: makeJson.name || "Make Scenario",
		description: makeJson.note,
		platform: "make",
		nodes,
		edges,
	};
}

/**
 * Parse Kestra YAML to WorkflowDefinition
 * Note: This expects pre-parsed YAML as JS object
 */
export function parseKestraWorkflow(kestraObj: any): WorkflowDefinition {
	const nodes: WorkflowNode[] = [];
	const edges: Array<{ from: string; to: string }> = [];
	const triggers: Array<{
		id: string;
		type: string;
		properties: Record<string, any>;
	}> = [];

	// Parse triggers
	if (kestraObj.triggers && Array.isArray(kestraObj.triggers)) {
		kestraObj.triggers.forEach((trigger: any) => {
			triggers.push({
				id: trigger.id || `trigger_${triggers.length + 1}`,
				type: trigger.type || "unknown",
				properties: { ...trigger },
			});
		});
	}

	// Parse tasks recursively
	function parseTasks(tasks: any[], parentId?: string) {
		tasks.forEach((task: any, idx: number) => {
			const node: WorkflowNode = {
				id: task.id || `task_${nodes.length + 1}`,
				type: task.type || "unknown",
				name: task.id || `Task ${idx + 1}`,
				description: task.description,
				disabled: task.disabled,
				properties: { ...task },
				retry: task.retry,
				timeout: task.timeout,
			};

			// Handle flowable tasks
			if (task.tasks && Array.isArray(task.tasks)) {
				node.subtasks = [];
				parseTasks(task.tasks, node.id);
			}

			// Handle switch cases
			if (task.cases && typeof task.cases === "object") {
				node.cases = Object.entries(task.cases).map(([label, targetId]) => ({
					label,
					targetTaskId: targetId as string,
				}));
			}

			nodes.push(node);

			// Connect to parent or previous task
			if (parentId) {
				edges.push({ from: parentId, to: node.id });
			} else if (idx > 0) {
				edges.push({ from: tasks[idx - 1].id || `task_${idx}`, to: node.id });
			}
		});
	}

	if (kestraObj.tasks && Array.isArray(kestraObj.tasks)) {
		parseTasks(kestraObj.tasks);
	}

	return {
		id: kestraObj.id || "kestra_flow",
		name: kestraObj.id || "Kestra Flow",
		description: kestraObj.description,
		namespace: kestraObj.namespace,
		platform: "kestra",
		nodes,
		edges,
		triggers,
		variables: kestraObj.variables,
		inputs: kestraObj.inputs,
		outputs: kestraObj.outputs,
		errors: kestraObj.errors,
		retry: kestraObj.retry,
		concurrencyLimit: kestraObj.concurrencyLimits?.executions,
	};
}

/**
 * Main function: Generate Mermaid diagram from any workflow format
 */
export function generateWorkflowMermaid(
	input: string | any,
	platform: "n8n" | "make" | "kestra" | "poml",
): string {
	let workflow: WorkflowDefinition;

	try {
		if (platform === "poml" && typeof input === "string") {
			workflow = parsePOMLToWorkflow(input, "kestra");
		} else if (platform === "n8n") {
			const json = typeof input === "string" ? JSON.parse(input) : input;
			workflow = parseN8nWorkflow(json);
		} else if (platform === "make") {
			const json = typeof input === "string" ? JSON.parse(input) : input;
			workflow = parseMakeScenario(json);
		} else if (platform === "kestra") {
			const obj = typeof input === "string" ? JSON.parse(input) : input;
			workflow = parseKestraWorkflow(obj);
		} else {
			throw new Error(`Unsupported platform: ${platform}`);
		}

		return generateMermaidDiagram(workflow);
	} catch (error) {
		console.error("Error generating Mermaid diagram:", error);

		// Fallback simple diagram
		return `graph TD
    Start([▶ Start])
    Error>"❌ Error: ${error instanceof Error ? error.message : "Failed to parse workflow"}"]
    Start --> Error
    Error --> End([■ End])
    
    classDef startNode fill:#10b981,stroke:#34d399,color:#fff
    classDef endNode fill:#ef4444,stroke:#f87171,color:#fff
    class Start startNode
    class End endNode
    style Error fill:#dc2626,stroke:#ef4444,color:#fff`;
	}
}

/**
 * Validate workflow definition for common issues
 */
export function validateWorkflow(workflow: WorkflowDefinition): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check for required fields
	if (!workflow.id) errors.push("Missing workflow ID");
	if (!workflow.name) errors.push("Missing workflow name");
	if (!workflow.nodes || workflow.nodes.length === 0) {
		warnings.push("No nodes defined in workflow");
	}

	// Check for orphaned nodes (no incoming or outgoing edges)
	if (workflow.edges.length > 0) {
		const nodesWithEdges = new Set<string>();
		workflow.edges.forEach((edge) => {
			nodesWithEdges.add(edge.from);
			nodesWithEdges.add(edge.to);
		});

		workflow.nodes.forEach((node) => {
			if (!nodesWithEdges.has(node.id)) {
				warnings.push(`Node "${node.name}" (${node.id}) has no connections`);
			}
		});
	}

	// Check for circular dependencies (basic check)
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	function hasCycle(nodeId: string): boolean {
		if (recursionStack.has(nodeId)) return true;
		if (visited.has(nodeId)) return false;

		visited.add(nodeId);
		recursionStack.add(nodeId);

		const outgoing = workflow.edges.filter((e) => e.from === nodeId);
		for (const edge of outgoing) {
			if (hasCycle(edge.to)) return true;
		}

		recursionStack.delete(nodeId);
		return false;
	}

	workflow.nodes.forEach((node) => {
		if (hasCycle(node.id)) {
			errors.push(`Circular dependency detected involving node "${node.name}"`);
		}
	});

	// Check for unknown node types
	const knownTypes = [
		"trigger",
		"webhook",
		"schedule",
		"http",
		"function",
		"script",
		"switch",
		"router",
		"if",
		"parallel",
		"foreach",
		"loop",
		"subflow",
		"phase",
		"task",
		"agent_call",
		"error",
		"catch",
	];

	workflow.nodes.forEach((node) => {
		const typeMatch = knownTypes.some((known) =>
			node.type.toLowerCase().includes(known),
		);

		if (!typeMatch) {
			warnings.push(
				`Unknown node type "${node.type}" for node "${node.name}" - may need manual review`,
			);
		}
	});

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
