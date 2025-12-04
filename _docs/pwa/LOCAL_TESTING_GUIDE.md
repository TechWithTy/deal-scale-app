# PWA Local Testing Guide

This guide explains how to test PWA features (offline banner, service workers, install prompt) on your local development machine.

## 🔑 Key Issue: PWA is Production-Only by Default

By default, PWA features (service workers, offline detection, install prompts) are **ONLY enabled in production builds**, not in `pnpm dev` mode.

```javascript
// next.config.js lines 22-25
const isProd = process.env.NODE_ENV === "production";
const disablePwa = process.env.NEXT_DISABLE_PWA === "1";
```

## 🧪 Method 1: Test with Production Build Locally (Recommended)

This is the most accurate way to test PWA features as they'll work in production:

### Step 1: Build for Production
```bash
pnpm build
```

### Step 2: Start Production Server
```bash
pnpm start
```

### Step 3: Open in Browser
```
http://localhost:3000
```

### Step 4: Test Offline Banner
1. Open DevTools (F12)
2. Go to **Network** tab
3. Check the **"Offline"** checkbox at the top
4. The offline banner should appear
5. Click **Dismiss** - it should hide for 5 minutes
6. Uncheck **"Offline"** - banner should auto-hide when back online

### Step 5: Test Service Worker
1. In DevTools, go to **Application** tab
2. Click **Service Workers** in left sidebar
3. You should see the registered service worker
4. Click **"Offline"** checkbox
5. Navigate around - cached pages should still load

### Step 6: Test Install Prompt
1. After 3 visits or meaningful engagement
2. You should see an install prompt banner
3. Click to install as PWA

## 🧪 Method 2: Force PWA in Development (Quick Testing)

If you need PWA features during `pnpm dev` for quick testing:

### Option A: Modify next.config.js Temporarily

```javascript
// next.config.js - TEMPORARILY change line 22 to:
const isProd = true; // Force PWA on

// Remember to revert this after testing!
```

### Option B: Override NODE_ENV

```bash
# Linux/Mac
NODE_ENV=production pnpm dev

# Windows (PowerShell)
$env:NODE_ENV="production"; pnpm dev

# Windows (CMD)
set NODE_ENV=production && pnpm dev
```

⚠️ **Warning**: This may cause other production-only behavior to activate.

## 🧪 Method 3: Use Existing Test Suite

Run the automated PWA tests:

```bash
pnpm test:pwa
```

This runs the test suite at `_tests/pwa/pwa.spec.ts` which covers:
- Push notification subscription state
- Install prompt flow
- Service worker update lifecycle

## 🌐 Method 4: Test on Vercel Preview Deployment

1. Push your branch to GitHub
2. Vercel will create a preview deployment automatically
3. Preview deployments run in production mode with PWA enabled
4. Test at the preview URL

```bash
git push origin your-branch-name
# Wait for Vercel to deploy
# Get preview URL from Vercel dashboard or GitHub PR
```

## 🔍 Testing the Offline Banner Specifically

### Test False Positive Prevention

Our offline banner now uses production-aware detection. To test:

1. **Local Production Build** (`pnpm build && pnpm start`):
   - Should NOT show banner on load
   - Should only show when actually offline

2. **Network Tab Simulation**:
   ```
   DevTools → Network → Check "Offline"
   ```
   - Banner should appear after connectivity verification
   - Should disappear when unchecked

3. **Dismiss Persistence**:
   - Click dismiss
   - Refresh page (while still "offline")
   - Banner should NOT reappear for 5 minutes
   - Check localStorage for `offline-banner-dismissed`

4. **Auto-Recovery**:
   - Dismiss banner (while offline)
   - Go back online
   - Dismiss state should clear
   - Next offline event should show banner again

## 📱 Testing on Mobile Devices

### On Your Local Network:

1. **Find your local IP**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Start production server**:
   ```bash
   pnpm build && pnpm start
   ```

3. **Access from mobile**:
   ```
   http://YOUR_LOCAL_IP:3000
   ```

4. **Enable offline mode**:
   - iOS: Settings → Airplane Mode
   - Android: Settings → Network → Airplane Mode

## 🛠️ Environment Variables for PWA Testing

### `.env.local` Configuration

```bash
# Disable PWA completely (useful for debugging non-PWA issues)
NEXT_DISABLE_PWA=1

# Enable production mode checks
NODE_ENV=production
```

### Relevant Environment Variables

From `next.config.js`:
- `NODE_ENV=production` - Enables PWA features
- `NEXT_DISABLE_PWA=1` - Disables PWA even in production
- `ANALYZE=true` - Analyze bundle size (includes SW)

## 🐛 Debugging Tips

### Service Worker Not Registering

1. Check browser console for errors
2. Ensure you're on `localhost` or HTTPS (required for SW)
3. Verify `public/sw-custom.js` exists
4. Check DevTools → Application → Service Workers

### Offline Banner Not Appearing

1. Verify you're running production build (`pnpm build && pnpm start`)
2. Check DevTools → Network → "Offline" is checked
3. Open console - look for connectivity check logs
4. Verify `/api/health` endpoint is responding

### Banner Won't Dismiss

1. Check browser console for JavaScript errors
2. Verify localStorage is enabled
3. Check DevTools → Application → Local Storage → `offline-banner-dismissed`
4. Clear localStorage and try again

### False Positives in Production

The fix we just implemented should prevent this, but if it persists:

1. Check `navigator.onLine` value in console
2. Verify `/api/health` endpoint is accessible
3. Check for CORS issues with health check
4. Review network connectivity from browser's perspective

## 📊 Lighthouse PWA Audit

Run Lighthouse PWA audit locally:

```bash
# On local production build
pnpm build && pnpm start

# In another terminal
pnpm perf:lighthouse:local
```

This will generate a report at `reports/lighthouse/local.html` showing PWA compliance.

## ✅ Complete Testing Checklist

- [ ] Production build starts successfully
- [ ] Service worker registers in DevTools
- [ ] Offline banner appears when network is disabled
- [ ] Offline banner dismiss button works
- [ ] Dismiss persists for 5 minutes in localStorage
- [ ] Banner auto-hides when back online
- [ ] No false positives on initial page load
- [ ] `/api/health` endpoint responds correctly
- [ ] Install prompt appears after engagement
- [ ] PWA can be installed to home screen
- [ ] Cached pages work offline
- [ ] Lighthouse PWA score is satisfactory

## 🚀 Ready for Production

Once all tests pass locally, deploy to Vercel and verify:

1. Deploy to production or preview
2. Test on actual mobile device
3. Install as PWA from mobile browser
4. Test offline functionality in real-world scenario
5. Monitor analytics for PWA usage metrics

---

**Remember**: Always test PWA features with `pnpm build && pnpm start`, not `pnpm dev`!

