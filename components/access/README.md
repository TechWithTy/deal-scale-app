# FeatureGuard

A reusable wrapper that enforces subscription-based access rules driven entirely by `constants/features/featureAccess.json`.

## Usage

```tsx
import { FeatureGuard } from "@/components/access/FeatureGuard";

enum FeatureKeys {
  DirectMailModal = "campaigns.directMailModal",
}

<FeatureGuard featureKey={FeatureKeys.DirectMailModal}>
  <button>Send Direct Mail</button>
</FeatureGuard>
```

The guard reads the latest config at runtime:

```json
{
  "campaigns": {
    "directMailModal": {
      "requiredTier": "Enterprise",
      "mode": "overlay"
    }
  }
}
```

- Update the JSON to change tier requirements, guard modes, required permissions, or quota requirements—no code changes needed.
- Optional props let you override the mode (`modeOverride`), customise overlay content, or supply a fallback element when hidden/disabled.
- Pass `permissionOverride` / `quotaOverride` when you need to enforce rules that differ from the shared config.
- The hook backing this component lives at `hooks/useFeatureAccessGuard.ts` and can be consumed directly when you need bespoke behaviour.
