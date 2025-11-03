# QuickStart Goal-Persona Mapping Verification

**Date:** 2025-11-02  
**Purpose:** Verify all mock user defaults have valid goal/persona combinations

---

## ✅ Valid Goal-Persona Combinations

Based on `lib/config/quickstart/wizardFlows.ts`:

### Agent / Team Persona
- ✅ `agent-sphere` → "Nurture your sphere"
- ✅ `agent-expansion` → "Capture on-site leads"

### Investor Persona
- ✅ `investor-pipeline` → "Launch a seller pipeline"
- ✅ `investor-market` → "Research a new market"

### Wholesaler Persona
- ✅ `wholesaler-dispositions` → "Distribute a new contract"
- ✅ `wholesaler-acquisitions` → "Source new inventory"

### Lender Persona
- ✅ `lender-fund-fast` → "Fund deals faster"

---

## 📋 Mock User Verification

| User ID | Name | Persona | Goal | Valid? | Notes |
|---------|------|---------|------|--------|-------|
| 1 | Admin User | `agent` | `agent-sphere` | ✅ YES | Correct |
| 2 | Starter User | `wholesaler` | `wholesaler-dispositions` | ✅ YES | Correct |
| 3 | Basic User | `investor` | `investor-pipeline` | ✅ YES | Correct |
| 4 | Platform Admin | `investor` | `investor-pipeline` | ✅ YES | Correct |
| 5 | Platform Support | `agent` | `agent-sphere` | ✅ YES | Correct |

**Result:** ✅ ALL MAPPINGS ARE VALID!

---

## 🔍 How to Verify

### In Browser Console

After login, check:
```
🔧 [QuickStart] Syncing session defaults: { personaId: "agent", goalId: "agent-sphere" }
🔧 [QuickStart] Current wizard state: { personaId: null, goalId: null }
🔧 [QuickStart] Selecting goal: "agent-sphere"
```

If you see these logs, the sync is working!

### Check Goal Definition

In console, run:
```javascript
// Should return the goal definition
const goal = getGoalDefinition("agent-sphere");
console.log(goal.personaId); // Should be "agent"
```

---

## 🚨 Potential Issues

### Issue 1: Goal is Invalid
**Symptom:** Console shows warning about invalid goalId  
**Cause:** Typo in goalId string  
**Check:** Compare against the table above

### Issue 2: Goal/Persona Mismatch
**Symptom:** Wizard shows persona but not goal  
**Cause:** goalId belongs to different persona  
**Example:** `{ personaId: "agent", goalId: "investor-pipeline" }` ❌

### Issue 3: useEffect Not Running
**Symptom:** No sync logs in console  
**Cause:** Component not mounted or session not ready  
**Solution:** Check if wizard component is rendering

---

## 🔧 Enhanced Debug Logging

I've added detailed console logs to `QuickStartWizard.tsx`:

```typescript
console.log("🔧 [QuickStart] Syncing session defaults:", defaults);
console.log("🔧 [QuickStart] Current wizard state:", { personaId, goalId });
console.log("🔧 [QuickStart] Selecting goal:", defaults.goalId);
```

**Look for these** in your console after logging in!

---

## ✅ What to Look For

### Good Signs (Working):
```
🔧 [QuickStart] Syncing session defaults: { personaId: "agent", goalId: "agent-sphere" }
🔧 [QuickStart] Selecting goal: "agent-sphere"
```

### Bad Signs (Not Working):
```
// No sync logs at all
// OR
🔧 [QuickStart] Syncing session defaults: { personaId: "agent" }
// (missing goalId)
```

---

## 🚀 Next Test Steps

1. **Logout**
2. **Login again** (to get session with goalId)
3. **Watch console** for `🔧 [QuickStart]` logs
4. **Open wizard**
5. **Verify Step 2** has goal pre-selected

---

**Status:** All mappings verified as correct. Enhanced logging added for debugging.

