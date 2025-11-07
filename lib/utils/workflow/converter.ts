/**
 * Workflow Converter Utilities
 * Converts POML workflow definitions to platform-specific formats
 */

export interface WorkflowMetadata {
	triggers: string[];
	tasks: string[];
	variables: string[];
}

/**
 * Extract workflow metadata from POML
 */
export function extractWorkflowMetadata(poml: string): WorkflowMetadata {
	const triggers: string[] = [];
	const tasks: string[] = [];
	const variables: string[] = [];

	// Extract triggers: <trigger>...</trigger>
	const triggerRegex = /<trigger[^>]*>([\s\S]*?)<\/trigger>/gi;
	let triggerMatch;
	while ((triggerMatch = triggerRegex.exec(poml)) !== null) {
		triggers.push(triggerMatch[1].trim());
	}

	// Extract tasks/phases: <phase>...</phase> or <task>...</task>
	const phaseRegex = /<(?:phase|task)[^>]*>([\s\S]*?)<\/(?:phase|task)>/gi;
	let phaseMatch;
	while ((phaseMatch = phaseRegex.exec(poml)) !== null) {
		tasks.push(phaseMatch[1].trim());
	}

	// Extract variables: {{variable}}
	const variableRegex = /\{\{(\w+)\}\}/g;
	let varMatch;
	while ((varMatch = variableRegex.exec(poml)) !== null) {
		if (!variables.includes(varMatch[1])) {
			variables.push(varMatch[1]);
		}
	}

	return { triggers, tasks, variables };
}

/**
 * Convert POML to n8n workflow JSON
 */
export function convertPOMLToN8n(poml: string): any {
	const metadata = extractWorkflowMetadata(poml);

	// Basic n8n workflow structure
	const workflow: any = {
		name: "Workflow from POML",
		nodes: [],
		connections: {},
		active: false,
		settings: {},
		tags: ["poml-generated"],
	};

	let nodeId = 1;
	const nodeMap: Record<string, number> = {};

	// Create trigger node
	if (metadata.triggers.length > 0) {
		workflow.nodes.push({
			parameters: {
				triggerOn: "webhook",
				path: "poml-trigger",
			},
			name: "Webhook Trigger",
			type: "n8n-nodes-base.webhook",
			typeVersion: 1,
			position: [250, 300],
			id: `node-${nodeId}`,
		});
		nodeMap.trigger = nodeId++;
	}

	// Create task nodes
	metadata.tasks.forEach((task, idx) => {
		const taskNode = {
			parameters: {
				functionCode: `// Task: ${task}\nreturn items;`,
			},
			name: `Task ${idx + 1}`,
			type: "n8n-nodes-base.function",
			typeVersion: 1,
			position: [250 + (idx + 1) * 200, 300],
			id: `node-${nodeId}`,
		};
		workflow.nodes.push(taskNode);
		nodeMap[`task-${idx}`] = nodeId++;
	});

	// Create connections
	if (metadata.triggers.length > 0 && metadata.tasks.length > 0) {
		workflow.connections = {
			"Webhook Trigger": {
				main: [[{ node: "Task 1", type: "main", index: 0 }]],
			},
		};

		// Chain tasks
		for (let i = 0; i < metadata.tasks.length - 1; i++) {
			workflow.connections[`Task ${i + 1}`] = {
				main: [[{ node: `Task ${i + 2}`, type: "main", index: 0 }]],
			};
		}
	}

	return workflow;
}

/**
 * Convert POML to Make.com (Integromat) scenario JSON
 */
export function convertPOMLToMake(poml: string): any {
	const metadata = extractWorkflowMetadata(poml);

	// Basic Make.com scenario structure
	const scenario: any = {
		name: "Workflow from POML",
		flow: [],
		connections: [],
		metadata: {
			version: 1,
			scenario: {
				roundtrips: 1,
				maxErrors: 3,
				autoCommit: true,
				sequential: false,
				confidential: false,
			},
		},
	};

	let moduleId = 1;

	// Create trigger module
	if (metadata.triggers.length > 0) {
		scenario.flow.push({
			id: moduleId++,
			module: "gateway:CustomWebHook",
			version: 1,
			parameters: {
				hook: `poml-trigger-${Date.now()}`,
			},
			mapper: {},
			metadata: {
				designer: {
					x: 0,
					y: 0,
				},
			},
		});
	}

	// Create task modules
	metadata.tasks.forEach((task, idx) => {
		scenario.flow.push({
			id: moduleId++,
			module: "util:TextAggregator",
			version: 1,
			parameters: {},
			mapper: {
				text: `Task: ${task}`,
			},
			metadata: {
				designer: {
					x: (idx + 1) * 300,
					y: 0,
				},
			},
		});
	});

	// Create connections
	for (let i = 0; i < scenario.flow.length - 1; i++) {
		scenario.connections.push({
			id: i + 1,
			sourceModuleId: i + 1,
			targetModuleId: i + 2,
			sourceOutputIndex: 0,
			targetInputIndex: 0,
		});
	}

	return scenario;
}

/**
 * Convert POML to Kestra workflow YAML (returned as string)
 */
export function convertPOMLToKestra(poml: string): string {
	const metadata = extractWorkflowMetadata(poml);

	// Build Kestra YAML
	let yaml = `id: workflow-from-poml
namespace: dealscale

description: Workflow generated from POML

`;

	// Add variables
	if (metadata.variables.length > 0) {
		yaml += `inputs:
`;
		metadata.variables.forEach((variable) => {
			yaml += `  - name: ${variable}
    type: STRING
    required: false
`;
		});
		yaml += `
`;
	}

	// Add tasks
	yaml += `tasks:
`;

	// Add trigger task
	if (metadata.triggers.length > 0) {
		yaml += `  - id: trigger_task
    type: io.kestra.core.tasks.log.Log
    message: "Workflow triggered: ${metadata.triggers[0]}"

`;
	}

	// Add workflow tasks
	metadata.tasks.forEach((task, idx) => {
		yaml += `  - id: task_${idx + 1}
    type: io.kestra.core.tasks.scripts.Bash
    commands:
      - echo "Executing: ${task.replace(/"/g, '\\"')}"
`;
	});

	// Add triggers
	if (metadata.triggers.length > 0) {
		yaml += `
triggers:
  - id: webhook_trigger
    type: io.kestra.core.models.triggers.types.Webhook
`;
	}

	return yaml;
}
