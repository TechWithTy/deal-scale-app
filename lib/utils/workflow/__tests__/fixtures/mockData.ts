/**
 * Mock Data for Workflow Mermaid Generator Tests
 * Real-world examples based on actual n8n, Make, and Kestra workflows
 */

import type { WorkflowDefinition } from "../../mermaidGenerator";

// ============================================================================
// POML Mock Data
// ============================================================================

export const mockPOMLSimple = `<poml version="1.0">
  <workflow name="Simple Pipeline">
    <trigger type="webhook">
      <event>lead.created</event>
    </trigger>
    <phase name="Process">
      <task>Enrich lead data</task>
    </phase>
    <phase name="Notify">
      <task>Send webhook</task>
    </phase>
  </workflow>
</poml>`;

export const mockPOMLWithVariables = `<poml>
  <workflow name="Variable Test">
    <phase name="Step1">
      <task>Process {{leadId}} and {{location}}</task>
    </phase>
  </workflow>
</poml>`;

export const mockPOMLWithParallel = `<poml>
  <workflow name="Parallel Test">
    <parallel>
      <call agent="CallAgent" function="makeCall" />
      <call agent="TextAgent" function="sendText" />
    </parallel>
  </workflow>
</poml>`;

export const mockPOMLComplex = `<poml version="1.0">
  <workflow name="Lead Enrichment Pipeline">
    <trigger type="webhook">
      <event>lead.created</event>
    </trigger>
    
    <phase name="enrichment">
      <task>{{enrichLead}} with premium data</task>
      <task>Validate email and phone</task>
    </phase>
    
    <phase name="notification">
      <task>{{sendWebhook}} to {{webhookUrl}}</task>
      <task>{{updateCRM}} with enriched data</task>
    </phase>
    
    <output>
      <return>enriched_lead_data</return>
    </output>
  </workflow>
</poml>`;

export const mockPOMLEmpty = "";

export const mockPOMLMalformed = "<workflow><phase name='Test'";

export const mockPOMLSpecialChars = `<phase name="Step 1 - Process & Validate!">
  <task>Do something</task>
</phase>`;

// ============================================================================
// n8n Mock Data
// ============================================================================

export const mockN8nSimpleWebhook = {
	id: "workflow_1",
	name: "Webhook to CRM",
	nodes: [
		{
			id: "webhook_1",
			name: "Webhook",
			type: "n8n-nodes-base.webhook",
			parameters: {
				path: "lead-created",
			},
		},
		{
			id: "http_1",
			name: "HTTP Request",
			type: "n8n-nodes-base.httpRequest",
			parameters: {
				url: "https://crm.example.com/api/leads",
				method: "POST",
			},
		},
	],
	connections: {
		Webhook: {
			main: [[{ node: "HTTP Request", type: "main", index: 0 }]],
		},
	},
};

export const mockN8nWithNotes = {
	nodes: [
		{
			name: "Start",
			type: "n8n-nodes-base.start",
			notes: "This is the entry point",
		},
	],
	connections: {},
};

export const mockN8nDisabledNode = {
	nodes: [
		{
			name: "DisabledNode",
			type: "n8n-nodes-base.httpRequest",
			disabled: true,
		},
	],
	connections: {},
};

export const mockN8nEmpty = {
	nodes: [],
	connections: {},
};

export const mockN8nComplexConnections = {
	nodes: [
		{ name: "Start", type: "start" },
		{ name: "Switch", type: "n8n-nodes-base.switch" },
		{ name: "Branch1", type: "httpRequest" },
		{ name: "Branch2", type: "httpRequest" },
	],
	connections: {
		Start: {
			main: [[{ node: "Switch" }]],
		},
		Switch: {
			main: [[{ node: "Branch1" }], [{ node: "Branch2" }]],
		},
	},
};

export const mockN8nNoNames = {
	nodes: [
		{
			id: "node_1",
			type: "n8n-nodes-base.httpRequest",
		},
	],
	connections: {},
};

export const mockN8nLeadEnrichment = {
	id: "n8n_lead_enrichment",
	name: "Lead Enrichment Pipeline",
	nodes: [
		{
			name: "Webhook",
			type: "n8n-nodes-base.webhook",
			parameters: { path: "lead-created" },
		},
		{
			name: "Skip Trace API",
			type: "n8n-nodes-base.httpRequest",
			parameters: { url: "https://skiptrace.api/enrich", method: "POST" },
			retryOnFail: true,
			maxTries: 3,
		},
		{
			name: "Validate Email",
			type: "n8n-nodes-base.emailSend",
		},
		{
			name: "Update CRM",
			type: "n8n-nodes-base.httpRequest",
			parameters: { url: "https://crm.example.com/api/leads", method: "PUT" },
		},
		{
			name: "Error Handler",
			type: "n8n-nodes-base.errorTrigger",
		},
	],
	connections: {
		Webhook: { main: [[{ node: "Skip Trace API" }]] },
		"Skip Trace API": { main: [[{ node: "Validate Email" }]] },
		"Validate Email": { main: [[{ node: "Update CRM" }]] },
	},
};

// ============================================================================
// Make.com Mock Data
// ============================================================================

export const mockMakeSimpleWebhook = {
	id: "scenario_1",
	name: "Webhook to Slack",
	modules: [
		{
			id: 1,
			module: "builtin:WebhookRespond",
			mapper: {
				name: "Webhook Trigger",
			},
		},
		{
			id: 2,
			module: "slack:CreateMessage",
			mapper: {
				name: "Send to Slack",
				channel: "#general",
			},
		},
	],
};

export const mockMakeWithRoutes = {
	id: "scenario_2",
	name: "Router Test",
	modules: [
		{ id: 1, module: "webhook", mapper: { name: "Start" } },
		{ id: 2, module: "router", mapper: { name: "Router" } },
		{ id: 3, module: "http", mapper: { name: "Branch A" } },
		{ id: 4, module: "http", mapper: { name: "Branch B" } },
	],
	routes: [
		{
			flow: [
				{ src: 1, tgt: 2 },
				{ src: 2, tgt: 3, label: "Route A" },
				{ src: 2, tgt: 4, label: "Route B" },
			],
		},
	],
};

export const mockMakeEmpty = {
	modules: [],
};

export const mockMakeNoNames = {
	modules: [
		{
			id: 1,
			module: "builtin:BasicTrigger",
		},
	],
};

export const mockMakeWithNote = {
	note: "This is a test scenario for validation",
	modules: [{ id: 1, module: "webhook" }],
};

export const mockMakeCampaign = {
	id: "make_campaign",
	name: "Multi-Channel Campaign",
	modules: [
		{ id: 1, module: "trigger", mapper: { name: "Campaign Start" } },
		{ id: 2, module: "router", mapper: { name: "Channel Router" } },
		{ id: 3, module: "twilio:sendSMS", mapper: { name: "Send SMS" } },
		{ id: 4, module: "smtp:sendEmail", mapper: { name: "Send Email" } },
		{ id: 5, module: "vapi:makeCall", mapper: { name: "Make Call" } },
	],
};

// ============================================================================
// Kestra Mock Data
// ============================================================================

export const mockKestraSimpleSchedule = {
	id: "daily_sync",
	namespace: "dealscale",
	description: "Daily CRM synchronization",
	triggers: [
		{
			id: "schedule",
			type: "io.kestra.plugin.core.trigger.Schedule",
			cron: "0 0 * * *",
		},
	],
	tasks: [
		{
			id: "fetch_leads",
			type: "io.kestra.plugin.scripts.python.Script",
			description: "Fetch leads from database",
		},
		{
			id: "sync_crm",
			type: "io.kestra.plugin.core.http.Request",
			description: "Sync to CRM",
		},
	],
};

export const mockKestraParallel = {
	id: "parallel_test",
	tasks: [
		{
			id: "parallel_phase",
			type: "io.kestra.plugin.core.flow.Parallel",
			tasks: [
				{ id: "task_a", type: "script" },
				{ id: "task_b", type: "script" },
			],
		},
	],
};

export const mockKestraSwitch = {
	id: "switch_test",
	tasks: [
		{
			id: "decision",
			type: "io.kestra.plugin.core.flow.Switch",
			cases: {
				"Case A": "task_a",
				"Case B": "task_b",
			},
		},
	],
};

export const mockKestraWithRetry = {
	id: "retry_test",
	retry: {
		maxAttempts: 3,
		interval: "PT1M",
	},
	tasks: [
		{
			id: "http_call",
			type: "io.kestra.plugin.core.http.Request",
			retry: {
				maxAttempts: 5,
				type: "exponential",
			},
		},
	],
};

export const mockKestraEmpty = {
	id: "empty",
	tasks: [],
};

export const mockKestraDisabled = {
	id: "disabled_test",
	tasks: [
		{
			id: "task_1",
			type: "script",
			disabled: true,
		},
	],
};

export const mockKestraWithVarsInputs = {
	id: "vars_test",
	variables: {
		apiKey: "secret_123",
		endpoint: "https://api.example.com",
	},
	inputs: [
		{
			name: "leadId",
			type: "STRING",
			description: "Lead identifier",
		},
	],
	tasks: [],
};

export const mockKestraDataPipeline = {
	id: "data_pipeline",
	namespace: "dealscale.pipelines",
	tasks: [
		{
			id: "batch_processor",
			type: "io.kestra.plugin.core.flow.ForEachItem",
			items: "{{ leads }}",
			tasks: [
				{ id: "enrich", type: "script" },
				{ id: "validate", type: "http" },
			],
		},
		{
			id: "final_sync",
			type: "io.kestra.plugin.core.http.Request",
		},
	],
};

// ============================================================================
// WorkflowDefinition Mocks for Validation Tests
// ============================================================================

export const mockWorkflowValid: WorkflowDefinition = {
	id: "test_workflow",
	name: "Test Workflow",
	platform: "kestra",
	nodes: [
		{ id: "task1", type: "http", name: "Task 1" },
		{ id: "task2", type: "script", name: "Task 2" },
	],
	edges: [{ from: "task1", to: "task2" }],
};

export const mockWorkflowMissingId: WorkflowDefinition = {
	id: "",
	name: "Test",
	platform: "n8n",
	nodes: [],
	edges: [],
};

export const mockWorkflowOrphaned: WorkflowDefinition = {
	id: "orphan_test",
	name: "Orphan Test",
	platform: "make",
	nodes: [
		{ id: "task1", type: "http", name: "Task 1" },
		{ id: "task2", type: "http", name: "Task 2" },
		{ id: "orphan", type: "http", name: "Orphan Task" },
	],
	edges: [{ from: "task1", to: "task2" }],
};

export const mockWorkflowCircular: WorkflowDefinition = {
	id: "circular_test",
	name: "Circular Test",
	platform: "kestra",
	nodes: [
		{ id: "task1", type: "http", name: "Task 1" },
		{ id: "task2", type: "http", name: "Task 2" },
		{ id: "task3", type: "http", name: "Task 3" },
	],
	edges: [
		{ from: "task1", to: "task2" },
		{ from: "task2", to: "task3" },
		{ from: "task3", to: "task1" }, // Circular!
	],
};

export const mockWorkflowUnknownType: WorkflowDefinition = {
	id: "unknown_test",
	name: "Unknown Node Test",
	platform: "n8n",
	nodes: [
		{ id: "task1", type: "custom.unknown.plugin.v2", name: "Unknown Task" },
	],
	edges: [],
};

export const mockWorkflowWithShapes: WorkflowDefinition = {
	id: "shapes_test",
	name: "Shapes Test",
	platform: "kestra",
	nodes: [
		{ id: "webhook", type: "webhook", name: "Webhook Trigger" },
		{ id: "decision", type: "switch", name: "Decision" },
		{ id: "parallel", type: "parallel", name: "Parallel Tasks" },
		{ id: "loop", type: "foreach", name: "Loop" },
		{ id: "error", type: "error", name: "Error Handler" },
	],
	edges: [
		{ from: "webhook", to: "decision" },
		{ from: "decision", to: "parallel" },
		{ from: "parallel", to: "loop" },
	],
};

export const mockWorkflowWithRetry: WorkflowDefinition = {
	id: "retry_indicator",
	name: "Retry Indicator Test",
	platform: "kestra",
	nodes: [
		{
			id: "task1",
			type: "http",
			name: "HTTP Call",
			retry: { maxAttempts: 3 },
		},
	],
	edges: [],
};

export const mockWorkflowMultiTerminal: WorkflowDefinition = {
	id: "multi_terminal",
	name: "Multi Terminal",
	platform: "n8n",
	nodes: [
		{ id: "start_task", type: "webhook", name: "Start" },
		{ id: "branch_a", type: "http", name: "Branch A" },
		{ id: "branch_b", type: "http", name: "Branch B" },
	],
	edges: [
		{ from: "start_task", to: "branch_a" },
		{ from: "start_task", to: "branch_b" },
	],
};
