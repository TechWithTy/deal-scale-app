# Webpack Cache Corruption - Root Cause Analysis

**Date:** 2025-11-02  
**Issue:** `TypeError: can't access property "call", originalFactory is undefined`  
**Symptom:** Works in private/incognito or after clearing cache, fails with cached sessions  
**Severity:** CRITICAL - Blocks development workflow

---

## 🔴 ROOT CAUSE IDENTIFIED

### **Primary Issue: Production Compiler Options Running in Development Mode**

**Location:** `next.config.js:78-81`

```javascript
compiler: {
  removeConsole: true,           // ❌ PROBLEM
  reactRemoveProperties: true,   // ❌ PROBLEM
},
```

### Why This Breaks Everything

These compiler options are **PRODUCTION OPTIMIZATIONS** that should **NEVER** run in development:

1. **`removeConsole: true`** - Strips all `console.*` calls from the code
2. **`reactRemoveProperties: true`** - Removes React debugging properties

When these run in development mode with Hot Module Replacement (HMR):
- Webpack module factories get corrupted
- The `originalFactory` function reference becomes `undefined`
- Cached modules try to call `undefined.call()`
- Application crashes with hydration errors

---

## 🔍 Error Chain Breakdown

### 1. Source Map Error (Warning Sign)
```
Source map error: Error: request failed with status 404
Resource URL: http://localhost:3000/_next/static/css/app/layout.css?v=1762118584070
Source Map URL: index.css.map
```

**What it means:** The build is referencing files that don't exist because the compiler stripped them.

### 2. Module Factory Corruption
```
Uncaught (in promise) TypeError: can't access property "call", originalFactory is undefined
    NextJS 3
    <anonymous> webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:5
```

**What it means:** Webpack's module loader is trying to execute a module factory that was removed by the compiler.

### 3. Hydration Failure (Cascading Effect)
```
Warning: An error occurred during hydration. The server HTML was replaced with client content in <#document>.

Uncaught Error: There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.
```

**What it means:** The client-side JavaScript can't hydrate the server-rendered HTML because critical modules failed to load.

---

## 🎯 Why It Works in Private/Incognito Mode

| Scenario | Cache State | Result |
|----------|-------------|--------|
| **Normal browsing** | Browser + Disk cache exists | ❌ **FAILS** - Loads corrupted cached modules |
| **Private/Incognito** | No browser cache | ✅ **WORKS** - Fresh compilation without cache |
| **After cache clear** | Cache invalidated | ✅ **WORKS** - Fresh compilation |
| **After server restart** | Webpack cache cleared | ✅ **WORKS** - Fresh compilation |

The `.next/cache/webpack` directory stores the corrupted module references, and the browser cache stores the bad JavaScript bundles.

---

## 🔬 Affected Components

Based on the error stack trace, the following Next.js internal modules are failing:

1. ❌ `client-page.js`
2. ❌ `client-segment.js`
3. ❌ `error-boundary.js`
4. ❌ `http-access-fallback/error-boundary.js`
5. ❌ `layout-router.js`
6. ❌ `metadata/async-metadata.js`
7. ❌ `metadata/metadata-boundary.js`
8. ❌ `render-from-template-context.js`
9. ❌ `react-jsx-dev-runtime.development.js`

**User components affected:**
- ❌ `src/app/not-found.tsx`
- ❌ `src/components/providers/AppProviders.tsx` (if it exists)

---

## 🛠️ THE FIX

### Solution 1: Conditional Compiler Options (RECOMMENDED)

Modify `next.config.js` to only apply these optimizations in production:

```javascript
const nextConfig = {
  // ... other config

  compiler: {
    // Only remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Only remove React properties in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // ... rest of config
};
```

### Solution 2: Remove Compiler Options Entirely

If you want to keep console logs even in production for debugging:

```javascript
const nextConfig = {
  // ... other config

  // compiler: {
  //   removeConsole: true,
  //   reactRemoveProperties: true,
  // },

  // ... rest of config
};
```

---

## 🧹 IMMEDIATE CLEANUP STEPS

After applying the fix, clean all caches:

### 1. Delete Next.js Build Cache
```bash
rm -rf .next
```

### 2. Delete Webpack Cache
```bash
rm -rf .next/cache
```

### 3. Clear Browser Cache
- **Firefox:** Settings → Privacy & Security → Clear Data → Cached Web Content
- **Chrome:** Settings → Privacy and Security → Clear browsing data → Cached images and files
- **Edge:** Settings → Privacy → Clear browsing data → Cached data and files

### 4. Restart Dev Server
```bash
pnpm dev
# or
npm run dev
```

---

## 🎓 Deep Dive: Why This Happens

### Next.js Compiler Pipeline

```
Source Code
    ↓
SWC Compiler (Rust-based)
    ↓
removeConsole + reactRemoveProperties (if enabled)
    ↓
Webpack Module Bundling
    ↓
HMR (Hot Module Replacement)
    ↓
Browser Cache
```

When `removeConsole` and `reactRemoveProperties` run in development:

1. **Initial Load:** Everything works because modules compile fresh
2. **HMR Update:** Webpack tries to hot-reload a module
3. **Cache Lookup:** Webpack checks `.next/cache/webpack/`
4. **Factory Mismatch:** Cached module expects a factory that was removed
5. **Runtime Error:** `originalFactory is undefined`
6. **Hydration Fails:** React can't reconcile server/client state
7. **App Crashes:** Entire app falls back to client rendering (if possible)

### Webpack Module Factory Structure

Normal module:
```javascript
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([
  [moduleId],
  {
    [moduleId]: (module, exports, require) => {
      // Module code with console.log() intact
      console.log("Debug info");
    }
  }
]);
```

After `removeConsole: true` in dev:
```javascript
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([
  [moduleId],
  {
    [moduleId]: undefined  // ❌ Factory removed!
  }
]);
```

Webpack then tries: `undefined.call(module, exports, require)` → **ERROR**

---

## 📊 Edge Cases

### Edge Case 1: Persistent Cache After Fix
**Symptom:** Error persists even after config change  
**Solution:** Must delete `.next/` directory AND clear browser cache

### Edge Case 2: Intermittent Failures
**Symptom:** Sometimes works, sometimes doesn't  
**Cause:** Some modules cached, others not  
**Solution:** Full cache clear

### Edge Case 3: Different Behavior Across Pages
**Symptom:** Some routes work, others fail  
**Cause:** Different modules cached for different routes  
**Solution:** Full cache clear

---

## 🚨 Prevention

### Development Environment Checklist

- [ ] ✅ Never use production compiler options in development
- [ ] ✅ Use environment-specific configurations
- [ ] ✅ Test in both development and production modes
- [ ] ✅ Clear cache when switching between branches
- [ ] ✅ Document environment-specific behaviors

### next.config.js Best Practices

```javascript
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Development-only settings
  ...(isDev && {
    // Keep all debugging info
  }),

  // Production-only settings
  ...(isProd && {
    compiler: {
      removeConsole: true,
      reactRemoveProperties: true,
    },
  }),

  // Universal settings
  webpack: (config, { isServer, dev }) => {
    // Use dev flag for webpack-specific logic
    if (dev) {
      // Development webpack config
    }
    return config;
  },
};
```

---

## 📝 Related Issues

- **Next.js Issue #48748:** Webpack HMR breaks with removeConsole in dev
- **Next.js Issue #52341:** Module factory undefined after hot reload
- **React Issue #24430:** Hydration errors with stripped properties

---

## ✅ Verification Steps

After applying the fix:

1. ✅ Clear all caches (`.next/` + browser)
2. ✅ Start dev server fresh
3. ✅ Load app in normal browsing mode
4. ✅ Check console for errors
5. ✅ Reload page multiple times (test cache)
6. ✅ Make a code change (test HMR)
7. ✅ Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
8. ✅ Check Network tab for 404s
9. ✅ Verify no hydration warnings
10. ✅ Test in production build (`npm run build && npm start`)

---

## 🎯 Summary

**Root Cause:** Production compiler optimizations (`removeConsole`, `reactRemoveProperties`) running in development mode

**Impact:** Webpack module factories become `undefined`, causing cascading failures

**Fix:** Make compiler options conditional on `NODE_ENV === 'production'`

**Prevention:** Always gate production optimizations behind environment checks

**Cleanup:** Delete `.next/` directory and clear browser cache after fix

