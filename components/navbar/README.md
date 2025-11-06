# Navbar Gamification Icons

Documentation for the leaderboard and wheel spinner icons added to the top navigation bar.

## Overview

Two new gamification features have been added to the navbar with indicator badges:
- **Leaderboard** (Trophy icon) - Shows when rank has changed
- **Wheel Spinner** (CircleDashed icon) - Shows when daily spin is available

## Components

### LeaderboardDropdown.tsx
**Location:** `components/navbar/LeaderboardDropdown.tsx`

**Icon:** Trophy (🏆)

**Indicator:**
- Yellow pulsing dot
- Shows when user's rank has changed
- Clears when leaderboard is opened

**Implementation:**
```typescript
const { hasRankChanged, clearRankChangeIndicator } = useGamificationStore();

const handleClick = () => {
  clearRankChangeIndicator();
  openLeaderboardModal();
};
```

### WheelSpinnerDropdown.tsx
**Location:** `components/navbar/WheelSpinnerDropdown.tsx`

**Icon:** CircleDashed (🎡)

**Indicator:**
- Amber pulsing dot
- Shows when daily spin is available
- Checks every minute
- Clears when modal is opened

**Implementation:**
```typescript
const { checkSpinAvailability, markSpinAsViewed } = useGamificationStore();

useEffect(() => {
  const checkAvailability = () => {
    const available = checkSpinAvailability(userId, "daily");
    setIsAvailable(available);
  };
  
  checkAvailability();
  const interval = setInterval(checkAvailability, 60000);
  return () => clearInterval(interval);
}, [sessionUser, checkSpinAvailability]);
```

## Header Integration

The icons are added to the header in order:

**Location:** `components/layout/header.tsx`

**Icon Order (left to right):**
1. Upgrade Button (yellow arrow) - `<UpgradeButton />`
2. User Avatar - `<UserNav />`
3. **Leaderboard** - `<LeaderboardDropdown />` ✨ NEW
4. **Wheel Spinner** - `<WheelSpinnerDropdown />` ✨ NEW
5. Notifications - `<NotificationsDropdown />`
6. Theme Toggle - `<ThemeToggle />`

```typescript
<div className="flex items-center gap-2">
  {currentMembership && (
    <UpgradeButton currentMembership={currentMembership} />
  )}
  <UserNav />
  <LeaderboardDropdown />
  <WheelSpinnerDropdown />
  <NotificationsDropdown />
  <ThemeToggle />
</div>
```

## Indicator Styles

Both indicators use the same base styling with different colors:

### Leaderboard (Yellow)
```typescript
<span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-500" />
```

### Wheel Spinner (Amber)
```typescript
<span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
```

## Gamification Store Integration

Both components use the centralized gamification store:

**Location:** `lib/stores/gamification.ts`

### State Structure
```typescript
interface GamificationState {
  // Leaderboard
  lastKnownRank: number | null;
  hasRankChanged: boolean;
  setLastKnownRank: (rank: number) => void;
  checkRankChange: (currentRank: number) => boolean;
  clearRankChangeIndicator: () => void;

  // Wheel Spinner
  isSpinAvailable: boolean;
  lastSpinCheck: number;
  checkSpinAvailability: (userId: string, cadence: Cadence) => boolean;
  markSpinAsViewed: () => void;
}
```

## Accessibility

Both components follow accessibility best practices:

### Aria Labels
```typescript
<Button
  variant="outline"
  size="icon"
  aria-label="Open leaderboard" // or "Open daily wheel spinner"
  className="relative"
  onClick={handleClick}
>
  {/* Icon */}
</Button>
```

### Keyboard Navigation
- Tab key moves between navbar icons
- Enter/Space opens the modal
- Escape closes the modal

### Screen Readers
- Icons have descriptive aria-labels
- Indicators announce availability changes
- Modal states are communicated

## Responsive Design

### Desktop (md and up)
- Both icons always visible
- Full icon size with indicators
- Proper spacing maintained

### Mobile
- Icons collapse with other navbar items
- Mobile sidebar handles gamification access
- Touch-friendly tap targets

## Performance

### Optimization Strategies
1. **Debounced Checks:** Availability checks run at intervals, not on every render
2. **Memoization:** Component state is memoized to prevent unnecessary re-renders
3. **Lazy Loading:** Modals load only when opened
4. **Cache:** Indicator states cached with 1-minute TTL

### Check Intervals
- **Leaderboard:** Checked on mount and when leaderboard updates
- **Wheel Spinner:** Checked every 60 seconds (60000ms)

## Styling

### Button Variants
Both use the same base button style:
```typescript
<Button variant="outline" size="icon" className="relative">
```

### Icon Sizes
```typescript
// Trophy icon
<Trophy className="h-[1.1rem] w-[1.1rem]" />

// CircleDashed icon
<CircleDashed className="h-[1.1rem] w-[1.1rem]" />
```

### Indicator Position
```typescript
className="absolute -right-0.5 -top-0.5 ..."
```
Positioned in top-right corner of icon button.

## Testing

### Unit Tests
Test indicator logic:
```typescript
// Leaderboard
expect(hasRankChanged).toBe(true) // When rank changes
expect(hasRankChanged).toBe(false) // After clearing

// Wheel Spinner
expect(isAvailable).toBe(true) // When 24h passed
expect(isAvailable).toBe(false) // When recently spun
```

### Integration Tests
1. Verify indicators show/hide correctly
2. Test modal opening on click
3. Verify indicator clears after opening
4. Test periodic availability checks

### E2E Tests
1. Navigate to dashboard
2. Verify gamification icons present
3. Click leaderboard icon → modal opens
4. Click wheel icon → modal opens
5. Verify indicators update appropriately

## Troubleshooting

### Indicator Not Showing
1. Check gamification store state
2. Verify localStorage permissions
3. Check interval is running
4. Verify user session exists

### Icons Not Rendering
1. Check lucide-react installation
2. Verify imports are correct
3. Check header component rendering
4. Verify dashboard layout includes header

### Modal Not Opening
1. Check modal store state
2. Verify modal is rendered in layout
3. Check for JavaScript errors
4. Verify event handlers are bound

## Future Enhancements

1. **Notification Count:** Show number of rank changes
2. **Streak Counter:** Display consecutive days spun
3. **Preview Tooltip:** Hover to see quick stats
4. **Custom Icons:** Theme-based icon variations
5. **Sound Effects:** Audio feedback on indicator appearance
6. **Haptic Feedback:** Mobile vibration for indicators

