# Debug Documentation Index

This directory contains debug logs and troubleshooting guides for various issues encountered during development.

---

## 🔥 Recently Resolved Issues

### ✅ Webpack Cache Corruption (RESOLVED - 2025-11-02)

**Status:** Fixed, cache cleared

### ✅ Hydration Error: Input Style Mismatch (RESOLVED - 2025-11-02)

**Status:** Fixed

**Quick Access:**
- 🚀 **Start here:** [`WEBPACK-FIX-SUMMARY.md`](./WEBPACK-FIX-SUMMARY.md) - What was fixed and what you need to do
- ⚡ **Quick fix:** [`QUICK-FIX-webpack-cache.md`](./QUICK-FIX-webpack-cache.md) - Fast troubleshooting steps
- 🔬 **Deep dive:** [`webpack-cache-corruption-root-cause.md`](./webpack-cache-corruption-root-cause.md) - Complete technical analysis

**Issue:** `TypeError: can't access property "call", originalFactory is undefined`

**Symptoms:**
- App crashes with webpack errors
- Works in private/incognito mode
- Works after clearing cache
- Hydration errors

**Root Cause:** Production compiler optimizations running in development mode

**Fix Applied:** ✅ Modified `next.config.js` to conditionally apply compiler options

**Action Required:** ~~Clear cache~~ → **DONE**

---

### ✅ TestUsers Hydration Error (RESOLVED - 2025-11-02)

**File:** [`hydration-error-input-style.md`](./hydration-error-input-style.md)

**Issue:** React hydration mismatch due to localStorage access

**Root Cause:** Component loading localStorage data in useEffect, causing server/client HTML mismatch

**Fix Applied:** ✅ Added `isHydrated` flag to delay rendering until client-side data loads

**Action Required:** None - already fixed

---

## 🐛 Other Issues

### Skip Tracing Toast Timing (UNDER INVESTIGATION)

**File:** [`skip-tracing-toast-timing.md`](./skip-tracing-toast-timing.md)

**Issue:** Toast notifications not showing after setTimeout delay

**Status:** Debug logging added, awaiting test results

---

## 🛠️ Debugging Tools

### Cache Cleanup Script

**File:** `../scripts/clear-next-cache.js`

**Usage:**
```bash
pnpm run clean:cache
# or
npm run clean:cache
```

**Purpose:** Automatically clears Next.js build cache and webpack cache to resolve cache-related issues.

---

## 📋 Document Types

| Icon | Type | Description |
|------|------|-------------|
| 🚀 | Summary | Quick overview and action items |
| ⚡ | Quick Fix | Fast troubleshooting steps |
| 🔬 | Deep Dive | Complete technical analysis |
| 🐛 | Investigation | Active debugging in progress |
| 🛠️ | Tool | Utility scripts and automation |

---

## 🔍 Troubleshooting Guide

### Webpack/Build Issues
1. Check [`QUICK-FIX-webpack-cache.md`](./QUICK-FIX-webpack-cache.md)
2. Run `pnpm run clean:cache`
3. Clear browser cache
4. Restart dev server

### Toast/UI Issues
1. Check browser console for debug logs
2. Review component-specific debug docs
3. Verify component mount state

### General Steps
1. Check if issue reproduces in private/incognito mode
2. Clear all caches
3. Check for environment variable issues
4. Review recent config changes

---

## 📊 Issue Status Legend

- ✅ **RESOLVED** - Fixed, may require action
- 🔧 **IN PROGRESS** - Actively being worked on
- 🔍 **INVESTIGATING** - Debug logging added, awaiting data
- 📝 **DOCUMENTED** - Known issue with workaround
- ⏸️ **ON HOLD** - Waiting for external dependency

---

## 🆘 Getting Help

If you encounter an issue:

1. **Check existing debug docs** in this directory
2. **Try the Quick Fix** guides first
3. **Clear caches** - solves 80% of issues
4. **Review Deep Dive** docs for complex issues
5. **Create new debug doc** for new issues (use existing docs as templates)

---

## 📝 Creating New Debug Docs

Template structure:

```markdown
# [Issue Title] - Debug Log

**Date:** YYYY-MM-DD
**Issue:** Brief description
**Severity:** CRITICAL/HIGH/MEDIUM/LOW
**Status:** INVESTIGATING/IN PROGRESS/RESOLVED

## Problem Description
[Clear description of the issue]

## Root Cause
[If identified]

## Reproduction Steps
[How to reproduce]

## Debug Actions Taken
[What you've tried]

## Solution/Workaround
[If found]

## Prevention
[How to avoid in the future]
```

---

**Last Updated:** 2025-11-02  
**Active Issues:** 2 resolved, 1 under investigation (toast timing)

