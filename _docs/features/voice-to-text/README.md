# Voice-to-Text Feature

## Overview
The Voice-to-Text feature allows users to speak their prompts instead of typing them across all AI generators (workflow, campaign, search). This feature is currently implemented with mock functionality to demonstrate UX and will be connected to real speech recognition services in the future.

## Current Status
✅ **Phase 1: Mock Implementation** (Completed)
- Stateful voice input button component
- Full visual feedback for all states
- Mock speech transcription with simulated delays
- Integrated into AIPromptGenerator
- Keyboard shortcuts support
- Mobile-optimized

🔄 **Phase 2: Real Implementation** (Planned)
- Web Speech API integration
- OpenAI Whisper fallback
- AssemblyAI for pro users

## Quick Start

### Using in AI Generators

```typescript
<AIPromptGenerator
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="AI Workflow Generator"
  // Enable voice input (default: true)
  showVoiceInput={true}
  // Mode: "append" (adds to existing) or "replace" (replaces all)
  voiceInputMode="append"
  // Language for speech recognition
  voiceInputLanguage="en-US"
  // Optional: Custom handler for transcriptions
  onVoiceTranscription={(text) => {
    console.log('Voice transcribed:', text);
  }}
  // ... other props
/>
```

### Voice Input Button Standalone

```typescript
import { VoiceInputButton } from "@/components/reusables/ai/VoiceInputButton";

<VoiceInputButton
  onTranscription={(text) => {
    // Handle transcribed text
    console.log(text);
  }}
  mode="append"
  language="en-US"
  maxDuration={60}
  size="icon"
  variant="ghost"
/>
```

## User Experience

### Button States

| State | Visual | Description |
|-------|--------|-------------|
| **Idle** | 🎤 Mic icon | Ready to record |
| **Requesting Permission** | ⏳ Spinner | Requesting microphone access |
| **Listening** | 🔴 Square + Pulse | Recording in progress |
| **Processing** | ⏳ Spinner | Converting speech to text |
| **Success** | ✅ Check | Transcription successful |
| **Error** | ❌ Alert | Error occurred |

### Keyboard Shortcuts

- **Start/Stop Recording**: `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac)

### Mobile Optimization

- ✅ Touch targets ≥ 32px (meets accessibility standards)
- ✅ Responsive positioning
- ✅ Clear visual feedback
- ✅ Toast notifications for errors

## Mock Implementation

### How It Works

1. **User clicks microphone button** → Button requests permission (simulated 500ms delay)
2. **Permission granted** → Button shows "listening" state with pulse animation
3. **User speaks** → Duration counter shows recording time
4. **User clicks again or reaches max duration** → Recording stops
5. **Processing** → Simulated 800-1500ms delay
6. **Success** → Random transcription from mock dataset appears in textarea

### Mock Transcriptions

The mock implementation returns one of these sample transcriptions:

- "Create a campaign targeting tech executives in San Francisco with personalized outreach"
- "Generate a workflow that enriches leads from Apollo and sends automated follow-up emails"
- "Find companies in the software industry with 50 to 100 employees located in California"
- "Set up an automation to follow up with leads after 3 days if they haven't responded"
- "Build a search for SaaS companies that raised Series A funding in the last 6 months"
- "Design a multi-channel campaign for enterprise decision makers in the finance sector"

### Mock Errors

10% chance of these errors for testing error handling:

- "No speech detected"
- "Audio too quiet"
- "Network error"

5% chance of permission denied error.

## Component Props

### VoiceInputButton Props

```typescript
interface VoiceInputButtonProps {
  /** Called when transcription is complete */
  onTranscription: (text: string) => void;
  
  /** Mode: replace current text or append to it */
  mode?: "replace" | "append";
  
  /** Language for speech recognition (e.g., "en-US", "es-ES") */
  language?: string;
  
  /** Maximum recording duration in seconds (default: 60) */
  maxDuration?: number;
  
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "secondary";
  
  /** Additional CSS classes */
  className?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Show label next to icon (default: false) */
  showLabel?: boolean;
  
  /** Custom label (default: "Voice input") */
  label?: string;
}
```

### AIPromptGenerator Voice Props

```typescript
interface AIPromptGeneratorProps {
  // ... other props
  
  /** Show voice input button (default: true) */
  showVoiceInput?: boolean;
  
  /** Mode: "replace" or "append" (default: "append") */
  voiceInputMode?: "replace" | "append";
  
  /** Language code (default: "en-US") */
  voiceInputLanguage?: string;
  
  /** Optional callback for transcriptions */
  onVoiceTranscription?: (text: string) => void;
}
```

## Examples

### Append Mode (Default)

```typescript
// User has: "Create a campaign for "
// User speaks: "tech executives in San Francisco"
// Result: "Create a campaign for tech executives in San Francisco"
```

### Replace Mode

```typescript
// User has: "Old prompt text here"
// User speaks: "New prompt from voice"
// Result: "New prompt from voice"
```

### Custom Language

```typescript
<AIPromptGenerator
  voiceInputLanguage="es-ES" // Spanish
  // ... other props
/>
```

### Disable Voice Input

```typescript
<AIPromptGenerator
  showVoiceInput={false}
  // ... other props
/>
```

## Testing

### Manual Testing Checklist

- [ ] Click microphone button → starts recording
- [ ] Recording shows pulse animation
- [ ] Duration counter increases
- [ ] Click again → stops recording
- [ ] Text appears in textarea (append or replace based on mode)
- [ ] Keyboard shortcut works (Ctrl+Shift+V)
- [ ] Error handling displays toast messages
- [ ] Permission denied shows appropriate error
- [ ] Max duration auto-stops recording
- [ ] Mobile touch targets are large enough
- [ ] Works on desktop and mobile viewports

### Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Future Implementation

See `_docs/features/voice-to-text/implementation-plan.md` for detailed plans on:

- Web Speech API integration
- OpenAI Whisper fallback
- AssemblyAI for pro users
- Multi-language support
- Voice commands for chips
- Continuous listening mode

## Accessibility

- ✅ ARIA labels for screen readers
- ✅ Keyboard shortcuts
- ✅ High contrast mode support
- ✅ Clear focus indicators
- ✅ Error announcements for screen readers
- ✅ Tooltips with descriptive text

## Performance

- ✅ Component lazy-loads when needed
- ✅ No external dependencies for mock
- ✅ Animations use CSS transforms (GPU-accelerated)
- ✅ Minimal re-renders with proper state management

## Troubleshooting

### Button doesn't respond
- Check if `disabled` prop is set
- Verify component is inside AIPromptGenerator
- Check browser console for errors

### Keyboard shortcut not working
- Make sure no other app is using Ctrl+Shift+V
- Check if focus is on the modal
- Try clicking on the textarea first

### Mock transcription not appearing
- Check if `onTranscription` callback is defined
- Verify `onPromptChange` is working
- Check browser console for errors

## Related Files

- **Component**: `components/reusables/ai/VoiceInputButton.tsx`
- **Integration**: `components/reusables/ai/AIPromptGenerator.tsx`
- **Plan**: `_docs/features/voice-to-text/implementation-plan.md`
- **Existing Voice Recorder**: `components/forms/steppers/profile-form/steps/knowledge/voice/VoiceRecorderCore.tsx`

## Questions or Issues?

Contact the development team or check the implementation plan for more details.











