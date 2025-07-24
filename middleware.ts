import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware function to handle mock authentication and subscription checks
export async function middleware(req: NextRequest) {
  // Temporary mock values for authentication and subscription status
  const isAuthenticated = mockCheckAuth(req); // Simulated authentication check
  const hasActiveSubscription = mockCheckSubscription(req); // Simulated subscription check

  // If the user is not authenticated, redirect to the logout page
  // if (!isAuthenticated) {
  //   const logoutUrl = new URL('/logout', req.url); // Redirect to logout if not authenticated
  //   return NextResponse.redirect(logoutUrl);
  // }

  // // If the user is authenticated but has no active subscription, redirect to the profile page
  // if (!hasActiveSubscription) {
  //   const profileUrl = new URL('/profile', req.url); // Redirect to profile for inactive subscription
  //   return NextResponse.redirect(profileUrl);
  // }

  // If the user is authenticated and has an active subscription, proceed
  return NextResponse.next();
}

// Function to mock the authentication check (replace with real logic later)
function mockCheckAuth(req: NextRequest): boolean {
  // Example: Check for a mock token or session in the request headers (this will be replaced by real auth)
  // For now, assume the user is logged in if they have a 'mockAuthToken' header.
  const token = req.headers.get('mockAuthToken');
  return !!token; // If token exists, user is authenticated
}

// Function to mock the subscription check (replace with real logic later)
function mockCheckSubscription(req: NextRequest): boolean {
  // Example: Check for a mock subscription status in the request headers (this will be replaced by real subscription logic)
  // Assume the user has an active subscription if the 'mockSubscriptionStatus' header is 'active'
  const subscriptionStatus = req.headers.get('mockSubscriptionStatus');
  return subscriptionStatus === 'active'; // Active subscription if header is 'active'
}

// Config to match only the dashboard routes
export const config = {
  matcher: ['/dashboard/:path*'] // Apply middleware to all dashboard routes
};
