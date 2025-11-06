# Discord OAuth2 Account Linking

## Overview

This document details the OAuth2 flow for linking Discord accounts to DealScale user profiles, enabling seamless authentication and profile synchronization.

## OAuth2 Flow Diagram

```
┌─────────┐                                      ┌─────────┐
│ User    │                                      │ Discord │
│ Browser │                                      │  API    │
└────┬────┘                                      └────┬────┘
     │                                                │
     │ 1. Click "Connect Discord"                    │
     ├────────────────────────────────────────────►  │
     │    GET /oauth2/authorize                      │
     │    ?client_id=...                             │
     │    &redirect_uri=...                          │
     │    &response_type=code                        │
     │    &scope=identify email guilds               │
     │                                                │
     │ 2. Discord Login & Authorize                  │
     │◄───────────────────────────────────────────── │
     │                                                │
     │ 3. Redirect with authorization code           │
     │    /auth/discord/callback?code=...            │
     ├──────────────────────────►                    │
     │                           │                    │
     │                           │ 4. Exchange code   │
     │                           │    for token       │
     │                           ├───────────────────►│
     │                           │ POST /oauth2/token │
     │                           │                    │
     │                           │ 5. Access token    │
     │                           │◄───────────────────┤
     │                           │                    │
     │                           │ 6. Get user info   │
     │                           ├───────────────────►│
     │                           │ GET /users/@me     │
     │                           │                    │
     │                           │ 7. User data       │
     │                           │◄───────────────────┤
     │                           │                    │
     │ 8. Save to database       │                    │
     │    & redirect             │                    │
     │◄──────────────────────────┤                    │
     │                                                │
```

## Frontend Implementation

### 1. Discord Connect Button Component

**File**: `components/discord/DiscordConnectButton.tsx` (max 250 lines)

```typescript
"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DiscordIcon } from "@/components/icons/DiscordIcon"
import { useToast } from "@/hooks/use-toast"

interface DiscordConnectButtonProps {
  isConnected?: boolean
  discordUsername?: string
  onDisconnect?: () => void
}

export function DiscordConnectButton({
  isConnected = false,
  discordUsername,
  onDisconnect,
}: DiscordConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/discord/callback`
  )
  const scope = encodeURIComponent("identify email guilds")
  const state = crypto.randomUUID() // CSRF protection
  
  // Store state in sessionStorage for verification
  if (typeof window !== "undefined") {
    sessionStorage.setItem("discord_oauth_state", state)
  }

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/discord/disconnect", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to disconnect")

      toast({
        title: "Discord Disconnected",
        description: "Your Discord account has been unlinked.",
      })

      onDisconnect?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Discord account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 border border-indigo-600/20">
          <DiscordIcon className="w-5 h-5 text-indigo-400" />
          <span className="text-sm text-indigo-200">{discordUsername}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={isLoading}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Link href={discordAuthUrl}>
      <Button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
        <DiscordIcon className="w-5 h-5 mr-2" />
        Connect Discord
      </Button>
    </Link>
  )
}
```

### 2. OAuth Callback Handler Page

**File**: `app/auth/discord/callback/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function DiscordCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const error = searchParams.get("error")
      const storedState = sessionStorage.getItem("discord_oauth_state")

      // Verify state parameter (CSRF protection)
      if (state !== storedState) {
        setStatus("error")
        toast({
          title: "Security Error",
          description: "Invalid OAuth state. Please try again.",
          variant: "destructive",
        })
        setTimeout(() => router.push("/dashboard"), 2000)
        return
      }

      // Clean up stored state
      sessionStorage.removeItem("discord_oauth_state")

      if (error) {
        setStatus("error")
        toast({
          title: "Authorization Denied",
          description: "You denied Discord authorization.",
          variant: "destructive",
        })
        setTimeout(() => router.push("/dashboard"), 2000)
        return
      }

      if (!code) {
        setStatus("error")
        toast({
          title: "Error",
          description: "No authorization code received.",
          variant: "destructive",
        })
        setTimeout(() => router.push("/dashboard"), 2000)
        return
      }

      try {
        const response = await fetch("/api/auth/discord/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, state }),
        })

        if (!response.ok) {
          throw new Error("Failed to link Discord account")
        }

        const data = await response.json()

        setStatus("success")
        toast({
          title: "Success!",
          description: `Connected to Discord as ${data.discord_username}`,
        })

        setTimeout(() => router.push("/dashboard?tab=profile"), 1500)
      } catch (error) {
        setStatus("error")
        toast({
          title: "Connection Failed",
          description: "Could not connect your Discord account.",
          variant: "destructive",
        })
        setTimeout(() => router.push("/dashboard"), 2000)
      }
    }

    handleCallback()
  }, [searchParams, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">
              Connecting to Discord...
            </h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-xl font-semibold text-white">Connected!</h2>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
              ✕
            </div>
            <h2 className="text-xl font-semibold text-white">
              Connection Failed
            </h2>
          </>
        )}
      </div>
    </div>
  )
}
```

## Backend Implementation

### 1. OAuth Callback Endpoint

**File**: `apps/backend/app/api/routes/auth/discord.py` (max 250 lines)

```python
"""
Discord OAuth2 authentication routes.

This module handles the OAuth2 flow for linking Discord accounts
to DealScale user profiles.
"""

from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import get_current_user
from app.database import get_session
from app.models.user import User

router = APIRouter(prefix="/auth/discord", tags=["auth", "discord"])


class DiscordCallbackRequest(BaseModel):
    """Request model for Discord OAuth callback."""

    code: str
    state: str


class DiscordUserResponse(BaseModel):
    """Response model for Discord user data."""

    discord_id: str
    discord_username: str
    discord_discriminator: str
    discord_avatar: str | None


@router.post("/callback", response_model=DiscordUserResponse)
async def discord_callback(
    payload: DiscordCallbackRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Handle Discord OAuth2 callback and link account.

    This endpoint exchanges the authorization code for an access token,
    fetches the user's Discord profile, and stores the Discord ID
    in the user's DealScale profile.

    Args:
        payload: OAuth callback data containing code and state
        session: Database session
        current_user: Currently authenticated user

    Returns:
        Discord user data

    Raises:
        HTTPException: If OAuth flow fails or account is already linked
    """
    # Exchange authorization code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": settings.DISCORD_CLIENT_ID,
                "client_secret": settings.DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": payload.code,
                "redirect_uri": settings.DISCORD_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code",
            )

        token_data = token_response.json()
        access_token = token_data["access_token"]

        # Fetch Discord user information
        user_response = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Discord user data",
            )

        discord_user = user_response.json()

    # Check if Discord account is already linked to another user
    existing_user = session.exec(
        select(User).where(User.discord_id == discord_user["id"])
    ).first()

    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Discord account is already linked to another user",
        )

    # Update user with Discord information
    current_user.discord_id = discord_user["id"]
    current_user.discord_username = discord_user["username"]
    current_user.discord_discriminator = discord_user.get("discriminator", "0")
    current_user.discord_avatar = discord_user.get("avatar")
    current_user.discord_access_token = access_token  # Store for role management
    current_user.discord_refresh_token = token_data.get("refresh_token")

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "discord_id": current_user.discord_id,
        "discord_username": current_user.discord_username,
        "discord_discriminator": current_user.discord_discriminator,
        "discord_avatar": current_user.discord_avatar,
    }


@router.post("/disconnect")
async def disconnect_discord(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Disconnect Discord account from user profile.

    Args:
        session: Database session
        current_user: Currently authenticated user

    Returns:
        Success message

    Raises:
        HTTPException: If no Discord account is linked
    """
    if not current_user.discord_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Discord account linked",
        )

    # Clear Discord fields
    current_user.discord_id = None
    current_user.discord_username = None
    current_user.discord_discriminator = None
    current_user.discord_avatar = None
    current_user.discord_access_token = None
    current_user.discord_refresh_token = None

    session.add(current_user)
    session.commit()

    return {"message": "Discord account disconnected successfully"}
```

---

**File Size**: Under 250 lines per file  
**Next**: Database schema extensions and environment configuration

