# 🚨 QUICK FIX: Webpack Cache Corruption

**Symptom:** App crashes with `TypeError: can't access property "call", originalFactory is undefined`

**Quick Test:** Does it work in private/incognito mode? → Yes? → It's a cache issue!

---

## ⚡ INSTANT FIX (3 Steps)

### Step 1: Clear Next.js Cache
```bash
# Option A: Use the cleanup script
node scripts/clear-next-cache.js

# Option B: Manual deletion
rm -rf .next
# Windows PowerShell:
# Remove-Item -Recurse -Force .next
```

### Step 2: Clear Browser Cache

**Firefox:** `Ctrl+Shift+Delete` → Check "Cached Web Content" → Clear Now

**Chrome/Edge:** `Ctrl+Shift+Delete` → Check "Cached images and files" → Clear data

**Or just use Incognito/Private mode for testing**

### Step 3: Restart Dev Server
```bash
pnpm dev
# or
npm run dev
```

---

## ✅ Has This Been Fixed?

The root cause has been fixed in `next.config.js` (commit: [pending]).

**What was changed:**
```diff
compiler: {
-  removeConsole: true,
-  reactRemoveProperties: true,
+  removeConsole: process.env.NODE_ENV === "production",
+  reactRemoveProperties: process.env.NODE_ENV === "production",
},
```

**But you still need to clear your cache after pulling this fix!**

---

## 🔍 How to Know If You Have This Issue

### ❌ Bad Signs:
- Works in private browsing, fails in normal browsing
- Works after clearing cache, fails after reload
- Console shows: `originalFactory is undefined`
- Console shows: `Error: There was an error while hydrating`
- 404 errors for source maps (`.map` files)

### ✅ Good Signs (After Fix):
- No webpack errors in console
- No hydration warnings
- Works after multiple reloads
- HMR (Hot Module Replacement) works correctly

---

## 🎯 Prevention Checklist

- [ ] Don't use production compiler options in development
- [ ] Clear cache when switching branches
- [ ] Clear cache after pulling config changes
- [ ] Test in both normal and private browsing
- [ ] Verify HMR works after code changes

---

## 📞 Still Having Issues?

1. Check if your `.next` directory was fully deleted
2. Try clearing browser cache again (including cookies)
3. Try a different browser
4. Check if `NODE_ENV` is set correctly:
   ```bash
   echo $NODE_ENV  # Should be empty or "development" in dev mode
   ```
5. Check for disk permission issues (especially on Windows)

---

## 🔗 Related Documents

- **Full Root Cause Analysis:** `_debug/webpack-cache-corruption-root-cause.md`
- **Cleanup Script:** `scripts/clear-next-cache.js`
- **Next.js Config:** `next.config.js`

---

**Last Updated:** 2025-11-02  
**Status:** ✅ FIXED (requires cache clear)

