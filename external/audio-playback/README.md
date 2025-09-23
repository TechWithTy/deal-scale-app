# Audio Playback

Accessible audio playback UI components for React/Next.js with timeline seeking, drag & keyboard controls, and token-based theming.

- Intrinsic duration timeline (no absolute timestamps required)
- Click/drag/keyboard seek with a11y roles and labels
- Theme-aligned using Tailwind tokens from `_docs/features/ui/theming.md`

Website: https://www.cybershoptech.com

## Exports

```ts
import { PlaybackCell, PlayButtonSkip } from "@/external/audio-playback";
```

## Usage

```tsx
import { PlaybackCell } from "@/external/audio-playback";
import type { CallInfo } from "@/types/_dashboard/campaign";

const calls: CallInfo[] = [
  {
    callResponse: {
      id: "Call A",
      recordingUrl: "/calls/example-call-yt.mp3",
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
    } as any,
    contactId: "contact-1",
    campaignId: "campaign-1",
  },
];

export default function Example() {
  return <PlaybackCell callInformation={calls} />;
}
```

## Theming

- Track uses `bg-muted/40` (remaining) and `bg-primary` (progress) with `border-border` and `ring-ring`.
- Time badges use `bg-card/70` and `text-muted-foreground`.

## License

MIT
