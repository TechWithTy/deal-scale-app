# AI Avatar Dropdown

Accessible AI Avatar voice and recipient dropdown components for React/Next.js.

- Themeable via Tailwind design tokens (see `_docs/features/ui/theming.md`)
- Keyboard and screen-reader friendly
- TypeScript-first

Website: https://www.cybershoptech.com

## Exports

```ts
import { AgentVoiceDropdown, AllRecipientDropdown } from "@/external/ai-avatar-dropdown";
```

## Usage

```tsx
import { AgentVoiceDropdown, AllRecipientDropdown } from "@/external/ai-avatar-dropdown";

export default function Example() {
  return (
    <div className="space-y-4">
      <AgentVoiceDropdown onChange={(voiceId) => console.log(voiceId)} />
      <AllRecipientDropdown onChange={(id) => console.log(id)} />
    </div>
  );
}
```

## Development

- Follows Biome linting/formatting rules.
- Uses Radix UI primitives and Tailwind tokens (`bg-card`, `border-border`, etc.).

## License

MIT
