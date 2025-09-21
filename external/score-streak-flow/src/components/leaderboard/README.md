# Leaderboard Components

This folder contains the leaderboard-related components for the Score Streak Flow application.

## LeaderboardContainer

A customizable leaderboard component that displays live rankings with animations and real-time updates.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| animationDuration | number | 0.5 | Duration for all animations in seconds |
| maxPlayers | number | 100 | Maximum number of players to display |
| headerDelay | number | 0 | Delay for header animation in seconds |
| tableDelay | number | 0.2 | Delay for table animation in seconds |
| footerDelay | number | 0.4 | Delay for footer animation in seconds |
| tableRowDuration | number | 0.4 | Duration for individual row animations |
| tableRowDelayMultiplier | number | 0.02 | Multiplier for staggered row animation delays |

### Usage

```tsx
import { LeaderboardContainer } from './LeaderboardContainer';

<LeaderboardContainer 
  animationDuration={1} 
  maxPlayers={50} 
/>
```

### Dependencies

- React
- Framer Motion
- Lucide React (for icons)
- Custom UI components (Badge, Button, etc.)

## LeaderboardTable

Displays the list of players with customizable row animations.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| players | Player[] | - | Array of player objects to display |
| currentUserId | string | 'player-15' | ID of the current user |
| rowDuration | number | 0.4 | Duration for row animations |
| rowDelayMultiplier | number | 0.02 | Delay multiplier for staggered animations |

## Other Components

- YourRankCard: Displays the user's current rank
- RankRow: Individual player row component
- RankHighlight: Highlights for ranks

For more details, see the component files.

## Controls and Behavior

- **Play/Stop animations**: Use the Play/Stop button in the Customize Settings panel to toggle animations and live updates.
- **Spacebar toggle**: Press the Spacebar anywhere (inputs are ignored) to toggle Play/Stop.
- **Paused state indicator**: When live updates are paused, a small "Paused" badge shows next to the connection status badge.

## Persistence

The component persists user preferences in `localStorage`:

- **Animations enabled**: `leaderboard:animationsEnabled` ("true" | "false")
- **Page size**: `leaderboard:pageSize` (number)
- **Visible count**: `leaderboard:visibleCount` (number)

These values are restored on mount if present.
