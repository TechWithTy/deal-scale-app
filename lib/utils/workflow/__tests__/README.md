# Workflow Mermaid Generator - Test Suite

## 📋 Overview

Comprehensive test suite for multi-platform workflow visualization covering:
- ✅ **POML** - Custom POML markup language
- ✅ **n8n** - Open-source workflow automation
- ✅ **Make.com** - Visual automation platform
- ✅ **Kestra** - Orchestration & scheduling

## 🏃 Running Tests

```bash
# Run all tests
npm test mermaidGenerator

# Run specific platform tests
npm test -- --testNamePattern="n8n"
npm test -- --testNamePattern="Make"
npm test -- --testNamePattern="Kestra"
npm test -- --testNamePattern="POML"

# Run with coverage
npm test mermaidGenerator -- --coverage

# Watch mode
npm test mermaidGenerator -- --watch
```

## 📊 Test Coverage

### POML Parser Tests (12 test cases)
- ✅ Basic linear workflows
- ✅ Variable extraction
- ✅ Parallel task parsing
- ✅ Empty POML handling
- ✅ Malformed POML recovery
- ✅ Special character sanitization

### n8n Parser Tests (8 test cases)
- ✅ Webhook trigger workflows
- ✅ HTTP request nodes
- ✅ Node notes/descriptions
- ✅ Disabled nodes
- ✅ Empty workflows
- ✅ Complex nested connections
- ✅ Missing node names

### Make.com Parser Tests (6 test cases)
- ✅ Webhook scenarios
- ✅ Router/branching logic
- ✅ Empty scenarios
- ✅ Modules without names
- ✅ Scenario notes

### Kestra Parser Tests (10 test cases)
- ✅ Scheduled workflows
- ✅ Parallel tasks
- ✅ Switch/decision tasks
- ✅ Retry configuration
- ✅ Empty workflows
- ✅ Disabled tasks
- ✅ Variables and inputs
- ✅ Loop/ForEach tasks

### Validation Tests (5 test cases)
- ✅ Required field validation
- ✅ Orphaned node detection
- ✅ Circular dependency detection
- ✅ Unknown node type warnings

### Integration Tests (5 test cases)
- ✅ Real-world n8n lead enrichment
- ✅ Real-world Make multi-channel campaign
- ✅ Real-world Kestra data pipeline
- ✅ Mermaid diagram node shape accuracy
- ✅ Retry indicator display

### SWOT Test Coverage (4 test cases)
- ✅ Strengths: Fallback mechanisms
- ✅ Weaknesses: Metadata preservation
- ✅ Opportunities: Early issue detection
- ✅ Threats: Version drift handling

**Total:** 50+ test cases

## 🎯 Test Categories

### Unit Tests
Focus on individual parser functions:
- `parsePOMLToWorkflow()`
- `parseN8nWorkflow()`
- `parseMakeScenario()`
- `parseKestraWorkflow()`
- `validateWorkflow()`

### Integration Tests
End-to-end workflow parsing and diagram generation:
- `generateWorkflowMermaid()`
- Multi-step conversions

### Edge Case Tests
Stress testing with invalid/unusual inputs:
- Empty workflows
- Malformed syntax
- Missing required fields
- Unknown node types
- Circular dependencies

## 🔍 Example Test Scenarios

### Scenario 1: Lead Enrichment Pipeline (n8n)
```typescript
const n8nWorkflow = {
  nodes: [
    { name: "Webhook", type: "n8n-nodes-base.webhook" },
    { name: "Skip Trace", type: "n8n-nodes-base.httpRequest" },
    { name: "Update CRM", type: "n8n-nodes-base.httpRequest" }
  ],
  connections: {
    Webhook: { main: [[{ node: "Skip Trace" }]] },
    "Skip Trace": { main: [[{ node: "Update CRM" }]] }
  }
};
```

**Expected Output:**
- Linear flow: Webhook → Skip Trace → Update CRM
- Stadium shape for Webhook (trigger)
- Rectangle shapes for HTTP tasks
- Purple color for trigger node

### Scenario 2: Multi-Channel Campaign (Make)
```typescript
const makeScenario = {
  modules: [
    { id: 1, module: "trigger", mapper: { name: "Start" } },
    { id: 2, module: "router", mapper: { name: "Router" } },
    { id: 3, module: "sms", mapper: { name: "Send SMS" } },
    { id: 4, module: "email", mapper: { name: "Send Email" } }
  ],
  routes: [{
    flow: [
      { src: 1, tgt: 2 },
      { src: 2, tgt: 3, label: "SMS Channel" },
      { src: 2, tgt: 4, label: "Email Channel" }
    ]
  }]
};
```

**Expected Output:**
- Branching flow with labeled edges
- Diamond shape for Router
- Two parallel branches to End

### Scenario 3: Data Pipeline with Loops (Kestra)
```typescript
const kestraWorkflow = {
  id: "data_pipeline",
  tasks: [
    {
      id: "batch_processor",
      type: "io.kestra.plugin.core.flow.ForEachItem",
      items: "{{ leads }}",
      tasks: [
        { id: "enrich", type: "script" },
        { id: "validate", type: "http" }
      ]
    }
  ]
};
```

**Expected Output:**
- Trapezoid shape for ForEach
- Loop-back arrow notation
- Nested task representation

## 🐛 Known Issues & Limitations

### Currently NOT Supported
1. **n8n sticky notes** - UI-only metadata, ignored
2. **Make data transformers** - Complex mapper logic simplified
3. **Kestra plugins with custom schemas** - May need manual review
4. **Workflow execution history** - Not captured in static definitions

### Partial Support
1. **Error handlers** - Detected but may not map perfectly
2. **Conditional routing** - Basic support, complex conditions simplified
3. **Sub-workflows** - Shown as nodes, not expanded inline

## 🔄 Continuous Improvement

### Monitoring & Feedback
- Track validation failure rates
- Collect unknown node type instances
- Monitor diagram rendering errors
- User feedback on translation accuracy

### Update Cycle
- **Weekly**: Review new node types added to platforms
- **Monthly**: Update test cases with real-world workflows
- **Quarterly**: Full SWOT analysis refresh
- **Annually**: Major version updates for breaking changes

## 📚 Additional Resources

- [n8n Workflow Export Format](https://docs.n8n.io/)
- [Make.com Blueprint Structure](https://www.make.com/en/help)
- [Kestra YAML Specification](https://kestra.io/docs)
- [Mermaid.js Syntax Guide](https://mermaid.js.org/)

## ✅ Quality Gates

Before merging updates:
1. All tests pass (100%)
2. No new linter errors
3. Coverage above 80%
4. SWOT analysis updated
5. Documentation current

