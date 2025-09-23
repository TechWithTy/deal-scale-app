# PrizeWheel Component

Reusable daily/weekly/monthly prize spinner with a custom SVG wheel, modal popup, cadence locking, and local persistence.

- Entry: `external/wheel-spinner/PrizeWheel.tsx`
- Core: `external/wheel-spinner/components/internal/PrizeWheelCore.tsx`
- Types: `external/wheel-spinner/types.ts`

## Install

No extra install required; this package is in-repo and uses plain React + SVG.

## Props

- `cadence`: "daily" | "weekly" | "monthly"
- `prizes`: Array<{ id: string; label: string; weight?: number; color?: string; icon?: string }>
- `onWin`: (payload: { prizeId: string; label: string; at: string }) => void
- `userId`: string
- `storageKeyBase?`: string (default: "prize-wheel")
- `disabled?`: boolean
- `showCountdown?`: boolean (default: true)
- `autoSpin?`: boolean — auto triggers a spin on mount when eligible
- `showResultModal?`: boolean — show a simple text result modal after spin
- `showWheelPopup?`: boolean — show the graphical wheel inside a modal popup
- `persistence?`: Partial<{
    getLastSpinAt(userId: string, cadence: Cadence): Promise<string | null>;
    setSpinResult(userId: string, cadence: Cadence, result: SpinResult): Promise<void>;
  }>
- `theme?`: { accentColor?: string; textColor?: string; size?: number; spinUpMs?: number; spinDownMs?: number; textVisibleWithIcons?: boolean }
- `ariaLabel?`: string
- `allowAdminOverride?`: boolean — adds a Reset button to clear lock

## Behavior

- Locks after a win until next eligible window by `cadence` (daily/weekly/monthly).
- Displays countdown until eligible if `showCountdown`.
- Persists last spin with localStorage by default, or via provided `persistence` hooks.
- In popup mode (`showWheelPopup`), the modal stays open after spin with a Close button.
- The wheel supports per-slice `color` and `icon` (emoji or short text) and label rendering.
- Spin animation time is adjustable via `theme.spinUpMs` and `theme.spinDownMs`.

## Example

```tsx
import PrizeWheel from "@/external/wheel-spinner/PrizeWheel";
import type { Prize } from "@/external/wheel-spinner/types";

const prizes: Prize[] = [
  { id: "credits5", label: "5 Credits", weight: 5, color: "#22c55e", icon: "⭐" },
  { id: "credits1", label: "1 Credit", weight: 1, color: "#f97316", icon: "💎" },
];

export default function DemoWheel() {
  return (
    <div className="p-4">
      <PrizeWheel
        cadence="daily"
        prizes={prizes}
        userId="user-123"
        onWin={(r) => console.log("Won:", r)}
        theme={{ accentColor: "#0ea5e9", textColor: "#fff", size: 240, spinUpMs: 250, spinDownMs: 1400 }}
        showWheelPopup
        allowAdminOverride
      />
    </div>
  );
}
```

## Notes

- Ensure all buttons specify `type="button"` per a11y/biome.
- Prefer `import type { X }` for type-only imports (Biome).
- No template literals unless interpolating.
- When icons are provided, text labels can render too (default). Control with `theme.textVisibleWithIcons`.
- Lower-level: `SimpleWheel` exposes `textVisible` and also supports `segmentIconNodes` for custom React/SVG icons (e.g., Lucide) per slice.
