# Agent2Agent (A2A) Protocol - DealScale Implementation

## Overview
Documentation for implementing the Agent2Agent (A2A) Protocol in DealScale's backend, enabling multi-agent collaboration and task delegation.

## What's in This Directory

### 1. **Implementation Plan** (`a2a-implementation-plan.md`)
Comprehensive plan for integrating A2A into DealScale:
- ✅ Architecture overview
- ✅ Agent card definitions
- ✅ Task lifecycle management
- ✅ Security & authentication
- ✅ Multi-tenant isolation
- ✅ Observability & metrics
- ✅ Deployment strategies
- ✅ 6-phase implementation timeline

### 2. **Best Practices** (`a2a-best-practices.md`)
Production-ready best practices based on Google's guidelines:
- ✅ 10 key best practices
- ✅ Agent design patterns
- ✅ Security checklist
- ✅ Scalability strategies
- ✅ Testing approaches
- ✅ Monitoring & alerting
- ✅ Real code examples

## Quick Start

### The Problem A2A Solves

**Before A2A (Manual Orchestration):**
```
User Request → Orchestrator → DataEngineer (manual)
                           → AudienceArchitect (manual)
                           → CampaignOrchestrator (manual)
```
- Central orchestrator must know all agent details
- Tight coupling between components
- Hard to add new agents
- No agent-to-agent collaboration

**After A2A (Agent Collaboration):**
```
User Request → CampaignOrchestrator
                   ↓ (A2A)
               AudienceArchitect
                   ↓ (A2A)
               DataEngineer
                   ↓ (MCP)
               Apollo API
```
- Agents discover and call each other
- Loose coupling via protocol
- Easy to add/swap agents
- Agents collaborate autonomously

## DealScale Agent Ecosystem

### Core Agents

| Agent | Purpose | Capabilities | Tools (via MCP) |
|-------|---------|-------------|----------------|
| **DataEngineer** | Data enrichment & quality | `enrichLeads`, `dedupeLeads` | Apollo, Clearbit, ZoomInfo |
| **AudienceArchitect** | Scoring & segmentation | `scoreLookalike`, `filterProspects` | ML models, analytics DB |
| **CampaignOrchestrator** | Campaign management | `launchCampaign`, `trackMetrics` | n8n, Make, email APIs |
| **WorkflowAutomation** | Workflow execution | `createWorkflow`, `executeFlow` | n8n, Make, Kestra |

### Example Flow

```typescript
// User creates campaign
const campaign = await campaignOrchestrator.createCampaign({
  name: "Q1 Tech Executives",
  seedLeads: ["lead-1", "lead-2"],
  tenantId: "acme",
});

// CampaignOrchestrator delegates to AudienceArchitect (A2A)
const audience = await a2a.call({
  targetAgent: "AudienceArchitect",
  task: "scoreLookalike",
  inputs: { seedLeads: campaign.seedLeads },
});

// AudienceArchitect delegates to DataEngineer (A2A)
const enrichedData = await a2a.call({
  targetAgent: "DataEngineer",
  task: "enrichLeads",
  inputs: { leadIds: audience.candidateLeads },
});

// DataEngineer calls Apollo API (MCP)
const apolloData = await mcp.call("apollo", "bulkEnrich", {
  leads: enrichedData.leadIds,
});
```

## Key Concepts

### Agent Card
JSON metadata describing agent capabilities:
```json
{
  "agentId": "DataEngineer",
  "version": "2.1.0",
  "endpoint": "https://agents.dealscale.io/data-engineer",
  "capabilities": [
    {
      "id": "enrichLeads",
      "description": "Enrich leads with third-party data",
      "creditsPerLead": 2,
      "estimatedDuration": "30-120s"
    }
  ]
}
```

### Task
Unit of work sent from one agent to another:
```json
{
  "taskId": "task-abc123",
  "type": "enrichLeads",
  "status": "working",
  "inputs": {
    "leadIds": ["lead-1", "lead-2"],
    "provider": "apollo",
    "tenantId": "acme"
  },
  "tenantId": "acme",
  "requesterAgentId": "AudienceArchitect",
  "targetAgentId": "DataEngineer"
}
```

### Task States
```
submitted → working → completed
                   ↘ failed
                   ↘ cancelled
                   ↘ timeout
```

## A2A vs MCP

| Aspect | A2A Protocol | MCP Protocol |
|--------|-------------|--------------|
| **Purpose** | Agent-to-agent | Agent-to-tools |
| **Example** | AudienceArchitect → DataEngineer | DataEngineer → Apollo API |
| **Direction** | Horizontal (peer-to-peer) | Vertical (agent-to-resource) |
| **In DealScale** | Inter-agent delegation | External API calls |
| **Standard** | Google, Microsoft | Anthropic |

**Both are complementary** - use them together!

## Implementation Phases

### ✅ Phase 1: Foundation (Week 1-2)
- Define agent cards
- Implement agent registry
- Set up JWT authentication
- Create task models

### ✅ Phase 2: Core Features (Week 3-4)
- Task lifecycle
- Streaming updates
- Retry logic
- Credit tracking

### ✅ Phase 3: Observability (Week 5)
- Prometheus metrics
- Audit logging
- User dashboard

### ✅ Phase 4: Security (Week 6)
- Input validation
- Rate limiting
- GDPR compliance

### ✅ Phase 5: Testing (Week 7)
- Unit tests
- Integration tests
- Load tests

### ✅ Phase 6: Production (Week 8)
- Staging deployment
- Beta testing
- Production rollout

## Code Examples

### Calling Agent from Agent

```typescript
// AudienceArchitect calls DataEngineer
const enrichTask = await this.a2aClient.createTask({
  targetAgentId: 'DataEngineer',
  type: 'enrichLeads',
  inputs: {
    leadIds: this.candidateLeads,
    provider: 'apollo',
    tenantId: this.tenantId,
  },
  deadline: Date.now() + 60000, // 60s timeout
});

// Wait for result
const result = await this.a2aClient.waitForTask(enrichTask.taskId);

if (result.status === 'completed') {
  this.enrichedLeads = result.outputs.enrichedLeads;
}
```

### Handling Task in Agent

```typescript
class DataEngineerAgent {
  async handleTask(task: A2ATask): Promise<A2ATaskResult> {
    // Validate tenant & auth
    await this.validateTenant(task.tenantId);
    
    // Check credits
    await creditManager.checkAndDeduct(
      task.tenantId,
      task.type,
      task.inputs.leadIds.length * 2
    );
    
    // Update status
    await taskManager.updateStatus(task.taskId, 'working');
    
    try {
      // Execute via MCP
      const apolloData = await this.mcpClient.call('apollo', 'bulkEnrich', {
        leads: task.inputs.leadIds,
      });
      
      return {
        taskId: task.taskId,
        status: 'completed',
        outputs: { enrichedLeads: apolloData },
        creditsUsed: task.inputs.leadIds.length * 2,
      };
    } catch (error) {
      return {
        taskId: task.taskId,
        status: 'failed',
        error: { code: 'ENRICHMENT_FAILED', message: error.message },
      };
    }
  }
}
```

## Security Checklist

- [ ] HTTPS with TLS 1.3+
- [ ] JWT authentication for all A2A calls
- [ ] Input validation (Zod/Pydantic schemas)
- [ ] Tenant isolation (row-level security)
- [ ] Rate limiting per agent per tenant
- [ ] Audit logging for all tasks
- [ ] Credit enforcement before task execution
- [ ] Data encryption at rest and in transit
- [ ] GDPR compliance (data retention, right to delete)
- [ ] Security headers (CORS, CSP, HSTS)

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Task latency (p50) | < 2s | TBD |
| Task latency (p99) | < 10s | TBD |
| Throughput | 1000 tasks/min | TBD |
| Error rate | < 1% | TBD |
| Availability | 99.9% | TBD |

## Monitoring Queries

```promql
# Task success rate
sum(rate(dealscale_a2a_tasks_total{status="completed"}[5m]))
/
sum(rate(dealscale_a2a_tasks_total[5m]))

# Average task duration by agent
histogram_quantile(0.5,
  rate(dealscale_a2a_task_duration_seconds_bucket[5m])
) by (agent_id)

# Error rate by agent
sum(rate(dealscale_a2a_tasks_total{status="failed"}[5m])) by (agent_id)

# Credits used per tenant
sum(rate(dealscale_a2a_credits_used_total[1h])) by (tenant_id)
```

## Common Patterns

### 1. Request-Reply (Synchronous)
```typescript
const result = await a2a.call(agent, task);
```

### 2. Fire-and-Forget (Async)
```typescript
await a2a.submit(agent, task);
// Task runs in background
```

### 3. Streaming Progress
```typescript
const stream = a2a.stream(agent, task);
for await (const update of stream) {
  console.log(`Progress: ${update.progress * 100}%`);
}
```

### 4. Parallel Execution
```typescript
const results = await Promise.all([
  a2a.call('DataEngineer', taskA),
  a2a.call('DataEngineer', taskB),
  a2a.call('DataEngineer', taskC),
]);
```

## Troubleshooting

**Issue: Tasks timing out**
- Check agent health endpoints
- Verify network connectivity
- Increase deadline/timeout values
- Check agent logs for errors

**Issue: Authentication failures**
- Verify JWT token is valid and not expired
- Check agent has correct scopes
- Ensure tenant ID matches

**Issue: Credit deduction errors**
- Verify tenant has sufficient credits
- Check credit calculation logic
- Review credit usage logs

## Next Steps

1. Read **Implementation Plan** for detailed architecture
2. Review **Best Practices** for production guidelines
3. Set up dev environment with agent registry
4. Implement first agent (DataEngineer)
5. Test A2A calls in staging
6. Deploy to production with monitoring

## Related Documentation

- [MCP Integration](../../integration/ai-agents/mcp-provider-integration.md)
- [Multi-Provider Strategy](../../integration/ai-agents/multi-provider-strategy.md)
- [Domain Architecture](../../architecture/domains-and-auth.md)

## Support

- **Email**: a2a-support@dealscale.io
- **Docs**: https://docs.dealscale.io/a2a
- **GitHub**: https://github.com/dealscale/a2a-implementation

---

**Last Updated:** 2025-01-07  
**Status:** 📝 Planning Phase  
**Target:** Q1 2025 Launch


















