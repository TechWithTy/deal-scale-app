# QuickStart Auto-Select: What to Do Next

**Status:** All code changes complete  
**Your Task:** Test and verify

---

## 🚀 STEP-BY-STEP TESTING GUIDE

### 1. Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
pnpm dev
```

**⏱️ Wait for:** `✓ Ready in X ms`

---

### 2. Open Fresh Incognito Window

- **Firefox:** `Ctrl+Shift+P`
- **Chrome/Edge:** `Ctrl+Shift+N`
- Navigate to: http://localhost:3000/signin

---

### 3. Open Browser Console BEFORE Logging In

- Press `F12` (or right-click → Inspect)
- Go to "Console" tab
- Keep it open!

---

### 4. Login as Starter User

- Email: `starter@example.com`
- Password: `password123`
- Click "Login" (or however you submit)

---

### 5. CHECK CONSOLE IMMEDIATELY

Look for this debug output:

```
🔍 QuickStart Defaults Debug
1️⃣ Session user: {...}
2️⃣ Session quickStartDefaults: { personaId: "wholesaler" }
3️⃣ UserProfile quickStartDefaults: undefined
4️⃣ Wizard personaId: "wholesaler"
5️⃣ Wizard goalId: null
```

---

## 🎯 What to Look For in Console

### ✅ GOOD - If You See:
```
2️⃣ Session quickStartDefaults: { personaId: "wholesaler" }
4️⃣ Wizard personaId: "wholesaler"
```
**→ Data is flowing! The wizard should work!**

### ❌ BAD - If You See:
```
2️⃣ Session quickStartDefaults: undefined
```
**→ The session doesn't have the data. See troubleshooting below.**

### ⚠️ PARTIAL - If You See:
```
2️⃣ Session quickStartDefaults: { personaId: "wholesaler" }
4️⃣ Wizard personaId: null
```
**→ Session has data but wizard didn't pick it up. See troubleshooting.**

---

## 6. Open QuickStart Wizard

1. Click the "QuickStart Wizard" button (wherever it is in your app)
2. Look at Step 1
3. **Check if "Wholesaler" card is highlighted/pre-selected**

---

## ✅ Expected Results for Each User

| Login Email | Password | Expected Persona | Expected Highlight |
|-------------|----------|------------------|-------------------|
| starter@example.com | password123 | **Wholesaler** | "Match deals with ready buyers" |
| admin@example.com | password123 | **Agent / Team** | "Multiply your listing opportunities" |
| free@example.com | password123 | **Investor** | "Acquire profitable assets faster" |

---

## 🆘 TROUBLESHOOTING

### Problem: Session quickStartDefaults is `undefined`

**Diagnosis:** The auth config isn't passing the data through.

**Fix:**
1. Check if your `auth.config.ts` changes were saved
2. Make SURE you restarted the server
3. Try stopping server, deleting `.next`, then restarting:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### Problem: Session has data but Wizard doesn't

**Diagnosis:** The useEffect in QuickStartWizard isn't running.

**Fix:**
1. Check browser console for any React errors
2. Hard refresh the page (Ctrl+Shift+R)
3. Try logging out and back in

### Problem: Console shows "personaId: null"

**Diagnosis:** The selectPersona() function might not be working.

**Solution:** Add this to your console:
```javascript
// In browser console after login:
const store = window.__ZUSTAND_STORES__?.quickStartWizardData;
console.log('Wizard store state:', store?.getState());
```

---

## 🔧 Quick Fixes

### Nuclear Option (If Nothing Works)

```bash
# 1. Stop server
# 2. Delete everything
rm -rf .next node_modules/.cache

# 3. Restart
pnpm dev
```

### Check If Types Are Loaded

In your browser console after login:
```javascript
// Check session
console.log(window.next?.router?.state?.session);

// Or use the debug helper
console.log("Session:", session);
```

---

## 📸 What to Send Me

If it's still not working, send me:

1. **Screenshot of browser console** showing the debug output
2. **Tell me which user** you logged in as
3. **Screenshot of the wizard** (showing if anything is selected)

Then I can pinpoint exactly where the data is getting lost!

---

## ✅ Files Changed (For Reference)

1. `lib/mock-db.ts` - ✅ Added `quickStartDefaults` to all users
2. `types/user.ts` - ✅ Added field to User interface
3. `types/next-auth.d.ts` - ✅ Added to session types
4. `auth.config.ts` - ✅ Added to auth pipeline
5. `components/quickstart/wizard/QuickStartWizard.tsx` - ✅ Added sync logic
6. `components/quickstart/QuickStartDebug.tsx` - ✅ Added debug component
7. `components/layout/AuthenticatedAppShell.tsx` - ✅ Mounted debug component

---

**Current Status:** Ready to test with debug logging enabled! 🎯

