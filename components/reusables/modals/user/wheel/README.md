# Daily Wheel Spinner

A gamification feature that allows users to spin a prize wheel once per day to win various rewards including credits, feature trials, and special perks.

## Components

### WheelSpinnerModal.tsx
Main modal component that displays the prize wheel interface.

**Location:** `components/reusables/modals/user/wheel/WheelSpinnerModal.tsx`

**Features:**
- Daily spin cadence (locked for 24 hours after each spin)
- 10 unique prize types with weighted probabilities
- Custom toast notifications based on prize type
- Integrated with gamification store for indicator management

**Prize Types:**

#### AI Credits
- 🤖 **50 AI Credits** (weight: 3) - Common
- 🦾 **100 AI Credits** (weight: 2) - Uncommon

#### SkipTrace Credits
- 🔍 **25 SkipTrace Credits** (weight: 3) - Common
- 🔎 **50 SkipTrace Credits** (weight: 1) - Rare

#### Lead Credits
- 🎯 **100 Lead Credits** (weight: 3) - Common
- 🏹 **250 Lead Credits** (weight: 2) - Uncommon

#### Feature Trials
- ⭐ **7-Day AI Agent Trial** (weight: 1) - Rare
- 🎙️ **7-Day Voice Clone Trial** (weight: 1) - Rare

#### Credit Boosts
- ⚡ **+30% All Credits (7 Days)** (weight: 1) - Rare
  - Gives 30% bonus on all credits earned for 7 days
  - Prevents tier upgrade abuse (no full enterprise access)

#### Special Perks
- 🎁 **2x Credits Next Spin** (weight: 1) - Rare

### PrizeLegend.tsx
Displays all available prizes in a compact legend format.

**Location:** `components/reusables/modals/user/wheel/PrizeLegend.tsx`

**Features:**
- Shows each prize with its unique emoji icon
- Displays exact prize amounts/descriptions
- Compact 2-column grid layout
- Shows total count of unique prizes

## Navbar Integration

### WheelSpinnerDropdown.tsx
Navbar button that opens the wheel spinner modal.

**Location:** `components/navbar/WheelSpinnerDropdown.tsx`

**Features:**
- CircleDashed icon from lucide-react
- Amber pulsing indicator when daily spin is available
- Auto-checks availability every minute
- Clears indicator when modal is opened

**Indicator Logic:**
```typescript
// Shows amber dot when:
// - User hasn't spun today, OR
// - 24 hours have passed since last spin
```

## State Management

### Modal State
Managed in `lib/stores/dashboard.ts`:
```typescript
isWheelSpinnerModalOpen: boolean;
openWheelSpinnerModal: () => void;
closeWheelSpinnerModal: () => void;
```

### Gamification State
Managed in `lib/stores/gamification.ts`:
```typescript
isSpinAvailable: boolean;
checkSpinAvailability: (userId, cadence) => boolean;
markSpinAsViewed: () => void;
```

## Icon System

The wheel uses emoji icons rendered as SVG text elements for optimal display:

**Modified File:** `external/wheel-spinner/components/internal/PrizeWheelCore.tsx`

**Key Change:**
```typescript
// Returns null for prizes with emoji icons
// Allows SimpleWheel to render emoji as SVG text instead of React nodes
if (p.icon) {
  return null; // Use prize.icon string for SVG rendering
}
```

This ensures emojis display correctly on wheel segments instead of generic "$" icons.

## Integration with Credit System

### TODO: API Integration
The `handleWin` function needs to be connected to the actual credit system:

```typescript
// Based on prizeId, call appropriate API:
// - ai-* → addCredits('aiCredits', amount)
// - skiptrace-* → addCredits('skipTraces', amount)  
// - leads-* → addCredits('leads', amount)
// - trial-* → activateFeatureTrial(featureName, duration)
// - boost-* → activateCreditBoost(percentage, duration)
// - perk-* → setNextSpinBonus(multiplier)
```

## Usage

### Opening the Modal
```typescript
import { useModalStore } from "@/lib/stores/dashboard";

const { openWheelSpinnerModal } = useModalStore();
openWheelSpinnerModal();
```

### Checking Spin Availability
```typescript
import { useGamificationStore } from "@/lib/stores/gamification";

const { checkSpinAvailability } = useGamificationStore();
const isAvailable = checkSpinAvailability(userId, "daily");
```

## Customization

### Adding New Prizes
Edit the `prizes` array in `WheelSpinnerModal.tsx`:

```typescript
{
  id: "unique-prize-id",
  label: "Prize Display Name",
  icon: "🎯", // Emoji icon
  color: "#HEX_COLOR", // Segment color
  weight: 3, // Probability weight (higher = more common)
}
```

### Changing Spin Cadence
Update the `cadence` prop in the `PrizeWheel` component:
- `"hourly"` - Can spin every hour
- `"daily"` - Can spin every 24 hours (default)
- `"weekly"` - Can spin every 7 days
- `"monthly"` - Can spin every 30 days

### Adjusting Wheel Theme
Modify the `theme` prop:

```typescript
theme={{
  size: 280,           // Wheel diameter in pixels
  spinUpMs: 300,       // Acceleration duration
  spinDownMs: 2000,    // Deceleration duration
}}
```

## Anti-Abuse Measures

1. **Cadence Locking:** Users can only spin once per 24-hour period
2. **Credit Boost Instead of Tier Upgrade:** Prevents users from getting Enterprise tier and using unlimited credits
3. **localStorage Persistence:** Tracks last spin time to prevent multiple spins
4. **Server-Side Validation Required:** Client-side locks should be validated server-side

## Testing

The modal can be tested by:
1. Clicking the wheel icon in the top navbar
2. Verifying the countdown timer when locked
3. Checking that the amber indicator appears when spin is available
4. Testing prize wins and toast notifications

## Accessibility

- Modal is keyboard navigable
- Close button has aria-label
- Spin button has proper aria-label
- Toast notifications are screen-reader friendly

