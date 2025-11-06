# Database Schema Extensions for Discord Integration

## Overview

This document outlines the database schema changes required to support Discord integration, including user profile extensions, leaderboard tracking, and credit request management.

## Schema Migrations

### 1. User Model Extensions

**File**: `apps/backend/app/models/user.py` (additions)

```python
"""User model with Discord integration fields."""

from datetime import datetime
from typing import Optional

from sqlmodel import Column, Field, Relationship, SQLModel
from sqlalchemy import String, BigInteger


class User(SQLModel, table=True):
    """
    User model with Discord account linking support.
    
    Extends the base User model with Discord-specific fields
    for OAuth2 authentication and profile synchronization.
    """
    
    __tablename__ = "users"
    
    # Existing fields (from base User model)
    id: int = Field(primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Discord integration fields
    discord_id: Optional[str] = Field(
        default=None,
        sa_column=Column(String(20), unique=True, index=True, nullable=True),
        description="Discord user ID (snowflake)",
    )
    discord_username: Optional[str] = Field(
        default=None,
        max_length=32,
        description="Discord username without discriminator",
    )
    discord_discriminator: Optional[str] = Field(
        default=None,
        max_length=4,
        description="Discord discriminator (deprecated by Discord, kept for legacy)",
    )
    discord_avatar: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Discord avatar hash",
    )
    discord_access_token: Optional[str] = Field(
        default=None,
        description="Encrypted Discord OAuth access token for role management",
    )
    discord_refresh_token: Optional[str] = Field(
        default=None,
        description="Encrypted Discord OAuth refresh token",
    )
    discord_linked_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp when Discord account was linked",
    )
    
    # Leaderboard fields
    leaderboard_score: int = Field(default=0, description="Total leaderboard points")
    leaderboard_rank: Optional[int] = Field(
        default=None,
        index=True,
        description="Current leaderboard rank",
    )
    leaderboard_rank_previous: Optional[int] = Field(
        default=None,
        description="Previous leaderboard rank for delta calculation",
    )
    leaderboard_updated_at: Optional[datetime] = Field(
        default=None,
        description="Last leaderboard calculation timestamp",
    )
    
    # Credits
    credits_ai: int = Field(default=0, ge=0, description="Available AI credits")
    credits_lead: int = Field(default=0, ge=0, description="Available lead credits")
    credits_updated_at: Optional[datetime] = Field(
        default=None,
        description="Last credit balance update",
    )
    
    # Relationships
    credit_requests: list["CreditRequest"] = Relationship(back_populates="user")
    leaderboard_history: list["LeaderboardHistory"] = Relationship(
        back_populates="user"
    )
    
    @property
    def discord_display_name(self) -> Optional[str]:
        """Get full Discord display name."""
        if not self.discord_username:
            return None
        if self.discord_discriminator and self.discord_discriminator != "0":
            return f"{self.discord_username}#{self.discord_discriminator}"
        return self.discord_username
    
    @property
    def discord_avatar_url(self) -> Optional[str]:
        """Get Discord avatar URL."""
        if not self.discord_id or not self.discord_avatar:
            return None
        return (
            f"https://cdn.discordapp.com/avatars/"
            f"{self.discord_id}/{self.discord_avatar}.png"
        )
    
    @property
    def rank_change(self) -> int:
        """Calculate rank change delta."""
        if self.leaderboard_rank is None or self.leaderboard_rank_previous is None:
            return 0
        # Negative means moved up (lower rank number)
        return self.leaderboard_rank_previous - self.leaderboard_rank
```

### 2. Credit Request Model

**File**: `apps/backend/app/models/credit_request.py`

```python
"""Credit request model for Discord bot integration."""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Column, Field, Relationship, SQLModel
from sqlalchemy import String, Enum as SQLEnum


class CreditType(str, Enum):
    """Types of credits that can be requested."""
    
    AI = "ai"
    LEAD = "lead"


class CreditRequestStatus(str, Enum):
    """Status of a credit request."""
    
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class CreditRequest(SQLModel, table=True):
    """
    Credit request submitted via Discord or web interface.
    
    Tracks requests for AI or lead credits, including approval workflow
    and audit trail.
    """
    
    __tablename__ = "credit_requests"
    
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    # Request details
    credit_type: CreditType = Field(
        sa_column=Column(SQLEnum(CreditType), nullable=False),
        description="Type of credit requested",
    )
    amount: int = Field(gt=0, description="Number of credits requested")
    reason: Optional[str] = Field(
        default=None,
        max_length=500,
        description="User-provided reason for request",
    )
    
    # Status tracking
    status: CreditRequestStatus = Field(
        default=CreditRequestStatus.PENDING,
        sa_column=Column(SQLEnum(CreditRequestStatus), nullable=False),
        description="Current status of the request",
    )
    
    # Source tracking
    requested_via: str = Field(
        default="web",
        max_length=50,
        description="Source of request: 'discord' or 'web'",
    )
    discord_message_id: Optional[str] = Field(
        default=None,
        description="Discord message ID for tracking and updates",
    )
    discord_channel_id: Optional[str] = Field(
        default=None,
        description="Discord channel ID where request was made",
    )
    
    # Approval workflow
    approved_by_id: Optional[int] = Field(
        default=None,
        foreign_key="users.id",
        description="User ID of approver/rejector",
    )
    approved_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp of approval/rejection",
    )
    approval_note: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Admin note for approval/rejection",
    )
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(
        back_populates="credit_requests",
        sa_relationship_kwargs={"foreign_keys": "[CreditRequest.user_id]"},
    )
    approved_by: Optional["User"] = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[CreditRequest.approved_by_id]",
            "lazy": "joined",
        }
    )
```

### 3. Leaderboard History Model

**File**: `apps/backend/app/models/leaderboard.py`

```python
"""Leaderboard history tracking for analytics and trend analysis."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class LeaderboardHistory(SQLModel, table=True):
    """
    Historical snapshot of user leaderboard positions.
    
    Enables trend analysis, rank change tracking, and
    historical performance visualization.
    """
    
    __tablename__ = "leaderboard_history"
    
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    # Snapshot data
    rank: int = Field(description="Rank at snapshot time")
    score: int = Field(description="Score at snapshot time")
    
    # Metrics for gamification
    deals_closed: int = Field(default=0, description="Number of deals closed")
    leads_generated: int = Field(default=0, description="Number of leads generated")
    campaigns_launched: int = Field(default=0, description="Campaigns launched")
    response_rate: float = Field(default=0.0, description="Average response rate %")
    
    # Metadata
    snapshot_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="When this snapshot was taken",
    )
    
    # Relationships
    user: "User" = Relationship(back_populates="leaderboard_history")


class LeaderboardSnapshot(SQLModel, table=True):
    """
    System-wide leaderboard snapshot for performance optimization.
    
    Pre-calculated leaderboard data cached for fast retrieval.
    Regenerated every 30 seconds by background job.
    """
    
    __tablename__ = "leaderboard_snapshots"
    
    id: int = Field(primary_key=True)
    
    # Cached data
    top_100: str = Field(
        description="JSON string of top 100 players with full details"
    )
    total_players: int = Field(description="Total number of active players")
    
    # Metadata
    generated_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="When this snapshot was generated",
    )
    generation_duration_ms: int = Field(
        description="Time taken to generate snapshot in milliseconds"
    )
```

## Migration Scripts

### Alembic Migration

**File**: `apps/backend/alembic/versions/XXXX_add_discord_integration.py`

```python
"""Add Discord integration and leaderboard tables.

Revision ID: XXXX
Revises: YYYY
Create Date: 2025-11-06
"""

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers
revision = "XXXX"
down_revision = "YYYY"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add Discord and leaderboard fields to users table."""
    # Add Discord fields to users
    op.add_column("users", sa.Column("discord_id", sa.String(20), nullable=True))
    op.add_column("users", sa.Column("discord_username", sa.String(32), nullable=True))
    op.add_column("users", sa.Column("discord_discriminator", sa.String(4), nullable=True))
    op.add_column("users", sa.Column("discord_avatar", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("discord_access_token", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("discord_refresh_token", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("discord_linked_at", sa.DateTime(), nullable=True))
    
    # Add leaderboard fields to users
    op.add_column("users", sa.Column("leaderboard_score", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("leaderboard_rank", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("leaderboard_rank_previous", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("leaderboard_updated_at", sa.DateTime(), nullable=True))
    
    # Add credit fields to users
    op.add_column("users", sa.Column("credits_ai", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("credits_lead", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("credits_updated_at", sa.DateTime(), nullable=True))
    
    # Create indexes
    op.create_index("ix_users_discord_id", "users", ["discord_id"], unique=True)
    op.create_index("ix_users_leaderboard_rank", "users", ["leaderboard_rank"])
    
    # Create credit_requests table
    op.create_table(
        "credit_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("credit_type", sa.Enum("ai", "lead", name="credittype"), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(500), nullable=True),
        sa.Column("status", sa.Enum("pending", "approved", "rejected", "cancelled", name="creditrequeststatus"), nullable=False),
        sa.Column("requested_via", sa.String(50), nullable=False),
        sa.Column("discord_message_id", sa.String(20), nullable=True),
        sa.Column("discord_channel_id", sa.String(20), nullable=True),
        sa.Column("approved_by_id", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("approval_note", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_credit_requests_user_id", "credit_requests", ["user_id"])
    
    # Create leaderboard_history table
    op.create_table(
        "leaderboard_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("deals_closed", sa.Integer(), nullable=False),
        sa.Column("leads_generated", sa.Integer(), nullable=False),
        sa.Column("campaigns_launched", sa.Integer(), nullable=False),
        sa.Column("response_rate", sa.Float(), nullable=False),
        sa.Column("snapshot_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_leaderboard_history_user_id", "leaderboard_history", ["user_id"])
    op.create_index("ix_leaderboard_history_snapshot_at", "leaderboard_history", ["snapshot_at"])
    
    # Create leaderboard_snapshots table
    op.create_table(
        "leaderboard_snapshots",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("top_100", sa.Text(), nullable=False),
        sa.Column("total_players", sa.Integer(), nullable=False),
        sa.Column("generated_at", sa.DateTime(), nullable=False),
        sa.Column("generation_duration_ms", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_leaderboard_snapshots_generated_at", "leaderboard_snapshots", ["generated_at"])


def downgrade() -> None:
    """Remove Discord integration tables and fields."""
    # Drop tables
    op.drop_table("leaderboard_snapshots")
    op.drop_table("leaderboard_history")
    op.drop_table("credit_requests")
    
    # Drop indexes
    op.drop_index("ix_users_leaderboard_rank", "users")
    op.drop_index("ix_users_discord_id", "users")
    
    # Drop columns from users
    op.drop_column("users", "credits_updated_at")
    op.drop_column("users", "credits_lead")
    op.drop_column("users", "credits_ai")
    op.drop_column("users", "leaderboard_updated_at")
    op.drop_column("users", "leaderboard_rank_previous")
    op.drop_column("users", "leaderboard_rank")
    op.drop_column("users", "leaderboard_score")
    op.drop_column("users", "discord_linked_at")
    op.drop_column("users", "discord_refresh_token")
    op.drop_column("users", "discord_access_token")
    op.drop_column("users", "discord_avatar")
    op.drop_column("users", "discord_discriminator")
    op.drop_column("users", "discord_username")
    op.drop_column("users", "discord_id")
```

---

**Next**: Bot implementation and slash commands

