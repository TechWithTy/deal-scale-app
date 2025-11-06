# InviteFriendsCard Component

A reusable, feature-rich card component for inviting friends with custom referral URLs and multi-platform sharing functionality.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props](#props)
- [Examples](#examples)
- [Testing](#testing)
- [API Integration](#api-integration)

## ✨ Features

- 🔗 **Custom Referral URLs** - Generate and display unique referral links
- 📋 **One-Click Copy** - Copy link to clipboard with visual feedback
- 📧 **Email Sharing** - Pre-populated email template
- 💬 **SMS Sharing** - Direct SMS integration
- 🌐 **Social Media** - Facebook, Twitter, LinkedIn, WhatsApp support
- ✏️ **Custom Messages** - Editable invite message templates
- 📊 **Referral Stats** - Track invites, signups, and rewards
- 📱 **Responsive Design** - Mobile-friendly with compact mode
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation
- 🎨 **Customizable** - Flexible props for various use cases

## 📦 Installation

The component is already integrated into the DealScale app. Import it from:

```typescript
import { InviteFriendsCard } from "@/components/reusables/cards/InviteFriendsCard";
```

## 🚀 Basic Usage

```tsx
import { InviteFriendsCard } from "@/components/reusables/cards/InviteFriendsCard";

export default function MyPage() {
  return (
    <InviteFriendsCard
      referralUrl="https://dealscale.app/ref/YOUR_CODE"
    />
  );
}
```

## 📝 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `referralUrl` | `string` | **Required** | User's unique referral URL |
| `userName` | `string` | `"there"` | User's display name |
| `rewardType` | `string` | `"credits"` | Type of reward (credits, points, etc.) |
| `rewardAmount` | `number` | `50` | Amount of reward per referral |
| `customMessage` | `string` | Default template | Custom invite message |
| `showStats` | `boolean` | `true` | Show referral statistics |
| `compactMode` | `boolean` | `false` | Compact layout for smaller spaces |
| `stats` | `ReferralStats` | `{}` | Referral statistics object |
| `onShare` | `(platform: SharePlatform) => void` | `undefined` | Callback when user shares |
| `onMessageChange` | `(message: string) => void` | `undefined` | Callback when message is edited |
| `loading` | `boolean` | `false` | Loading state |

### Types

```typescript
type SharePlatform = "email" | "sms" | "facebook" | "twitter" | "linkedin" | "whatsapp" | "copy";

interface ReferralStats {
  totalInvitesSent: number;
  pendingSignups: number;
  successfulReferrals: number;
  rewardsEarned: number;
}
```

## 💡 Examples

### Full Configuration

```tsx
<InviteFriendsCard
  referralUrl="https://dealscale.app/ref/JOHN2024"
  userName="John Doe"
  rewardType="credits"
  rewardAmount={50}
  customMessage="Join me on DealScale!"
  showStats={true}
  stats={{
    totalInvitesSent: 15,
    pendingSignups: 3,
    successfulReferrals: 8,
    rewardsEarned: 400,
  }}
  onShare={(platform) => {
    console.log(`Shared via ${platform}`);
    // Track analytics here
  }}
  onMessageChange={(message) => {
    console.log("Message updated:", message);
    // Save to user preferences
  }}
/>
```

### Compact Mode

```tsx
<InviteFriendsCard
  referralUrl="https://dealscale.app/ref/ABC123"
  compactMode={true}
  showStats={false}
/>
```

### With Loading State

```tsx
<InviteFriendsCard
  referralUrl="Generating..."
  loading={true}
/>
```

See `InviteFriendsCard.example.tsx` for more detailed examples.

## 🧪 Testing

The component is documented using Gherkin/Cucumber syntax. See `InviteFriendsCard.feature` for test scenarios.

### Test Scenarios Covered

1. ✅ Display referral link
2. ✅ Copy link to clipboard
3. ✅ Share via email
4. ✅ Share via SMS
5. ✅ Share via social media
6. ✅ Display referral statistics
7. ✅ Customize invite message
8. ✅ Error handling
9. ✅ Responsive design
10. ✅ Share tracking
11. ✅ Component customization
12. ✅ Accessibility

## 🔌 API Integration

### Generate Referral URL

```typescript
// API Endpoint: POST /api/user/referral/generate
async function generateReferralUrl(userId: string): Promise<string> {
  const response = await fetch('/api/user/referral/generate', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  return data.referralUrl;
}
```

### Track Share Event

```typescript
// API Endpoint: POST /api/user/referral/track
async function trackShare(
  userId: string,
  platform: SharePlatform
): Promise<void> {
  await fetch('/api/user/referral/track', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      platform,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

### Fetch Referral Stats

```typescript
// API Endpoint: GET /api/user/referral/stats
async function fetchReferralStats(userId: string): Promise<ReferralStats> {
  const response = await fetch(`/api/user/referral/stats?userId=${userId}`);
  return response.json();
}
```

## 🎨 Customization

### Custom Styling

The component uses Tailwind CSS and ShadCN components. Override styles using className:

```tsx
<div className="max-w-2xl mx-auto">
  <InviteFriendsCard {...props} />
</div>
```

### Custom Icons

Icons are imported from `lucide-react`. You can extend the share buttons array:

```typescript
// In InviteFriendsCard.tsx
const shareButtons = [
  // ... existing buttons
  {
    icon: YourCustomIcon,
    label: "Custom Platform",
    color: "text-custom-600",
    bg: "hover:bg-custom-50",
    onClick: handleCustomShare,
  },
];
```

## 🐛 Error Handling

The component includes built-in error handling for:

- Clipboard API failures (fallback to manual copy)
- Network errors when sharing
- Invalid referral URL format
- Missing required props

## 📱 Responsive Behavior

- **Desktop**: 3-column share button grid
- **Tablet**: 2-column share button grid  
- **Mobile**: Stacks vertically, truncates URL with ellipsis
- **Compact Mode**: 3-column grid regardless of screen size

## ♿ Accessibility

- All interactive elements have `aria-label` attributes
- Keyboard navigation fully supported
- Focus states clearly visible
- Color contrast meets WCAG AA standards
- Screen reader friendly

## 📚 Related Documentation

- [Gherkin Test Scenarios](./InviteFriendsCard.feature)
- [Usage Examples](./InviteFriendsCard.example.tsx)
- [Type Definitions](./InviteFriendsCard.tsx)

## 🤝 Contributing

When updating this component:

1. Update the Gherkin feature file with new scenarios
2. Add examples to the example file
3. Update this README with new features
4. Ensure all linter checks pass
5. Test on multiple devices/browsers

## 📄 License

Part of the DealScale application. See main project license.

