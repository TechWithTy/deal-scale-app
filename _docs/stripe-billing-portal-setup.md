# Stripe Billing Portal Setup Guide

## Overview
The billing button in the user dropdown now opens the Stripe Customer Portal in a new tab instead of the modal. This guide shows how to complete the Stripe integration.

## Current Implementation

### What's Done ✅
1. **Updated User Dropdown** (`components/layout/user-nav.tsx`)
   - Removed `openBillingModal` call
   - Added `handleBillingClick` function
   - Opens Stripe portal in new tab with `window.open()`
   - Shows toast notifications for success/error

2. **Created API Route** (`app/api/stripe/portal/route.ts`)
   - Placeholder endpoint ready for Stripe integration
   - Supports both POST (JSON response) and GET (redirect) methods

### What's Needed 🔧

## Step 1: Install Stripe SDK

```bash
npm install stripe
# or
pnpm add stripe
# or
yarn add stripe
```

## Step 2: Add Environment Variables

Add to your `.env.local`:

```env
# Stripe Secret Key (from Stripe Dashboard > Developers > API keys)
STRIPE_SECRET_KEY=sk_test_...

# Optional: Stripe Publishable Key (for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Stripe Portal URL (if you want to override the default)
NEXT_PUBLIC_STRIPE_PORTAL_URL=

# App URL for return redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Implement the API Route

Update `app/api/stripe/portal/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config"; // Adjust path to your auth config

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia", // Use latest API version
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get user's Stripe customer ID from your database
    // Example with Prisma:
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   select: { stripeCustomerId: true }
    // });
    
    // For now, assuming you have it in the session or need to query DB
    const stripeCustomerId = session.user.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer ID found" },
        { status: 400 }
      );
    }

    // 3. Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    // 4. Return the portal URL
    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error("Error creating Stripe portal session:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
```

## Step 4: Update Frontend to Use API

The frontend is already configured! It will:
1. Call `/api/stripe/portal` (POST)
2. Get the `url` from the response
3. Open it in a new tab

If you want to use the actual API response, update `components/layout/user-nav.tsx`:

```typescript
const handleBillingClick = async () => {
  try {
    // Call your API endpoint
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    
    toast.success('Opening billing portal');
  } catch (error) {
    console.error('Error opening billing portal:', error);
    toast.error('Failed to open billing portal. Please try again.');
  }
};
```

## Step 5: Configure Stripe Dashboard

1. **Enable Customer Portal**
   - Go to Stripe Dashboard
   - Navigate to Settings > Billing > Customer portal
   - Click "Activate test link"
   - Configure what customers can do:
     - ✅ Update payment methods
     - ✅ View invoices
     - ✅ Update billing information
     - ✅ Cancel subscriptions (optional)

2. **Customize Branding** (optional)
   - Add your logo
   - Set brand colors
   - Customize email templates

## Step 6: Database Schema

Ensure your user table has a Stripe customer ID field:

```typescript
// Example Prisma schema
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  stripeCustomerId  String?  @unique
  // ... other fields
}
```

## Alternative: Direct Redirect Approach

If you prefer server-side redirect instead of client-side `window.open()`, use the GET endpoint:

```typescript
// In user-nav.tsx
const handleBillingClick = () => {
  // Navigate to API route that will redirect
  window.location.href = '/api/stripe/portal';
};
```

Then implement GET in the API route to return a redirect:

```typescript
export async function GET() {
  // ... authentication and portal creation ...
  return NextResponse.redirect(portalSession.url);
}
```

## Testing

### Test Mode
1. Use Stripe test API keys
2. Test with test credit cards: `4242 4242 4242 4242`
3. Verify portal opens correctly
4. Test updating payment methods
5. Test viewing invoices

### Production
1. Replace test keys with live keys
2. Test with real payment methods
3. Monitor error logs
4. Set up Stripe webhooks for subscription events

## Webhooks (Optional but Recommended)

Set up webhooks to handle subscription changes:

```typescript
// app/api/stripe/webhooks/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.updated':
      // Update subscription in your database
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    // Add more event types as needed
  }

  return new Response(JSON.stringify({ received: true }));
}
```

## Security Checklist

- ✅ Authenticate users before creating portal sessions
- ✅ Verify Stripe customer ID belongs to the authenticated user
- ✅ Use HTTPS in production
- ✅ Never expose Stripe secret key to client
- ✅ Validate webhook signatures
- ✅ Use environment variables for sensitive data
- ✅ Implement rate limiting on API routes
- ✅ Log errors without exposing sensitive information

## Troubleshooting

### "No Stripe customer ID found"
- Ensure users have a Stripe customer ID when they sign up or subscribe
- Create customers using `stripe.customers.create()` during onboarding

### Portal link not working
- Check API keys are correct (test vs live)
- Verify customer ID is valid in Stripe dashboard
- Check return URL is accessible

### CORS errors
- Ensure API route is on same domain
- Check Next.js API route configuration

## Resources

- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Node.js Library](https://github.com/stripe/stripe-node)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Stripe Testing](https://stripe.com/docs/testing)

## Support

If you encounter issues:
1. Check Stripe Dashboard > Logs for API errors
2. Review browser console for client-side errors
3. Check Next.js server logs
4. Contact Stripe support for billing portal issues

---

**Last Updated**: November 6, 2025
**Status**: ⚠️ Implementation Required

