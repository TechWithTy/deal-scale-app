# Vercel Deployment Guide for LeadIgnite

This guide provides step-by-step instructions for deploying the LeadIgnite application to Vercel with proper authentication configuration.

## Prerequisites

- Vercel account
- GitHub repository access
- Environment variables configured

## Environment Variables

### Required Variables

Add these to your Vercel project settings (Environment Variables section):

```env
# Authentication
NEXTAUTH_SECRET=your_secure_random_string_here
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
NODE_ENV=production

# Test User (for demo only, disable in production)
NEXT_PUBLIC_TEST_USER_EMAIL=demo@example.com
NEXT_PUBLIC_TEST_USER_PASSWORD=securepassword123

# Database (update with your production DB)
DATABASE_URL=your_production_database_url
```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

## Deployment Steps

1. **Connect your GitHub repository** to Vercel
2. **Configure project settings**:
   - Framework: Next.js
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `.next`
   - Install Command: `npm install` or `yarn`
3. **Set environment variables** as shown above
4. **Deploy**

## Common Issues & Solutions

### 1. Authentication Loop

**Symptoms**: Users are redirected to login page after successful login

**Solutions**:
- Verify `NEXTAUTH_URL` matches your Vercel deployment URL exactly
- Ensure `NEXTAUTH_SECRET` is set and consistent across all environments
- Check browser console and Vercel logs for errors
- Clear browser cookies and site data

### 2. Environment Variables Not Loading

**Symptoms**: App works locally but fails in production

**Solutions**:
- Verify all required variables are set in Vercel
- Check for typos in variable names
- Ensure variables are added to the correct environment (Production, Preview, Development)
- Redeploy after making changes to environment variables

### 3. CORS Issues

**Symptoms**: API requests blocked due to CORS

**Solutions**:
- Verify `NEXTAUTH_URL` includes the correct protocol (https://)
- Check middleware configuration for proper CORS headers
- Ensure all API routes are properly configured

## Debugging

### Viewing Logs

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to the "Logs" tab
4. Look for errors during build or runtime

### Local Testing

To test the production build locally:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Security Considerations

1. **Secrets Management**:
   - Never commit secrets to version control
   - Use Vercel's environment variables for sensitive data
   - Rotate secrets regularly

2. **Rate Limiting**:
   - Implement rate limiting on authentication endpoints
   - Consider using a CDN or edge middleware for additional protection

3. **Session Management**:
   - Use secure, HTTP-only cookies
   - Set appropriate SameSite and Secure flags
   - Implement session expiration

## Rollback Plan

If a deployment causes issues:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Deployments"
4. Find the last working deployment
5. Click "..." and select "Redeploy"

## Support

For additional help, refer to:
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
