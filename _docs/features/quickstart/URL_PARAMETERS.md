# QuickStart Wizard: URL Parameters

**Status:** ✅ Implemented and Tested (36/36 tests passing)  
**Date:** 2025-11-02

---

## 🔗 Overview

The QuickStart Wizard now supports URL parameters for deep linking and sharing specific configurations. This allows you to:

- 📤 Share wizard configurations via URL
- 🎯 Deep link to specific personas/goals
- 🤖 Auto-open wizard from external links
- 📧 Include in emails/notifications
- 🔗 Create marketing campaign links

---

## 📖 URL Parameter Reference

| Parameter | Values | Description |
|-----------|--------|-------------|
| `quickstart_persona` | `investor`, `wholesaler`, `agent`, `lender` | Pre-selects persona on Step 1 |
| `quickstart_goal` | See goal IDs below | Pre-selects goal on Step 2 |
| `quickstart_open` | `true`, `false`, `1`, `0` | Auto-opens wizard |
| `quickstart_template` | Template ID | Applies a template preset |

---

## 🎯 Valid Goal IDs

### Investor
- `investor-pipeline` - "Launch a seller pipeline"
- `investor-market` - "Research a new market"

### Wholesaler
- `wholesaler-dispositions` - "Distribute a new contract"
- `wholesaler-acquisitions` - "Source new inventory"

### Agent / Team
- `agent-sphere` - "Nurture your sphere"
- `agent-expansion` - "Capture on-site leads"

### Lender
- `lender-fund-fast` - "Fund deals faster"

---

## 💡 Usage Examples

### Example 1: Pre-Select Persona
```
https://yourapp.com/dashboard?quickstart_persona=investor
```
**Result:** Wizard opens with "Investor" pre-selected

### Example 2: Pre-Select Goal (Auto-Selects Persona Too)
```
https://yourapp.com/dashboard?quickstart_goal=agent-sphere
```
**Result:** 
- Step 1: "Agent / Team" pre-selected
- Step 2: "Nurture your sphere" pre-selected

### Example 3: Auto-Open Wizard
```
https://yourapp.com/dashboard?quickstart_goal=investor-pipeline&quickstart_open=true
```
**Result:** Wizard auto-opens with investor pipeline pre-selected

### Example 4: Complete Configuration
```
https://yourapp.com/dashboard?quickstart_persona=wholesaler&quickstart_goal=wholesaler-dispositions&quickstart_open=true
```
**Result:** Wizard auto-opens on Step 2 with wholesaler disposition goal ready

---

## 🔧 Programmatic Usage

### Building URLs (Client or Server)

```typescript
import { buildQuickStartUrl } from '@/lib/utils/quickstart/urlParams';

// Create a shareable link
const link = buildQuickStartUrl('/dashboard', {
  personaId: 'investor',
  goalId: 'investor-pipeline',
  shouldOpen: true
});

// Result: "/dashboard?quickstart_persona=investor&quickstart_goal=investor-pipeline&quickstart_open=true"
```

### Reading URL Params (Client Only)

```typescript
import { useQuickStartUrlParams } from '@/hooks/useQuickStartUrlParams';

function MyComponent() {
  const { params, clearParams } = useQuickStartUrlParams();

  if (params.goalId) {
    console.log('Goal from URL:', params.goalId);
  }

  // Clear params after processing
  const handleWizardOpen = () => {
    clearParams(); // Cleans up the URL
  };
}
```

### Parsing URL Params (Server or Client)

```typescript
import { parseQuickStartUrlParams } from '@/lib/utils/quickstart/urlParams';

// Server Component
export default function Page({ searchParams }: { searchParams: Record<string, string> }) {
  const params = parseQuickStartUrlParams(searchParams);
  
  return (
    <div>
      {params.shouldOpen && <div>Wizard will auto-open!</div>}
    </div>
  );
}

// Client Component
function ClientComponent() {
  const searchParams = useSearchParams();
  const params = parseQuickStartUrlParams(searchParams);
  
  // Use params...
}
```

---

## 🎨 Use Cases

### 1. Email Campaigns
```html
<a href="https://dealscale.com/dashboard?quickstart_goal=investor-pipeline&quickstart_open=true">
  Start Your Investor Pipeline →
</a>
```

### 2. Onboarding Flows
```typescript
// After user completes profile setup:
router.push(buildQuickStartUrl('/dashboard', {
  personaId: userProfile.clientType === 'agent' ? 'agent' : 'investor',
  shouldOpen: true
}));
```

### 3. Help Documentation
```markdown
New to DealScale? [Start the Wholesaler QuickStart](https://dealscale.com/dashboard?quickstart_goal=wholesaler-dispositions&quickstart_open=true)
```

### 4. Team Sharing
```typescript
// Share wizard configuration with team member
const shareableLink = buildQuickStartUrl(window.location.origin + '/dashboard', {
  goalId: currentGoalId,
  shouldOpen: false // They can open it manually
});

navigator.clipboard.writeText(shareableLink);
toast.success('Configuration link copied!');
```

---

## 🛡️ Security & Validation

### All Inputs Are Validated
- ✅ Whitelist validation (only valid IDs accepted)
- ✅ Case-insensitive (user-friendly)
- ✅ SQL injection protection
- ✅ XSS attack prevention
- ✅ Length limits enforced
- ✅ Special character filtering

### Invalid Inputs Are Safely Ignored
```
?quickstart_persona=hacker<script>alert(1)</script>
→ Validated as invalid, safely ignored, logs warning
```

### Goal/Persona Mismatch Handling
```
?quickstart_persona=agent&quickstart_goal=investor-pipeline
→ Uses goal's persona (investor) since it's more specific
→ Logs warning for debugging
```

---

## 🔄 Priority System

When multiple sources provide defaults, priority is:

1. **URL Parameters** (highest) - For sharing and deep linking
2. **Session Defaults** (medium) - From user profile
3. **No Defaults** (lowest) - Show all options

### Example:
```typescript
User Profile: { personaId: "agent" }
URL: ?quickstart_goal=investor-pipeline

Result: Uses investor-pipeline from URL (overrides profile) ✅
```

---

## 🧹 URL Cleanup

URL parameters are automatically cleared after being applied to prevent confusion:

```
User clicks link: /dashboard?quickstart_goal=agent-sphere
Wizard loads with goal pre-selected
URL cleans up to: /dashboard (after 100ms)
```

This keeps URLs clean and prevents accidentally re-applying params.

---

## 📊 Examples for Each Persona

### Investor Links
```
Quick start investor pipeline:
https://dealscale.com/dashboard?quickstart_goal=investor-pipeline&quickstart_open=true

Research new market:
https://dealscale.com/dashboard?quickstart_goal=investor-market&quickstart_open=true
```

### Wholesaler Links
```
Distribute contract:
https://dealscale.com/dashboard?quickstart_goal=wholesaler-dispositions&quickstart_open=true

Source inventory:
https://dealscale.com/dashboard?quickstart_goal=wholesaler-acquisitions&quickstart_open=true
```

### Agent Links
```
Nurture sphere:
https://dealscale.com/dashboard?quickstart_goal=agent-sphere&quickstart_open=true

Capture leads:
https://dealscale.com/dashboard?quickstart_goal=agent-expansion&quickstart_open=true
```

### Lender Links
```
Fund deals faster:
https://dealscale.com/dashboard?quickstart_goal=lender-fund-fast&quickstart_open=true
```

---

## 🧪 Testing

### Manual Testing

1. Copy this URL:
   ```
   http://localhost:3000/dashboard?quickstart_goal=agent-sphere
   ```

2. Paste in browser

3. Check console for:
   ```
   🔗 [QuickStart] URL goalId detected: agent-sphere
   ```

4. Open QuickStart Wizard

5. Verify:
   - Step 1: "Agent / Team" pre-selected
   - Step 2: "Nurture your sphere" pre-selected

### Automated Tests

Run the test suite:
```bash
pnpm vitest run _tests/lib/utils/quickstart/urlParams.test.ts
```

**Result:** 36/36 tests passing ✅

---

## 🎯 Implementation Checklist

- [x] ✅ URL validation utilities created
- [x] ✅ SSR-safe parameter parsing
- [x] ✅ Client-side hook (useQuickStartUrlParams)
- [x] ✅ Integrated into QuickStartWizard
- [x] ✅ Priority system (URL > Session > None)
- [x] ✅ Auto-cleanup of URL params
- [x] ✅ Security validation (SQL, XSS, etc.)
- [x] ✅ Comprehensive tests (36 tests)
- [x] ✅ Edge case handling
- [x] ✅ Documentation complete

---

## 🚀 Try It Now!

**Test URL:**
```
http://localhost:3000/dashboard?quickstart_goal=agent-sphere
```

1. Paste this in your browser
2. Watch console for URL detection logs
3. Open QuickStart Wizard
4. Both persona and goal should be pre-selected! ✨

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `lib/utils/quickstart/urlParams.ts` | Core validation & parsing utilities |
| `hooks/useQuickStartUrlParams.ts` | Client-side React hook |
| `components/quickstart/wizard/QuickStartWizard.tsx` | Integration point |
| `_tests/lib/utils/quickstart/urlParams.test.ts` | Comprehensive test suite |

---

**Feature Complete!** All edge cases handled, fully tested, and ready to use. 🎉

