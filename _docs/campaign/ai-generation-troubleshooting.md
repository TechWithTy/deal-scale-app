# AI Campaign Generation - Troubleshooting Guide

## Root Issue Analysis

### Problem
When AI generates a campaign, the modal opens but critical fields are empty:
- ❌ Lead List not selected
- ❌ Transfer to Agent not enabled
- ❌ Channel customization options not filled

### Root Causes

#### 1. **Lead List Not Auto-Selected**

**Why it fails:**
```typescript
const availableLeadLists = leadListStore.items;
// ⚠️ If leadListStore.items is empty, no list gets selected
```

**Possible Causes:**
- No lead lists have been imported/created yet
- Lead list store hasn't loaded yet
- User is in fresh state without any data

**Solution:**
```typescript
// Check console logs when generating campaign:
console.log("[Campaign] 📋 Available lead lists:", count);

// If count is 0:
// 💡 Upload/import leads first before creating campaigns
```

#### 2. **Transfer Agent Not Set**

**Why it fails:**
- Transfer settings are in the **Channel Customization Form** (Step 2)
- We're setting campaign store values, but transfer fields are form-specific
- Form doesn't read from campaign goal guidance

**Current Approach:**
```typescript
// We add transfer guidance to campaign goal as instructions
const transferGuidance = `
🔄 TRANSFER SETUP:
• Enable transfer to agent
• Transfer Agent: Jane Smith (jane@example.com)
• Transfer Type: Inbound Call
...
`;
campaignState.setCampaignGoal(currentGoal + transferGuidance);
```

**Limitation:**
- Guidance is text-only, not actual form values
- User must manually enable transfer checkbox
- User must manually select agent from dropdown

#### 3. **Form vs Store Mismatch**

**The Dual State Problem:**

CampaignModalMain reads from TWO sources:
1. **Props** (`initialLeadListId`, `initialLeadListName`, `initialLeadCount`)
2. **Campaign Creation Store** (`selectedLeadListId`, `selectedAgentId`, etc.)

```typescript
// We set BOTH:
// 1. Context (used by modal props)
setCampaignModalContext({
  leadListId: selectedLeadListId,
  leadListName: selectedLeadListName,
  leadCount: selectedLeadCount,
});

// 2. Store (used by form fields)
campaignState.setSelectedLeadListId(selectedLeadListId);
campaignState.setSelectedLeadListAId(selectedLeadListId); // Some forms read A/B field
```

**Timing Issue:**
```typescript
// Modal opens BEFORE store updates fully propagate
setTimeout(() => setShowCampaignModal(true), 50); // ⏱️ Added delay
```

## Edge Cases

### Edge Case 1: No Lead Lists Exist
**Scenario:** Fresh user account, no leads imported yet

**Current Behavior:**
- Modal opens with empty lead list
- User must manually upload/select list

**Console Output:**
```
[Campaign] ⚠️  NO LEAD LISTS AVAILABLE
[Campaign] 💡 Solution: Upload/import leads first
```

**Recommended UX:**
- Show toast: "No lead lists found - upload leads first"
- Pre-open lead upload modal
- Or disable campaign generation until leads exist

### Edge Case 2: Only One Agent Available
**Scenario:** Account has only 1 agent configured

**Current Behavior:**
- Primary agent selected ✅
- Transfer agent guidance skipped (needs 2+ agents)
- No transfer setup in campaign goal

**Solution:**
```typescript
if (campaignState.availableAgents?.length > 1) {
  // Setup transfer to second agent
} else {
  // Skip transfer setup - only one agent
}
```

### Edge Case 3: Template Has Invalid Channel
**Scenario:** Template specifies channel not in ["call", "text", "email", "social", "directmail"]

**Current Behavior:**
- Channel not set
- Form shows empty/default channel

**Solution:**
```typescript
if (["call", "text", "email", "social", "directmail"].includes(primaryChannel)) {
  campaignState.setPrimaryChannel(primaryChannel as any);
} else {
  console.warn("[Campaign] Invalid channel:", primaryChannel);
  // Fallback to call
  campaignState.setPrimaryChannel("call");
}
```

### Edge Case 4: No Sender Numbers Configured
**Scenario:** User hasn't connected Twilio or configured phone numbers

**Current Behavior:**
```typescript
if (campaignState.availableSenderNumbers?.length > 0) {
  campaignState.setSelectedSenderNumbers(campaignState.availableSenderNumbers);
} // Else: empty array, number pooling enabled but no numbers
```

**Console Output:**
```
[Campaign] Auto-selected sender numbers: 0
```

**Impact:**
- Number pooling enabled but won't work
- Campaign will fail to launch without numbers

## Recommended Fixes

### Fix 1: Pre-Flight Validation
```typescript
const validateBeforeCampaignGeneration = () => {
  const leadLists = leadListStore.items;
  const agents = useCampaignCreationStore.getState().availableAgents;
  const senderNumbers = useCampaignCreationStore.getState().availableSenderNumbers;
  
  const issues = [];
  
  if (!leadLists?.length) {
    issues.push("No lead lists available");
  }
  
  if (!agents?.length) {
    issues.push("No agents configured");
  }
  
  if (!senderNumbers?.length) {
    issues.push("No sender numbers connected");
  }
  
  return { valid: issues.length === 0, issues };
};

// Call before opening AI campaign generator
const validation = validateBeforeCampaignGeneration();
if (!validation.valid) {
  toast.error("Cannot generate campaign", {
    description: validation.issues.join(", "),
  });
  return;
}
```

### Fix 2: Force Form Sync After Store Update
```typescript
// After setting all store values, force form to re-read
setTimeout(() => {
  const updatedState = useCampaignCreationStore.getState();
  customizationForm.setValue("selectedLeadListId", updatedState.selectedLeadListId);
  customizationForm.setValue("areaMode", "leadList");
}, 100);
```

### Fix 3: Show Required Steps Toast
```typescript
toast.info("Campaign Template Created", {
  description: "Review and complete: Lead list, Transfer agent (optional)",
  duration: 5000,
});
```

## Current Implementation Status

| Feature | Auto-Selected | Notes |
|---------|---------------|-------|
| Campaign Name | ✅ | From template |
| Primary Channel | ✅ | First from template |
| AI Agent | ✅ | First available |
| Workflow | ✅ | First available |
| Sales Script | ✅ | Channel-matched |
| Voicemail | ✅ | Professional/Emma |
| SMS Options | ✅ | Images, links, signature |
| Number Pooling | ✅ | Enabled |
| Sender Numbers | ✅ | All available (if any exist) |
| **Lead List** | ⚠️ **Conditional** | Only if lists exist |
| **Transfer Agent** | ⚠️ **Guidance Only** | Text in campaign goal, not form values |
| Timing | ✅ | Business hours, weekends |

## Debugging Steps

1. **Check console when generating campaign:**
```
[Campaign] 📋 Available lead lists: X
[Campaign] ✅ Auto-selected lead list: {...}
[Campaign] ✅ Store fields set: {...}
[Campaign] 📊 Final state before modal: {...}
```

2. **If "Available lead lists: 0":**
   - Import leads first (CSV upload or integration)
   - Create a lead list manually
   - Check lead list store is populated

3. **If store fields show empty after being set:**
   - Timing issue - increase setTimeout delay
   - Store is being reset somewhere
   - Check for conflicting useEffects in modal

4. **If transfer isn't enabled:**
   - This is by design - transfer is guidance text only
   - User must manually check "Enable Transfer to Agent"
   - Future: Add form-level transfer agent setting capability

## Best Practices

1. **Always check lead lists exist before campaign generation**
2. **Provide clear error messages when prerequisites missing**
3. **Use comprehensive console logging during development**
4. **Test with empty state (no leads, no agents)**
5. **Test with populated state (multiple lists, multiple agents)**






