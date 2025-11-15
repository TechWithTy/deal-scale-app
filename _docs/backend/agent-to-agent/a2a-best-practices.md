# A2A Protocol Best Practices for DealScale

## Overview
Comprehensive best practices for implementing Agent2Agent (A2A) Protocol in production, based on Google's published guidelines and tailored for DealScale's multi-agent architecture.

## 1. Define Clear Agent Roles & Capabilities

### Agent Separation of Concerns

**✅ Good - Clear Boundaries:**
```
DataEngineer:      Lead enrichment, deduplication, data quality
AudienceArchitect: Scoring, segmentation, lookalike modeling
CampaignOrchestrator: Campaign creation, execution, tracking
WorkflowAutomation: n8n/Make/Kestra workflow management
```

**❌ Bad - Overlapping Responsibilities:**
```
Agent1: Lead enrichment + campaign creation
Agent2: Scoring + workflow execution
```

### Agent Card Example

```json
{
  "agentId": "AudienceArchitect",
  "version": "3.2.1",
  "name": "DealScale Audience Architect",
  "description": "AI agent for audience scoring, segmentation, and lookalike modeling",
  "endpoint": "https://agents.dealscale.io/audience-architect",
  "capabilities": [
    {
      "id": "scoreLookalike",
      "name": "Score Lookalike Audience",
      "description": "Score leads based on similarity to a seed list using ML models",
      "inputs": {
        "type": "object",
        "required": ["seedLeadIds", "candidateLeadIds", "tenantId"],
        "properties": {
          "seedLeadIds": {
            "type": "array",
            "items": { "type": "string" },
            "description": "IDs of high-quality seed leads"
          },
          "candidateLeadIds": {
            "type": "array",
            "items": { "type": "string" },
            "description": "IDs of leads to score"
          },
          "tenantId": {
            "type": "string",
            "description": "Tenant identifier for data isolation"
          },
          "modelVersion": {
            "type": "string",
            "default": "latest",
            "description": "ML model version to use"
          }
        }
      },
      "outputs": {
        "type": "object",
        "properties": {
          "scoredLeads": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "leadId": { "type": "string" },
                "score": { "type": "number", "minimum": 0, "maximum": 100 },
                "confidence": { "type": "number" },
                "factors": { "type": "array", "items": { "type": "string" } }
              }
            }
          },
          "modelMetrics": {
            "type": "object",
            "properties": {
              "precision": { "type": "number" },
              "recall": { "type": "number" },
              "f1Score": { "type": "number" }
            }
          }
        }
      },
      "estimatedDuration": "15-45s",
      "creditsPerLead": 0.5,
      "tags": ["ml", "scoring", "audience"]
    }
  ],
  "authentication": {
    "type": "bearer",
    "headerName": "Authorization",
    "required": true
  },
  "rateLimit": {
    "requestsPerMinute": 120,
    "burstSize": 200
  },
  "sla": {
    "availability": "99.9%",
    "maxLatency": "60s"
  },
  "tenantAware": true,
  "regions": ["us-east-1", "eu-west-1"],
  "status": "active",
  "maintainer": "dealscale-ai-team@dealscale.io",
  "documentation": "https://docs.dealscale.io/agents/audience-architect"
}
```

## 2. Secure Communication & Authentication

### Multi-Layer Security

```typescript
// 1. TLS Configuration
const httpsOptions = {
  cert: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/key.pem'),
  minVersion: 'TLSv1.3',
  ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256',
};

// 2. JWT Token Generation (for agent-to-agent auth)
function generateAgentToken(agentId: string, tenantId: string): string {
  return jwt.sign(
    {
      agentId,
      tenantId,
      scopes: ['a2a:call', 'a2a:receive'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    },
    process.env.A2A_JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

// 3. Request Validation
async function validateIncomingTask(task: A2ATask, authContext: AgentAuthContext) {
  // Validate task structure
  const schema = getTaskSchema(task.type);
  const validation = schema.safeParse(task);
  if (!validation.success) {
    throw new ValidationError('Invalid task structure', validation.error);
  }
  
  // Verify tenant access
  if (task.tenantId !== authContext.tenantId) {
    throw new UnauthorizedError('Tenant mismatch');
  }
  
  // Check agent permissions
  const callingAgent = await agentRegistry.getAgent(authContext.agentId);
  if (!callingAgent.scopes.includes('a2a:call')) {
    throw new ForbiddenError('Agent not authorized for A2A calls');
  }
  
  // Sanitize inputs (prevent injection attacks)
  task.inputs = sanitizeInputs(task.inputs);
  
  return task;
}

// 4. Audit Trail
interface AuditLogEntry {
  timestamp: Date;
  eventType: 'task_created' | 'task_completed' | 'task_failed' | 'unauthorized_access';
  callingAgentId: string;
  targetAgentId: string;
  taskId: string;
  taskType: string;
  tenantId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  inputHash: string;   // Hash of inputs (not full data)
  outputHash?: string;
  duration?: number;
  creditsUsed?: number;
  errorCode?: string;
  errorMessage?: string;
}

async function logAuditEvent(entry: AuditLogEntry) {
  // Store in audit database (write-only, append-only)
  await db.auditLogs.create({ data: entry });
  
  // Also send to SIEM for security monitoring
  await siem.send(entry);
}
```

## 3. Task Lifecycle & Streaming

### State Machine

```typescript
class A2ATaskStateMachine {
  private task: A2ATask;
  private eventBus: EventBus;
  
  async transition(newStatus: TaskStatus, metadata?: any) {
    const oldStatus = this.task.status;
    
    // Validate state transition
    if (!this.isValidTransition(oldStatus, newStatus)) {
      throw new Error(`Invalid transition: ${oldStatus} → ${newStatus}`);
    }
    
    // Update task
    this.task.status = newStatus;
    this.task.updatedAt = new Date();
    
    if (newStatus === 'completed') {
      this.task.completedAt = new Date();
      this.task.actualDuration = 
        (this.task.completedAt.getTime() - this.task.createdAt.getTime()) / 1000;
    }
    
    if (metadata) {
      this.task.metadata = { ...this.task.metadata, ...metadata };
    }
    
    // Save to database
    await db.tasks.update({
      where: { taskId: this.task.taskId },
      data: this.task,
    });
    
    // Emit event for streaming
    this.eventBus.emit(`task:${this.task.taskId}`, {
      taskId: this.task.taskId,
      status: newStatus,
      progress: this.calculateProgress(),
      metadata,
      timestamp: new Date(),
    });
    
    // Log transition
    console.log(`[A2A] Task ${this.task.taskId}: ${oldStatus} → ${newStatus}`);
  }
  
  private isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      submitted: ['working', 'failed', 'cancelled'],
      working: ['completed', 'failed', 'cancelled', 'timeout'],
      completed: [],
      failed: [],
      cancelled: [],
      timeout: [],
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
```

### Streaming Implementation

```typescript
// Server-Sent Events for real-time updates
import express from 'express';

app.get('/agents/:agentId/tasks/:taskId/stream', async (req, res) => {
  const { taskId } = req.params;
  const authContext = await validateA2ARequest(req);
  
  // Verify task belongs to this tenant
  const task = await db.tasks.findUnique({
    where: { taskId, tenantId: authContext.tenantId },
  });
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Setup SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  // Send initial state
  res.write(`data: ${JSON.stringify({ 
    taskId, 
    status: task.status, 
    progress: 0 
  })}\n\n`);
  
  // Subscribe to task events
  const unsubscribe = taskEventBus.subscribe(`task:${taskId}`, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    
    // Close stream when task is terminal
    if (['completed', 'failed', 'cancelled', 'timeout'].includes(event.status)) {
      unsubscribe();
      res.end();
    }
  });
  
  // Cleanup on client disconnect
  req.on('close', () => {
    unsubscribe();
    res.end();
  });
  
  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);
  
  req.on('close', () => clearInterval(heartbeat));
});
```

## 4. Multi-Tenant Implementation

### Row-Level Security

```typescript
// PostgreSQL Row-Level Security policies
/*
CREATE POLICY tenant_isolation ON leads
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation ON campaigns
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
*/

// Middleware to set tenant context
async function setTenantContext(req: Request, res: Response, next: NextFunction) {
  const authContext = await validateA2ARequest(req);
  
  // Set tenant context for this request
  await db.$executeRaw`SET LOCAL app.current_tenant = ${authContext.tenantId}`;
  
  req.tenantId = authContext.tenantId;
  next();
}

// All queries automatically filtered by tenant
const leads = await db.leads.findMany({
  // No need to specify tenantId - RLS handles it
  where: { fitScore: { gte: 80 } },
});
```

### Credit Tracking

```typescript
class CreditManager {
  async checkAndDeduct(
    tenantId: string,
    operation: string,
    estimatedCredits: number
  ): Promise<boolean> {
    const tenant = await db.tenants.findUnique({
      where: { id: tenantId },
      select: { creditsRemaining: true, plan: true },
    });
    
    if (tenant.creditsRemaining < estimatedCredits) {
      throw new InsufficientCreditsError(
        `Need ${estimatedCredits} credits, have ${tenant.creditsRemaining}`
      );
    }
    
    // Reserve credits (pessimistic locking)
    await db.tenants.update({
      where: { id: tenantId },
      data: {
        creditsReserved: { increment: estimatedCredits },
      },
    });
    
    return true;
  }
  
  async finalizeCredits(
    tenantId: string,
    taskId: string,
    actualCredits: number
  ) {
    // Release reservation and charge actual usage
    await db.$transaction([
      db.tenants.update({
        where: { id: tenantId },
        data: {
          creditsReserved: { decrement: actualCredits },
          creditsRemaining: { decrement: actualCredits },
          creditsUsed: { increment: actualCredits },
        },
      }),
      db.creditUsageLog.create({
        data: {
          tenantId,
          taskId,
          creditsUsed: actualCredits,
          operation: 'a2a_task',
          timestamp: new Date(),
        },
      }),
    ]);
  }
}
```

## 5. Orchestration Patterns

### Pattern 1: Sequential Agent Chain

```typescript
/**
 * Linear workflow: A → B → C
 * Example: Enrich → Score → Campaign
 */
async function sequentialAgentChain(
  seedLeads: string[],
  tenantId: string
): Promise<CampaignResult> {
  // Step 1: DataEngineer enriches leads
  const enrichTask = await a2aClient.createTask({
    targetAgentId: 'DataEngineer',
    type: 'enrichLeads',
    inputs: { leadIds: seedLeads, provider: 'apollo', tenantId },
  });
  
  const enrichResult = await a2aClient.waitForTask(enrichTask.taskId);
  
  if (enrichResult.status === 'failed') {
    throw new Error('Enrichment failed');
  }
  
  // Step 2: AudienceArchitect scores leads
  const scoreTask = await a2aClient.createTask({
    targetAgentId: 'AudienceArchitect',
    type: 'scoreLookalike',
    inputs: {
      seedLeadIds: enrichResult.outputs.enrichedLeadIds,
      candidateLeadIds: await getAllCandidateLeads(tenantId),
      tenantId,
    },
  });
  
  const scoreResult = await a2aClient.waitForTask(scoreTask.taskId);
  
  // Step 3: CampaignOrchestrator launches campaign
  const campaignTask = await a2aClient.createTask({
    targetAgentId: 'CampaignOrchestrator',
    type: 'launchCampaign',
    inputs: {
      audienceLeadIds: scoreResult.outputs.topScoredLeadIds,
      campaignName: 'Q1 Tech Executives',
      channels: ['email', 'linkedin'],
      tenantId,
    },
  });
  
  return await a2aClient.waitForTask(campaignTask.taskId);
}
```

### Pattern 2: Parallel Agent Execution

```typescript
/**
 * Parallel workflow: A → (B1 || B2 || B3) → C
 * Example: Enrich → (Apollo || Clearbit || ZoomInfo) → Merge
 */
async function parallelEnrichment(
  leadIds: string[],
  tenantId: string
): Promise<EnrichedLead[]> {
  // Step 1: Create tasks for all providers in parallel
  const tasks = await Promise.all([
    a2aClient.createTask({
      targetAgentId: 'DataEngineer',
      type: 'enrichLeads',
      inputs: { leadIds, provider: 'apollo', tenantId },
    }),
    a2aClient.createTask({
      targetAgentId: 'DataEngineer',
      type: 'enrichLeads',
      inputs: { leadIds, provider: 'clearbit', tenantId },
    }),
    a2aClient.createTask({
      targetAgentId: 'DataEngineer',
      type: 'enrichLeads',
      inputs: { leadIds, provider: 'zoominfo', tenantId },
    }),
  ]);
  
  // Step 2: Wait for all to complete (with timeout)
  const results = await Promise.allSettled(
    tasks.map(t => a2aClient.waitForTask(t.taskId, { timeout: 60000 }))
  );
  
  // Step 3: Merge results (best-effort)
  const enrichedData = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value.outputs);
  
  return mergeEnrichedData(enrichedData);
}
```

### Pattern 3: Agent Collaboration (Map-Reduce)

```typescript
/**
 * Map-Reduce: Distribute work, aggregate results
 * Example: Process 10K leads across multiple agent instances
 */
async function distributedEnrichment(
  leadIds: string[],
  tenantId: string
): Promise<EnrichedLead[]> {
  const BATCH_SIZE = 500;
  const batches = chunkArray(leadIds, BATCH_SIZE);
  
  // Map: Distribute to multiple DataEngineer instances
  const tasks = batches.map((batch, index) => 
    a2aClient.createTask({
      targetAgentId: 'DataEngineer',
      instanceId: `instance-${index % 5}`, // Load balance across 5 instances
      type: 'enrichLeads',
      inputs: { leadIds: batch, provider: 'apollo', tenantId },
    })
  );
  
  // Wait for all batches
  const results = await Promise.all(
    tasks.map(t => a2aClient.waitForTask(t.taskId))
  );
  
  // Reduce: Merge results
  return results.flatMap(r => r.outputs.enrichedLeads);
}
```

## 6. Error Handling Strategies

### Graceful Degradation

```typescript
async function enrichWithFallback(
  leadIds: string[],
  tenantId: string
): Promise<EnrichedLead[]> {
  const providers = ['apollo', 'clearbit', 'zoominfo'];
  
  for (const provider of providers) {
    try {
      const task = await a2aClient.createTask({
        targetAgentId: 'DataEngineer',
        type: 'enrichLeads',
        inputs: { leadIds, provider, tenantId },
      });
      
      const result = await a2aClient.waitForTask(task.taskId, {
        timeout: 30000,
      });
      
      if (result.status === 'completed') {
        return result.outputs.enrichedLeads;
      }
    } catch (error) {
      console.warn(`Provider ${provider} failed:`, error.message);
      // Continue to next provider
    }
  }
  
  // All providers failed - return partial data
  throw new AllProvidersFailedError('All enrichment providers unavailable');
}
```

### Task Cancellation

```typescript
// Allow users/agents to cancel long-running tasks
async function cancelTask(taskId: string, reason: string) {
  const task = await db.tasks.findUnique({ where: { taskId } });
  
  if (!task || !['submitted', 'working'].includes(task.status)) {
    throw new Error('Task cannot be cancelled');
  }
  
  // Update task status
  await taskStateMachine.transition(taskId, 'cancelled', { reason });
  
  // Notify target agent to stop processing
  await notifyAgent(task.targetAgentId, {
    type: 'task_cancel',
    taskId,
    reason,
  });
  
  // Refund reserved credits
  if (task.creditsReserved > 0) {
    await creditManager.refund(task.tenantId, task.creditsReserved);
  }
}
```

## 7. Observability Stack

### Metrics Dashboard

```typescript
// Real-time agent metrics
interface AgentMetricsDashboard {
  agent: string;
  current: {
    activeTask: number;
    queuedTasks: number;
    avgLatency: number;
    errorRate: number;
  };
  today: {
    tasksCompleted: number;
    creditsUsed: number;
    successRate: number;
  };
  trends: {
    hourly: Array<{ hour: number; tasks: number; errors: number }>;
    daily: Array<{ date: string; tasks: number; avgDuration: number }>;
  };
}

// Prometheus + Grafana integration
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

const taskDurationHistogram = new Histogram({
  name: 'dealscale_a2a_task_duration_seconds',
  help: 'A2A task duration in seconds',
  labelNames: ['agent_id', 'task_type', 'status', 'tenant_id'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120, 300],
});

const taskCounter = new Counter({
  name: 'dealscale_a2a_tasks_total',
  help: 'Total number of A2A tasks',
  labelNames: ['agent_id', 'task_type', 'status', 'tenant_id'],
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Distributed Tracing

```typescript
import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('dealscale-a2a');

async function callAgentWithTracing(task: A2ATask) {
  return tracer.startActiveSpan('a2a.call_agent', async (span) => {
    span.setAttributes({
      'agent.id': task.targetAgentId,
      'task.id': task.taskId,
      'task.type': task.type,
      'tenant.id': task.tenantId,
    });
    
    try {
      const result = await callAgent(task);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error.message 
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 8. Scalability Patterns

### Agent Load Balancing

```typescript
// Distribute tasks across multiple agent instances
class AgentLoadBalancer {
  private instances: Map<string, AgentInstance[]> = new Map();
  
  async getHealthyInstance(agentId: string): Promise<AgentInstance> {
    const instances = this.instances.get(agentId) || [];
    
    // Filter healthy instances
    const healthy = instances.filter(i => 
      i.health === 'healthy' && i.activeTask < i.maxConcurrentTasks
    );
    
    if (healthy.length === 0) {
      // Scale up new instance
      const newInstance = await this.scaleUp(agentId);
      return newInstance;
    }
    
    // Round-robin load balancing
    return healthy[Math.floor(Math.random() * healthy.length)];
  }
  
  async scaleUp(agentId: string): Promise<AgentInstance> {
    // Kubernetes-based auto-scaling
    const deployment = await k8s.apps.v1.readNamespacedDeployment(
      `agent-${agentId.toLowerCase()}`,
      'dealscale-agents'
    );
    
    // Increase replicas
    deployment.spec.replicas++;
    await k8s.apps.v1.patchNamespacedDeployment(
      deployment.metadata.name,
      'dealscale-agents',
      deployment
    );
    
    // Wait for new instance to be ready
    return await this.waitForNewInstance(agentId);
  }
}
```

### Task Queue (Redis)

```typescript
import { Queue, Worker } from 'bullmq';

// Task queue for async processing
const taskQueue = new Queue('a2a-tasks', {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

// Add task to queue
async function enqueueTask(task: A2ATask) {
  await taskQueue.add('process', task, {
    priority: task.priority || 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

// Worker processes tasks
const worker = new Worker('a2a-tasks', async (job) => {
  const task: A2ATask = job.data;
  
  // Find appropriate agent
  const agent = await agentRegistry.getAgent(task.targetAgentId);
  
  // Execute task
  return await agent.handleTask(task);
}, {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
  concurrency: 10,
});
```

## 9. Testing Strategies

### Unit Tests

```typescript
describe('DataEngineer Agent', () => {
  it('should enrich leads via Apollo', async () => {
    const task: A2ATask = {
      taskId: 'test-123',
      type: 'enrichLeads',
      inputs: {
        leadIds: ['lead-1', 'lead-2'],
        provider: 'apollo',
        tenantId: 'test-tenant',
      },
      tenantId: 'test-tenant',
      requesterAgentId: 'AudienceArchitect',
      targetAgentId: 'DataEngineer',
      status: 'submitted',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await dataEngineer.handleTask(task);
    
    expect(result.status).toBe('completed');
    expect(result.outputs.enrichedLeads).toHaveLength(2);
    expect(result.outputs.creditsUsed).toBe(4); // 2 leads × 2 credits
  });
  
  it('should handle missing tenant context', async () => {
    const task: A2ATask = {
      // ... missing tenantId
    };
    
    await expect(dataEngineer.handleTask(task)).rejects.toThrow(
      'Tenant ID required'
    );
  });
});
```

### Integration Tests

```typescript
describe('A2A Multi-Agent Flow', () => {
  it('should complete full enrichment → scoring → campaign flow', async () => {
    // Setup
    const tenantId = 'test-tenant';
    const seedLeads = ['lead-1', 'lead-2', 'lead-3'];
    
    // Execute workflow
    const result = await orchestrator.execute({
      workflow: 'create_lookalike_campaign',
      inputs: { seedLeads, tenantId },
    });
    
    // Verify each agent was called
    const auditLogs = await getAuditLogs(tenantId);
    expect(auditLogs).toContainEqual(
      expect.objectContaining({ targetAgentId: 'DataEngineer' })
    );
    expect(auditLogs).toContainEqual(
      expect.objectContaining({ targetAgentId: 'AudienceArchitect' })
    );
    expect(auditLogs).toContainEqual(
      expect.objectContaining({ targetAgentId: 'CampaignOrchestrator' })
    );
    
    // Verify final result
    expect(result.status).toBe('completed');
    expect(result.outputs.campaignId).toBeDefined();
  });
});
```

### Load Tests

```typescript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up
    { duration: '5m', target: 50 },   // Sustained load
    { duration: '1m', target: 100 },  // Peak load
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const task = {
    targetAgentId: 'DataEngineer',
    type: 'enrichLeads',
    inputs: {
      leadIds: generateRandomLeadIds(10),
      provider: 'apollo',
      tenantId: __ENV.TEST_TENANT_ID,
    },
  };
  
  const res = http.post(
    'https://agents.dealscale.io/data-engineer/tasks',
    JSON.stringify(task),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.A2A_TOKEN}`,
      },
    }
  );
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'task created': (r) => JSON.parse(r.body).taskId !== undefined,
  });
  
  sleep(1);
}
```

## 10. Deployment Architecture

### Production Infrastructure

```yaml
# docker-compose.yml for agent services
version: '3.8'

services:
  agent-registry:
    image: dealscale/agent-registry:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "8001:8001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  data-engineer:
    image: dealscale/agent-data-engineer:latest
    environment:
      - AGENT_ID=DataEngineer
      - REGISTRY_URL=http://agent-registry:8001
      - MCP_ENDPOINTS=${MCP_ENDPOINTS}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
    depends_on:
      - agent-registry
  
  audience-architect:
    image: dealscale/agent-audience-architect:latest
    environment:
      - AGENT_ID=AudienceArchitect
      - REGISTRY_URL=http://agent-registry:8001
      - ML_MODEL_PATH=/models/lookalike-v3.2
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '4'
          memory: 8G
    volumes:
      - ml-models:/models
  
  campaign-orchestrator:
    image: dealscale/agent-campaign-orchestrator:latest
    environment:
      - AGENT_ID=CampaignOrchestrator
      - REGISTRY_URL=http://agent-registry:8001
      - N8N_API_URL=${N8N_API_URL}
      - MAKE_API_KEY=${MAKE_API_KEY}
    deploy:
      replicas: 2
  
  task-queue-worker:
    image: dealscale/a2a-worker:latest
    environment:
      - REDIS_URL=${REDIS_URL}
      - DATABASE_URL=${DATABASE_URL}
    deploy:
      replicas: 5

volumes:
  ml-models:
```

### Kubernetes Deployment

```yaml
# k8s/agent-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-engineer-agent
  namespace: dealscale-agents
spec:
  replicas: 3
  selector:
    matchLabels:
      app: data-engineer
  template:
    metadata:
      labels:
        app: data-engineer
        version: v2.1.0
    spec:
      containers:
      - name: data-engineer
        image: dealscale/agent-data-engineer:2.1.0
        ports:
        - containerPort: 8080
        env:
        - name: AGENT_ID
          value: "DataEngineer"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: data-engineer-service
  namespace: dealscale-agents
spec:
  selector:
    app: data-engineer
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: data-engineer-hpa
  namespace: dealscale-agents
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: data-engineer-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## DealScale-Specific Adjustments

### Agent Registry Integration

```typescript
// Centralized agent registry
class DealScaleAgentRegistry {
  async registerAllAgents() {
    await Promise.all([
      this.registerAgent({
        agentId: 'DataEngineer',
        endpoint: process.env.DATA_ENGINEER_URL,
        capabilities: dataEngineerCapabilities,
        tenantAware: true,
      }),
      this.registerAgent({
        agentId: 'AudienceArchitect',
        endpoint: process.env.AUDIENCE_ARCHITECT_URL,
        capabilities: audienceArchitectCapabilities,
        tenantAware: true,
      }),
      this.registerAgent({
        agentId: 'CampaignOrchestrator',
        endpoint: process.env.CAMPAIGN_ORCHESTRATOR_URL,
        capabilities: campaignOrchestratorCapabilities,
        tenantAware: true,
      }),
      this.registerAgent({
        agentId: 'WorkflowAutomation',
        endpoint: process.env.WORKFLOW_AUTOMATION_URL,
        capabilities: workflowAutomationCapabilities,
        tenantAware: true,
      }),
    ]);
    
    console.log('✅ All agents registered');
  }
}
```

### Orchestration Engine Integration

```typescript
// Kestra workflow with A2A agents
// kestra-workflow.yml
id: lookalike_campaign
namespace: dealscale

tasks:
  - id: enrich_leads
    type: io.kestra.plugin.dealscale.A2ATask
    agentId: DataEngineer
    taskType: enrichLeads
    inputs:
      leadIds: "{{ inputs.seedLeads }}"
      provider: apollo
      tenantId: "{{ inputs.tenantId }}"
    
  - id: score_audience
    type: io.kestra.plugin.dealscale.A2ATask
    agentId: AudienceArchitect
    taskType: scoreLookalike
    inputs:
      seedLeadIds: "{{ outputs.enrich_leads.enrichedLeadIds }}"
      tenantId: "{{ inputs.tenantId }}"
    
  - id: launch_campaign
    type: io.kestra.plugin.dealscale.A2ATask
    agentId: CampaignOrchestrator
    taskType: launchCampaign
    inputs:
      audienceLeadIds: "{{ outputs.score_audience.topScoredLeadIds }}"
      tenantId: "{{ inputs.tenantId }}"
```

### Credit Enforcement

```typescript
// Before each A2A task
async function enforceCreditsBeforeTask(task: A2ATask) {
  // Get agent capability to know cost
  const agent = await agentRegistry.getAgent(task.targetAgentId);
  const capability = agent.capabilities.find(c => c.id === task.type);
  
  if (!capability) {
    throw new Error(`Capability ${task.type} not found on agent ${task.targetAgentId}`);
  }
  
  // Calculate estimated credits
  const itemCount = task.inputs.leadIds?.length || 1;
  const estimatedCredits = capability.creditsPerLead * itemCount;
  
  // Check and reserve credits
  await creditManager.checkAndDeduct(
    task.tenantId,
    task.type,
    estimatedCredits
  );
  
  // Store reservation
  task.creditsReserved = estimatedCredits;
  await db.tasks.update({
    where: { taskId: task.taskId },
    data: { creditsReserved: estimatedCredits },
  });
}
```

## Production Deployment Checklist

### Pre-Launch
- [ ] All agent cards defined and published
- [ ] Agent registry deployed and tested
- [ ] Authentication & authorization working
- [ ] Tenant isolation verified
- [ ] Credit tracking implemented
- [ ] Audit logging enabled
- [ ] Metrics & monitoring configured
- [ ] Error handling & fallbacks tested
- [ ] Load testing completed
- [ ] Security audit passed

### Launch Day
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Enable for 10% of tenants
- [ ] Monitor error rates and latency
- [ ] Gradual rollout to 50%, then 100%

### Post-Launch
- [ ] Monitor dashboards 24/7
- [ ] Set up alerts for errors, latency, credit usage
- [ ] Collect user feedback
- [ ] Optimize based on metrics
- [ ] Plan version 2 features

## Monitoring & Alerting

```typescript
// PagerDuty integration for critical issues
const alerts = {
  agentDown: {
    condition: 'agent_health == "unhealthy" for 5 minutes',
    severity: 'critical',
    action: 'page_on_call',
  },
  highErrorRate: {
    condition: 'error_rate > 5% for 10 minutes',
    severity: 'high',
    action: 'notify_team',
  },
  highLatency: {
    condition: 'p99_latency > 60s for 5 minutes',
    severity: 'medium',
    action: 'create_incident',
  },
  lowCredits: {
    condition: 'tenant_credits < 1000',
    severity: 'low',
    action: 'notify_user',
  },
};
```

## Future Enhancements

### Phase 2 (Q2 2025)
- [ ] Agent marketplace (third-party agents)
- [ ] Cross-tenant agent sharing (with permissions)
- [ ] AI-powered agent routing
- [ ] Predictive scaling based on patterns

### Phase 3 (Q3 2025)
- [ ] Federated agents across regions
- [ ] Agent reputation scoring
- [ ] Automated agent composition
- [ ] Self-healing agent networks

## References

- [A2A Protocol Specification](https://a2aprotocol.ai)
- [Google A2A Blog Post](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A GitHub Samples](https://github.com/a2aproject/a2a-samples)
- [A2A vs MCP Comparison](https://www.stride.build/blog/agent-to-agent-a2a-vs-model-context-protocol-mcp-when-to-use-which)
- [Inter-Agent Trust Models Paper](https://arxiv.org/abs/2511.03434)












