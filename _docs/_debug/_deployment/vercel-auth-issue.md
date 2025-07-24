# Vercel Deployment Authentication Issue

## Issue Description
When deploying to Vercel, users were being redirected to the login page after successful authentication, despite working correctly in the local development environment. This document outlines the issue and its resolution.

## Symptoms
- Successful login on Vercel preview/production
- Immediate redirection back to login page after authentication
- Session not persisting across page refreshes
- Works as expected in local development
- Possible CORS or cookie-related errors in browser console

## Root Cause Analysis
After thorough investigation, the following root causes were identified:

1. **Environment Configuration**
   - `NEXTAUTH_URL` not properly set for Vercel's dynamic URLs
   - Environment variables not properly exposed during build time
   - Missing or inconsistent `NEXTAUTH_SECRET`

2. **Cookie Handling**
   - Incorrect cookie domain configuration for Vercel's preview deployments
   - Inconsistent secure cookie settings between development and production
   - Cookie attributes not properly set for cross-origin requests

3. **Middleware & Session Management**
   - Session validation failing in middleware
   - Incomplete public path configurations
   - Missing security headers affecting authentication flow

## Solution Implemented

### 1. Environment Configuration

#### Vercel Project Settings
```env
# Required Environment Variables
NEXTAUTH_URL=https://your-app-url.vercel.app  # Must match deployment URL exactly
NEXTAUTH_SECRET=your_secure_random_string_here
NODE_ENV=production
NEXTAUTH_DEBUG=true  # Enable for debugging, disable in production

# Test User (for development only)
NEXT_PUBLIC_TEST_USER_EMAIL=test@example.com
NEXT_PUBLIC_TEST_USER_PASSWORD=testpassword
```

#### Next.js Configuration (next.config.js)
```javascript
// next.config.js
module.exports = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "http://localhost:3000"),
    NEXTAUTH_DEBUG: process.env.NODE_ENV !== 'production',
  },
  // ... other config
};
```

### 2. NextAuth Configuration (auth.config.ts)

```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    // Your authentication providers
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getCookieDomain(baseUrl), // Handles Vercel preview URLs
      },
    },
  },
  debug: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
  trustHost: true, // Required for Vercel
  // ... other config
};

// Helper function to get cookie domain
function getCookieDomain(url: string) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname === 'localhost') return undefined;
    if (hostname.endsWith('.vercel.app')) return hostname;
    const parts = hostname.split('.');
    return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
  } catch (e) {
    console.error("Error parsing URL for cookie domain:", e);
    return undefined;
  }
}
```

### 3. Middleware Implementation (middleware.ts)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/register",
  "/auth/error",
  "/api/auth/**",
  "/_next/**",
  "/favicon.ico"
];

// Check if path is public
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) =>
      pathname === path ||
      (path.endsWith("**") && pathname.startsWith(path.slice(0, -3)))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  try {
    // Get session token with secure cookie setting
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    // Debug logging
    console.log('Middleware - Session Check:', {
      pathname,
      hasSession: !!session,
      url: request.url,
      method: request.method,
    });

    // Redirect to sign-in if no session
    if (!session) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Add security headers to authenticated responses
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('x-frame-options', 'DENY');
    response.headers.set('x-content-type-options', 'nosniff');
    response.headers.set('x-xss-protection', '1; mode=block');
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'MiddlewareError');
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Troubleshooting: What Worked and What Didn't

### ✅ What Worked

1. **Environment Configuration**
   - Setting `NEXTAUTH_URL` explicitly in Vercel environment variables
   - Using `VERCEL_URL` as a fallback for dynamic preview URLs
   - Enabling debug mode in development and production

2. **Cookie Handling**
   - Dynamic cookie domain detection for Vercel preview URLs
   - Setting `secureCookie: process.env.NODE_ENV === "production"`
   - Using `__Secure-` prefix for production cookies

3. **Middleware Improvements**
   - Detailed request logging
   - Proper handling of public paths
   - Secure session validation with `getToken`
   - Comprehensive error handling and redirection

4. **Security Headers**
   - Setting `x-frame-options: DENY`
   - Enabling `x-content-type-options: nosniff`
   - Configuring `x-xss-protection: 1; mode=block`

### ❌ What Didn't Work

1. **Cookie Domain Configuration**
   - Hardcoding cookie domains
   - Not handling Vercel preview URLs specially
   - Using `localhost` as a cookie domain

2. **Environment Variables**
   - Relying solely on `NEXTAUTH_URL` without fallbacks
   - Not exposing necessary variables to the browser
   - Inconsistent variable naming between environments

3. **Middleware Issues**
   - Not properly handling all public paths
   - Missing error boundaries in middleware
   - Incomplete session validation

### Common Pitfalls and Solutions

1. **Authentication Loop**
   - ❌ **Problem**: Infinite redirects between login and callback
   - ✅ **Solution**: 
     - Verify `NEXTAUTH_URL` matches exactly (including https://)
     - Ensure all auth-related routes are in `publicPaths`
     - Check for cookie domain mismatches

2. **Session Not Persisting**
   - ❌ **Problem**: Session lost on page refresh
   - ✅ **Solution**:
     - Verify cookie settings in `auth.config.ts`
     - Check for mixed content issues (HTTP vs HTTPS)
     - Ensure `secureCookie` matches environment

3. **CORS Errors**
   - ❌ **Problem**: Blocked by CORS policy
   - ✅ **Solution**:
     - Verify `NEXTAUTH_URL` includes correct protocol
     - Check middleware CORS headers
     - Ensure API routes handle OPTIONS requests

## Testing and Verification

### 1. Local Testing

### 1. Local Testing
```bash
# Test production build locally
npm run build
npm run start

# Verify authentication flow
# - Clear browser cookies
# - Test login/logout
# - Verify session persists across page refreshes
```

### 2. Vercel Deployment Testing
1. Push changes to your repository
2. Monitor Vercel deployment logs for errors
3. After successful deployment:
   - Clear browser cookies for the domain
   - Test login with test credentials
   - Verify session cookie is set with correct attributes:
     - `Secure` flag in production
     - Correct `Domain` attribute
     - `SameSite=Lax`
   - Check network requests to `/api/auth/session` return 200 with user data
   - Verify protected routes are accessible after login

## Debugging Common Issues

### 1. Authentication Loop
**Symptoms**: User is redirected to login after successful authentication
**Solutions**:
- Verify `NEXTAUTH_URL` matches deployment URL exactly (including https://)
- Check browser console for CORS or cookie-related errors
- Ensure `NEXTAUTH_SECRET` is set and consistent
- Clear browser cookies and site data

### 2. Session Not Persisting
**Symptoms**: Session is lost on page refresh
**Solutions**:
- Verify cookie domain is set correctly for Vercel URLs
- Check that `useSecureCookies` matches environment
- Ensure middleware is not blocking session-related requests

### 3. Environment Variables Not Loading
**Symptoms**: App works locally but fails in production
**Solutions**:
- Verify all required variables are set in Vercel
- Check for typos in variable names
- Ensure variables are added to the correct environment
- Check Vercel deployment logs for errors

## Rollback Plan
If issues are detected in production:
1. Identify the last working deployment in Vercel
2. Use Vercel's rollback feature to revert to the previous version
3. If needed, create a hotfix branch and deploy with minimal changes

## Monitoring and Logs

### Vercel Logs
1. Go to Vercel dashboard
2. Select your project
3. Navigate to "Logs" tab
4. Filter for errors or warnings

### Browser Console
1. Open browser developer tools (F12)
2. Check Console and Network tabs for errors
3. Look for failed API requests or authentication-related errors

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to version control
   - Use Vercel's environment variables for sensitive data
   - Rotate `NEXTAUTH_SECRET` regularly

2. **Session Security**
   - Use secure, HTTP-only cookies
   - Set appropriate `SameSite` and `Secure` flags
   - Implement session expiration

3. **Rate Limiting**
   - Consider implementing rate limiting on authentication endpoints
   - Use Vercel's edge middleware for additional protection

## Related Documentation
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Secure Cookie Settings](https://web.dev/articles/samesite-cookies-explained)

## Changelog

### 2025-06-03
- Initial implementation of Vercel auth fixes
- Added dynamic cookie domain handling
- Improved middleware with better error handling
- Enhanced security headers and CORS configuration
- Added comprehensive documentation
