# QuickStart URL Parameters - Quick Examples

**🚀 Try These URLs Immediately**

---

## 🧪 Test URLs (Copy & Paste)

### For Investor
```
http://localhost:3000/dashboard?quickstart_goal=investor-pipeline
```
**Opens with:** Investor persona + "Launch a seller pipeline" goal

### For Wholesaler
```
http://localhost:3000/dashboard?quickstart_goal=wholesaler-dispositions
```
**Opens with:** Wholesaler persona + "Distribute a new contract" goal

### For Agent
```
http://localhost:3000/dashboard?quickstart_goal=agent-sphere
```
**Opens with:** Agent / Team persona + "Nurture your sphere" goal

### For Lender
```
http://localhost:3000/dashboard?quickstart_goal=lender-fund-fast
```
**Opens with:** Lender persona + "Fund deals faster" goal

---

## 🎯 Common Use Cases

### Use Case 1: Email to New User
```
Hey John! Ready to get started? Click here:
https://dealscale.com/dashboard?quickstart_goal=investor-pipeline&quickstart_open=true

This will walk you through setting up your seller pipeline.
```

### Use Case 2: In-App Tutorial Link
```tsx
<a href={buildQuickStartUrl('/dashboard', {
  goalId: 'agent-sphere',
  shouldOpen: true
})}>
  Start Nurturing Your Sphere →
</a>
```

### Use Case 3: Onboarding Redirect
```typescript
// After user completes signup as "Wholesaler"
router.push('/dashboard?quickstart_goal=wholesaler-acquisitions&quickstart_open=true');
```

### Use Case 4: Support Documentation
```markdown
## For Investors
New to sourcing deals? [Launch the Pipeline QuickStart](https://dealscale.com/dashboard?quickstart_goal=investor-pipeline)

## For Agents
Want to nurture your sphere? [Start Here](https://dealscale.com/dashboard?quickstart_goal=agent-sphere)
```

---

## 📋 All URL Combinations

### Just Persona (User Chooses Goal)
```
?quickstart_persona=investor
?quickstart_persona=wholesaler  
?quickstart_persona=agent
?quickstart_persona=lender
```

### Persona + Goal (Both Pre-Selected)
```
?quickstart_persona=investor&quickstart_goal=investor-pipeline
?quickstart_persona=wholesaler&quickstart_goal=wholesaler-dispositions
?quickstart_persona=agent&quickstart_goal=agent-sphere
?quickstart_persona=lender&quickstart_goal=lender-fund-fast
```

### Auto-Open Wizard
```
?quickstart_goal=agent-sphere&quickstart_open=true
```

---

## 🔍 Debugging

### Check If URL Params Are Working

1. Paste URL with params in browser
2. Open console (F12)
3. Look for:
   ```
   🔗 [QuickStart] URL goalId detected: agent-sphere
   ```

If you see this, URL params are working! ✅

---

## ⚠️ Important Notes

### Params Are Auto-Cleared
After the wizard reads the URL params, they're automatically removed (after 100ms) to keep URLs clean:

```
User visits: /dashboard?quickstart_goal=agent-sphere
Wizard loads goal
URL becomes: /dashboard (cleaned up)
```

### URL Overrides Session Defaults
If a user has `quickStartDefaults` in their profile AND URL params, the URL wins:

```
Profile: { personaId: "investor" }
URL: ?quickstart_goal=agent-sphere

Result: Agent/Team persona used (from URL) ✅
```

### Invalid Params Are Ignored
```
?quickstart_persona=hacker123
→ Safely ignored, warning logged to console
```

---

## 🎨 Marketing Examples

### Landing Page CTA
```html
<a href="https://dealscale.com/dashboard?quickstart_goal=investor-pipeline&quickstart_open=true" 
   class="cta-button">
  Start Finding Deals Today →
</a>
```

### Email Campaign
```
Subject: Ready to 10x Your Deal Flow?

Hi {{firstName}},

Click here to set up your automated seller pipeline in 5 minutes:
https://dealscale.com/dashboard?quickstart_goal=investor-pipeline&quickstart_open=true

We'll walk you through every step.
```

### Social Media Bio
```
New to real estate investing? Start here:
https://dealscale.com/dashboard?quickstart_goal=investor-market
```

---

## 🔗 Shareable Link Generator

```typescript
import { buildQuickStartUrl } from '@/lib/utils/quickstart/urlParams';

function ShareButton({ goalId }: { goalId: QuickStartGoalId }) {
  const handleShare = () => {
    const url = buildQuickStartUrl(window.location.origin + '/dashboard', {
      goalId,
      shouldOpen: true
    });

    navigator.clipboard.writeText(url);
    toast.success('Shareable link copied!');
  };

  return <Button onClick={handleShare}>Share Configuration</Button>;
}
```

---

## ✅ Security Features

All URL inputs are:
- ✅ Validated against whitelist
- ✅ Sanitized and trimmed
- ✅ Protected from SQL injection
- ✅ Protected from XSS attacks
- ✅ Length-limited
- ✅ Type-safe

**36 security tests passing** including malicious input attempts.

---

## 🎯 Quick Reference

**Want investor pipeline?**
```
?quickstart_goal=investor-pipeline
```

**Want to auto-open?**
```
&quickstart_open=true
```

**Complete example:**
```
http://localhost:3000/dashboard?quickstart_goal=agent-sphere&quickstart_open=true
```

---

**Ready to try?** Copy any example URL above and paste it in your browser! 🚀

