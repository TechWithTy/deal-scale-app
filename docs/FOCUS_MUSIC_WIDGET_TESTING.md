## Focus Music Widget Testing Mode

Use testing mode to surface the floating Focus Music widget with mock data for rapid UI/UX reviews.

> **Spotify SDK Forward Compatibility**
> We now ship `@spotify/web-api-ts-sdk` via PNPM. Future streaming features should reuse its typed client instead of bespoke fetch calls.

---

## 🎵 Spotify SDK Integration Plan

This document outlines the migration strategy to integrate `@spotify/web-api-ts-sdk` into our existing Spotify OAuth flow, replacing manual `fetch` calls with the official TypeScript SDK for better type safety, maintainability, and feature coverage.

### Current State

**Existing Implementation:**
- ✅ OAuth flow via `/api/spotify/login` and `/api/spotify/callback`
- ✅ Token refresh via `/api/spotify/token` (server-side)
- ✅ Token persistence in FastAPI backend (`/user/preferences/{userId}/spotify`)
- ✅ Widget embeds Spotify playlists via iframe (`open.spotify.com/embed/playlist/{id}`)
- ❌ No typed SDK client (uses raw `fetch` calls)
- ❌ Limited error handling and retry logic
- ❌ No client-side SDK integration

**Files Involved:**
- `app/api/spotify/login/route.ts` - OAuth initiation
- `app/api/spotify/callback/route.ts` - OAuth callback & token exchange
- `app/api/spotify/token/route.ts` - Token refresh endpoint
- `components/ui/FloatingMusicWidget.tsx` - Widget UI (iframe-based)
- `lib/stores/musicPreferences.ts` - Zustand store for preferences

### Migration Strategy

**Phase 1: Server-Side SDK Integration (API Routes)**
Replace manual `fetch` calls in API routes with `SpotifyApi` client for token management and user data retrieval.

**Phase 2: Client-Side SDK Integration (React Hooks)**
Create typed React hooks (`useSpotifyClient`, `useSpotifyPlayer`) that leverage the SDK for playlist management, playback control, and real-time state.

**Phase 3: Enhanced Widget Features**
Upgrade `FloatingMusicWidget` to use SDK-powered controls (play/pause, skip, volume) instead of relying solely on iframe embeds.

### Implementation Steps

#### Step 1: Create Server-Side SDK Client Utility

**File:** `lib/spotify/serverClient.ts`

```typescript
import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";
import { auth } from "@/auth";

/**
 * Creates an authenticated SpotifyApi client for server-side use.
 * Retrieves user's access token from backend and initializes SDK.
 */
export async function createServerSpotifyClient(): Promise<SpotifyApi | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch access token from our token refresh endpoint
  const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/token`, {
    headers: { "x-user-id": session.user.id },
  });

  if (!tokenRes.ok) return null;

  const { access_token } = (await tokenRes.json()) as { access_token: string };

  return SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID!,
    { access_token } as AccessToken,
  );
}
```

#### Step 2: Update Token Refresh Route to Use SDK

**File:** `app/api/spotify/token/route.ts` (partial update)

```typescript
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
// ... existing imports

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  const refreshToken = await resolveRefreshToken(session?.user?.id ?? null);

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Missing Spotify refresh token" },
      { status: 400 },
    );
  }

  try {
    // Use SDK for token refresh (more robust than manual fetch)
    const client = SpotifyApi.withClientCredentials(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
    );

    // Note: SDK doesn't expose refresh directly, so we keep manual refresh
    // but can use SDK for subsequent API calls after refresh
    const response = await requestAccessToken(refreshToken);
    // ... rest of existing logic
  } catch (error) {
    // ... error handling
  }
}
```

#### Step 3: Create Client-Side SDK Hook

**File:** `hooks/useSpotifyClient.ts`

```typescript
"use client";

import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";
import { useEffect, useState, useCallback } from "react";

/**
 * React hook that provides an authenticated SpotifyApi client for client-side use.
 * Fetches access token from our API route and initializes SDK.
 */
export function useSpotifyClient() {
  const [client, setClient] = useState<SpotifyApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initClient() {
      try {
        const tokenRes = await fetch("/api/spotify/token");
        if (!tokenRes.ok) throw new Error("Failed to fetch Spotify token");

        const { access_token } = (await tokenRes.json()) as { access_token: string };

        if (!mounted) return;

        const sdkClient = SpotifyApi.withAccessToken(
          process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
          { access_token } as AccessToken,
        );

        setClient(sdkClient);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setClient(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void initClient();

    return () => {
      mounted = false;
    };
  }, []);

  return { client, isLoading, error };
}
```

#### Step 4: Create Playlist Management Hook

**File:** `hooks/useSpotifyPlaylists.ts`

```typescript
"use client";

import type { PlaylistSimplified } from "@spotify/web-api-ts-sdk";
import { useSpotifyClient } from "./useSpotifyClient";
import { useEffect, useState } from "react";

/**
 * Hook to fetch and manage user's Spotify playlists using the SDK.
 */
export function useSpotifyPlaylists() {
  const { client, isLoading: clientLoading, error: clientError } = useSpotifyClient();
  const [playlists, setPlaylists] = useState<PlaylistSimplified[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (clientLoading || !client) return;

    async function fetchPlaylists() {
      setIsLoading(true);
      setError(null);

      try {
        // Use SDK's typed methods instead of manual fetch
        const response = await client.currentUser.playlists.playlists(50);
        setPlaylists(response.items);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch playlists"));
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPlaylists();
  }, [client, clientLoading]);

  return {
    playlists,
    isLoading: clientLoading || isLoading,
    error: clientError || error,
  };
}
```

#### Step 5: Update Widget to Use SDK (Optional Enhancement)

**File:** `components/ui/FloatingMusicWidget.tsx` (future enhancement)

```typescript
// Future: Replace iframe with SDK-powered controls
import { useSpotifyClient } from "@/hooks/useSpotifyClient";

// Inside component:
const { client } = useSpotifyClient();

// Use SDK to control playback:
// await client?.player.startResumePlayback(deviceId, { context_uri: playlistUri });
```

### Environment Variables

Add to `.env.local`:

```bash
# Required for client-side SDK initialization
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id

# Existing variables (already in use)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
SPOTIFY_SCOPES=user-read-playback-state user-modify-playback-state streaming user-read-currently-playing user-read-private user-read-email playlist-read-private playlist-read-collaborative
```

### Testing Strategy

1. **Unit Tests:** Test SDK client initialization and error handling
2. **Integration Tests:** Verify token refresh flow with SDK
3. **E2E Tests:** Test full OAuth flow → SDK client → playlist fetch

**Test Files to Create:**
- `lib/spotify/__tests__/serverClient.test.ts`
- `hooks/__tests__/useSpotifyClient.test.ts`
- `hooks/__tests__/useSpotifyPlaylists.test.ts`

### Backward Compatibility

- ✅ Keep existing API routes functional during migration
- ✅ Widget continues to work with iframe embeds (no breaking changes)
- ✅ SDK integration is additive—existing code paths remain until fully migrated
- ✅ Gradual rollout: SDK for new features, iframe for existing widget

### Benefits of SDK Integration

1. **Type Safety:** Full TypeScript types for all Spotify API responses
2. **Error Handling:** Built-in retry logic and error types
3. **Maintainability:** Official SDK handles API changes and deprecations
4. **Feature Coverage:** Access to all Spotify Web API endpoints (playlists, tracks, user profile, playback control)
5. **Developer Experience:** Autocomplete and IntelliSense for API methods

### Next Steps

1. ✅ Install SDK: `pnpm add @spotify/web-api-ts-sdk` (completed)
2. ⏳ Create `lib/spotify/serverClient.ts` utility
3. ⏳ Update `app/api/spotify/token/route.ts` to use SDK where applicable
4. ⏳ Create `hooks/useSpotifyClient.ts` for client-side usage
5. ⏳ Create `hooks/useSpotifyPlaylists.ts` for playlist management
6. ⏳ Add unit tests for SDK integration
7. ⏳ Update widget to optionally use SDK-powered controls (future enhancement)

---


### 1. Enable Testing Mode

Add the following environment variables to `.env.local`:

```bash
# Force the widget to render with mock data
NEXT_PUBLIC_MUSIC_WIDGET_DEBUG=true

# Optional: override the mock playlist URI
NEXT_PUBLIC_MUSIC_WIDGET_DEBUG_PLAYLIST=spotify:playlist:37i9dQZF1DX8Uebhn9wzrS
```

Restart `pnpm dev` after updating the file. When the app reloads, the widget mounts automatically in the top-left corner using the provided playlist.

### 2. Verifying Behaviour

- Drag and snap the widget to confirm edge snapping.
- Reload the page to verify local persistence of the last snapped position.
- Resize the viewport to ensure the widget remains visible.
- Use the Music/Voice pills to switch modes. Voice mode pauses playback and shows the voice mic pulse; tap the mic button to pause or resume the animation when recording.

### 3. Toggling Off

Unset the variables or remove them from `.env.local`, then restart the dev server.

```bash
NEXT_PUBLIC_MUSIC_WIDGET_DEBUG=false
```

The widget returns to respecting the user’s stored preferences.

### 4. Automated Tests

Run the focused Vitest suite to validate the store and widget behaviour:

```bash
pnpm vitest run \
  lib/stores/__tests__/musicPreferencesStore.test.ts \
  lib/utils/__tests__/snapToEdge.test.ts \
  _tests/components/ui/FloatingMusicWidget.test.tsx \
  --config vitest.config.ts --reporter=dot
```

This confirms default preferences, debug-mode overrides, snap logic, and portal rendering.

