# Leaderboard Modal

A real-time leaderboard feature that displays user rankings based on performance metrics with live updates and animations.

## Components

### LeaderboardModal.tsx
Main modal component that displays the leaderboard interface.

**Location:** `components/reusables/modals/user/leaderboard/LeaderboardModal.tsx`

**Features:**
- Full-screen modal with responsive design
- Real-time WebSocket updates (simulated)
- Animated rank changes
- Current user rank highlighting
- Pagination controls
- Settings panel for animation customization

## External Components

The leaderboard uses components from the `external/score-streak-flow` package:

### LeaderboardContainer
**Location:** `external/score-streak-flow/src/components/leaderboard/LeaderboardContainer.tsx`

**Features:**
- Main leaderboard logic and state management
- Progressive reveal animations
- Customizable animation settings
- Player filtering and pagination
- AI predictions for players to watch

### WebSocketProvider
**Location:** `external/score-streak-flow/src/components/realtime/WebSocketProvider.tsx`

**Provides:**
- Mock real-time data updates
- Connection status management
- Pause/resume functionality
- Data throttling for performance

### Sub-Components
- **LeaderboardTable:** Displays ranked players with animations
- **YourRankCard:** Shows current user's rank
- **LeaderboardHeader:** Title and connection status
- **LeaderboardSettingsPanel:** Animation controls
- **TableToolbar:** Pagination and display options
- **RankRow:** Individual player row with rank, avatar, stats
- **PlayerToWatchAlert:** AI-powered player recommendations

## Navbar Integration

### LeaderboardDropdown.tsx
Navbar button that opens the leaderboard modal.

**Location:** `components/navbar/LeaderboardDropdown.tsx`

**Features:**
- Trophy icon from lucide-react
- Yellow pulsing indicator when rank has changed
- Clears indicator when modal is opened
- Tracks rank changes via gamification store

**Indicator Logic:**
```typescript
// Shows yellow dot when:
// - User's rank has changed since last view
// - Compares current rank to stored rank in localStorage
```

## State Management

### Modal State
Managed in `lib/stores/dashboard.ts`:
```typescript
isLeaderboardModalOpen: boolean;
openLeaderboardModal: () => void;
closeLeaderboardModal: () => void;
```

### Gamification State
Managed in `lib/stores/gamification.ts`:
```typescript
lastKnownRank: number | null;
hasRankChanged: boolean;
setLastKnownRank: (rank: number) => void;
checkRankChange: (currentRank: number) => boolean;
clearRankChangeIndicator: () => void;
```

**Rank Change Detection:**
```typescript
// Stores last known rank in localStorage
// Compares with current rank when leaderboard loads
// Shows indicator if ranks differ
```

## Data Structure

### Player Object
```typescript
interface Player {
  id: string;
  rank: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  score: number;
  change: "up" | "down" | "same";
  badges?: Badge[];
  isOnline?: boolean;
}
```

### Leaderboard Data
```typescript
interface LeaderboardData {
  players: Player[];
  totalPlayers: number;
  myRank: number | null;
  lastUpdated: Date;
}
```

## Features

### Real-Time Updates
- Mock WebSocket connection simulates live data
- Updates every 3-8 seconds (randomized)
- Smooth animations for rank changes
- Connection status indicator

### Animations
All animations are customizable via settings panel:
- **Progressive Reveal:** Players appear one-by-one
- **Rank Changes:** Smooth transitions when positions change
- **Highlight Current User:** Different styling for your rank
- **Staggered Delays:** Cascade effect for multiple changes

### Pagination
- Adjustable page size (10, 25, 50, 100)
- Load more button for additional players
- Max players limit (configurable)

### Settings
Users can customize:
- Animation duration
- Animation delays
- Progressive reveal speed
- Pause/resume live updates

## Usage

### Opening the Modal
```typescript
import { useModalStore } from "@/lib/stores/dashboard";

const { openLeaderboardModal } = useModalStore();
openLeaderboardModal();
```

### Tracking Rank Changes
```typescript
import { useGamificationStore } from "@/lib/stores/gamification";

const { setLastKnownRank, checkRankChange } = useGamificationStore();

// When user's rank is updated
setLastKnownRank(newRank);

// Check if rank changed
const hasChanged = checkRankChange(currentRank);
```

### Integrating with Real WebSocket
To replace mock data with real WebSocket:

1. Create a real WebSocket provider
2. Update `WebSocketProvider.tsx` to connect to your backend
3. Implement server-side ranking logic
4. Stream rank updates via WebSocket

```typescript
// Example real WebSocket integration
const ws = new WebSocket('wss://your-api.com/leaderboard');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setLeaderboardData(data);
};
```

## Scoring System

### Current Mock Implementation
Uses mock score generation based on:
- Random base score (500-8000 range)
- Online/offline status
- Rank position adjustments

### Implementing Real Scoring
Replace mock data with actual user metrics:
- Deal closures
- Lead conversions
- Revenue generated
- Activity levels
- Campaign performance

## Customization

### Animation Settings
Default configuration in `external/score-streak-flow/src/components/leaderboard/config.ts`:

```typescript
export const leaderboardConfig = {
  animationDuration: 0.5,
  headerDelay: 0,
  tableDelay: 0.2,
  footerDelay: 0.4,
  tableRowDuration: 0.4,
  tableRowDelayMultiplier: 0.02,
  maxPlayers: 100,
  refreshIntervalMs: 5000,
};
```

### Styling
The leaderboard uses Tailwind classes and can be customized via:
- Component className props
- Theme color variables
- Custom CSS modules
- Dark mode variants

## Performance Optimization

### Data Throttling
- Throttled snapshots of live data
- Prevents excessive re-renders
- Configurable refresh interval

### Progressive Reveal
- Incremental rendering of players
- Reduces initial load time
- Smooth visual experience

### Memoization
- React.useMemo for computed values
- useCallback for event handlers
- Prevents unnecessary recalculations

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management in modal
- Semantic HTML structure
- Color contrast compliance

## Integration Points

### Dashboard Layout
Modal is rendered in `app/dashboard/layout.tsx`:
```typescript
<LeaderboardModal />
```

### Header
Navbar icon in `components/layout/header.tsx`:
```typescript
<LeaderboardDropdown />
```

## Future Enhancements

1. **Real-time Notifications:** Push notifications for rank changes
2. **Historical Data:** View rank progression over time
3. **Filters:** Filter by team, region, time period
4. **Achievements:** Special badges for milestones
5. **Social Features:** Challenge friends, share ranks
6. **Rewards:** Prize pools for top performers
7. **Analytics:** Detailed performance metrics

## Testing

Test the leaderboard by:
1. Opening modal via trophy icon in navbar
2. Verifying rank change indicator works
3. Testing animation settings
4. Checking responsive design
5. Testing keyboard navigation
6. Verifying WebSocket connection status

