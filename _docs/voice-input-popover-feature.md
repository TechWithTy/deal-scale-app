# Voice Input Popover Feature

## Overview

The Voice Input Popover enhances the AI Prompt Generator with two powerful voice input modes:

1. **Speech-to-Text (STT)**: Direct transcription of spoken words
2. **AI Enhance**: Intelligent prompt optimization with automatic variable insertion and POML structuring

## Visual Design

### Microphone Icon Styling

The microphone icon stands out with:
- **Gradient background**: Blue-to-purple gradient (`from-primary/20 via-purple-500/20 to-blue-500/20`)
- **Subtle pulse animation**: Gentle 3-second pulse effect (`animate-pulse-subtle`)
- **Border and shadow**: Primary-colored border with soft shadow for depth
- **Hover effects**: Slightly intensified gradient on hover with scale animation

### Popover Layout

```
┌─────────────────────────────────────┐
│  Voice Input Options                │
│  Choose how to process your voice   │
├─────────────────────────────────────┤
│  🎤  Speech-to-Text            ⓘ    │
│      Direct transcription           │
├─────────────────────────────────────┤
│  ✨  AI Enhance                 ⓘ    │
│      Create optimized prompts       │
└─────────────────────────────────────┘
```

Each option includes:
- **Icon**: Visual indicator (Mic for STT, Sparkles for AI Enhance)
- **Title**: Clear option name
- **Info icon (ⓘ)**: Tooltip with detailed explanation
- **Description**: Brief summary of functionality

## Feature Details

### Speech-to-Text Mode

**Purpose**: Direct voice-to-text transcription without AI processing

**Use Cases**:
- Dictating pre-planned prompts
- Quick note-taking
- When you know exact wording needed

**Flow**:
1. User clicks microphone → popover opens
2. User selects "Speech-to-Text"
3. Microphone activates (red pulsing indicator)
4. User speaks
5. Click or press Space to stop
6. Transcription appears in prompt field

### AI Enhance Mode

**Purpose**: Intelligent prompt optimization with context-aware enhancements

**Use Cases**:
- Natural language → structured POML
- Automatic variable insertion (e.g., "first name" → `{{firstName}}`)
- Adding proper prompt structure and formatting

**Flow**:
1. User clicks microphone → popover opens
2. User selects "AI Enhance"
3. Microphone activates
4. User speaks naturally: *"Send an email to first name at company about our new product"*
5. AI processes and enhances to:
   ```xml
   <task>
     Send an email to {{firstName}} at {{company}} about our new product
   </task>
   ```
6. Enhanced prompt appears in field

**Smart Keyword Mapping**:
```typescript
// Automatically recognizes and replaces:
"first name" → {{firstName}}
"last name" → {{lastName}}
"email address" → {{email}}
"phone number" → {{phone}}
"company" → {{company}}
"job title" → {{title}}
// ... and many more
```

## Edge Cases Handled

### 1. Microphone Permission Denied
**Scenario**: User denies microphone access

**Handling**:
- Shows error toast: "Microphone Access Denied"
- Returns to idle state after 3 seconds
- Prevents recording loop

**Code**:
```typescript
try {
  await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (err) {
  setError("Microphone permission denied");
  toast.error("Microphone Access Denied", {
    description: "Please allow microphone access to use voice input",
  });
}
```

### 2. No Speech Detected
**Scenario**: Recording contains no audible speech

**Handling**:
- Shows error: "No speech detected"
- Suggests trying again
- Does not insert empty text

### 3. Empty Transcription
**Scenario**: Transcription service returns empty string

**Handling**:
```typescript
if (!baseTranscription.trim()) {
  setError("No speech detected");
  toast.error("No Speech Detected", {
    description: "Please try again and speak clearly",
  });
  return;
}
```

### 4. AI Enhancement Failure
**Scenario**: AI enhancement service is unavailable or errors

**Handling**:
- Falls back to basic transcription
- Shows warning toast: "AI Enhancement Unavailable"
- User still gets their voice input (degraded gracefully)

**Code**:
```typescript
try {
  finalText = await enhancePromptWithAI(transcription, availableChips);
} catch (enhanceError) {
  console.error("AI enhancement failed:", enhanceError);
  toast.warning("AI Enhancement Unavailable", {
    description: "Using basic transcription instead",
  });
  finalText = baseTranscription; // Fallback
}
```

### 5. No Variables Available
**Scenario**: No chips/variables defined for AI enhancement

**Handling**:
- Shows warning in popover
- AI Enhance still works but won't insert variables
- Returns enhanced structure only

**UI Warning**:
```
⚠️ No variables available for AI enhancement. 
   Speech-to-Text will work normally.
```

### 6. Network Errors
**Scenario**: Connection issues during processing

**Handling**:
- 10% simulated error rate for testing
- Shows "Network error - please try again"
- Returns to idle state
- User can retry immediately

### 7. Maximum Recording Duration
**Scenario**: User exceeds 60-second limit

**Handling**:
- Auto-stops recording at `maxDuration`
- Processes available audio
- Shows progress ring (0-100%)

**Visual Indicator**:
```typescript
strokeDasharray={`${(duration / maxDuration) * 100} 100`}
```

### 8. Disabled State
**Scenario**: Component disabled (generating, form locked, etc.)

**Handling**:
- Microphone button becomes non-interactive
- Grayed-out appearance
- Tooltip shows "Disabled" state

**Props**:
```typescript
disabled={disabled || isGenerating}
```

### 9. Mobile Responsiveness
**Scenario**: Small screens, touch interactions

**Handling**:
- Popover adjusts to `side="top"` and `align="end"`
- Touch-friendly button sizes (h-9 w-9 icons)
- Readable text sizes (text-xs, text-sm)

### 10. Accessibility (Reduced Motion)
**Scenario**: User has `prefers-reduced-motion` enabled

**Handling**:
- Disables `animate-pulse-subtle`
- No scale transforms
- Maintains full functionality

**CSS**:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-subtle {
    animation: none !important;
  }
}
```

### 11. Append vs Replace Mode
**Scenario**: User has existing prompt text

**Handling**:
- **Replace mode**: Overwrites entire prompt
- **Append mode**: Adds space separator, then new text

**Code**:
```typescript
if (voiceInputMode === "replace") {
  onPromptChange(text);
} else {
  const separator = promptValue.trim() ? " " : "";
  onPromptChange(`${promptValue}${separator}${text}`);
}
```

### 12. Multiple Rapid Clicks
**Scenario**: User clicks microphone multiple times quickly

**Handling**:
- State machine prevents double-activation
- `voiceState` guards transitions
- Only processes when `idle` or `listening`

## Technical Implementation

### Component Architecture

```
VoiceInputPopover
├── Popover (shadcn/ui)
│   ├── PopoverTrigger (Microphone Button)
│   └── PopoverContent
│       ├── Speech-to-Text Option
│       └── AI Enhance Option
├── State Management
│   ├── voiceState: idle | listening | processing | error
│   ├── activeMode: stt | ai-enhance | null
│   └── duration: number
└── Processing Logic
    ├── startRecording()
    ├── stopRecording()
    └── enhancePromptWithAI()
```

### Props Interface

```typescript
export interface VoiceInputPopoverProps {
  promptValue: string;              // Current prompt for context
  onTranscription: (text: string, isEnhanced?: boolean) => void;
  mode?: "replace" | "append";      // How to insert text
  language?: string;                // Speech recognition language
  maxDuration?: number;             // Max recording seconds
  disabled?: boolean;               // Disable interaction
  availableChips?: ChipDefinition[]; // Chips for AI enhancement
  className?: string;               // Additional styles
}
```

### AI Enhancement Algorithm

```typescript
async function enhancePromptWithAI(
  transcription: string,
  availableChips: ChipDefinition[]
): Promise<string>
```

**Steps**:
1. Validate transcription (not empty)
2. Check available chips
3. Build keyword → chip mapping
4. Replace keywords with `{{chipKey}}` syntax
5. Detect prompt structure keywords:
   - `create`, `generate`, `build` → Wrap in `<task>` tags
   - `where`, `with`, `having` → Wrap in `<context>` tags
6. Return enhanced prompt

**Example Transformation**:
```
Input:  "Send email to first name at company"
Output: "<task>
           Send email to {{firstName}} at {{company}}
         </task>"
```

## Usage Examples

### Basic Integration

```typescript
import { VoiceInputPopover } from "@/components/reusables/ai";

<VoiceInputPopover
  promptValue={promptValue}
  onTranscription={(text, isEnhanced) => {
    setPromptValue(text);
    if (isEnhanced) {
      console.log("AI enhanced the prompt!");
    }
  }}
  mode="append"
  availableChips={allChipsWithType}
/>
```

### With All Options

```typescript
<VoiceInputPopover
  promptValue={promptValue}
  onTranscription={(text, isEnhanced) => {
    if (mode === "replace") {
      setPromptValue(text);
    } else {
      setPromptValue(prev => `${prev} ${text}`);
    }
    
    if (isEnhanced) {
      toast.success("AI optimized your prompt!");
    }
  }}
  mode="append"
  language="en-US"
  maxDuration={120}
  disabled={isGenerating}
  availableChips={[
    { key: "firstName", label: "First Name", type: "variable" },
    { key: "lastName", label: "Last Name", type: "variable" },
    { key: "email", label: "Email", type: "variable" },
    // ... more chips
  ]}
  className="custom-class"
/>
```

## Testing Strategy

### Manual Testing Checklist

- [ ] Microphone icon has gradient and pulse animation
- [ ] Popover opens on click
- [ ] Both options are clickable
- [ ] Info icons show tooltips on hover
- [ ] STT mode transcribes correctly
- [ ] AI Enhance mode inserts variables
- [ ] Recording indicator shows duration
- [ ] Space key stops recording
- [ ] Error states display properly
- [ ] Disabled state works
- [ ] Mobile responsive
- [ ] Accessibility: reduced motion respected

### Automated Testing (Future)

```typescript
describe("VoiceInputPopover", () => {
  test("shows popover on microphone click");
  test("starts STT recording");
  test("starts AI enhance recording");
  test("handles permission denial");
  test("falls back on AI enhancement failure");
  test("respects disabled state");
  test("appends vs replaces based on mode");
});
```

## Keyboard Shortcuts

- **Space**: Stop recording (when listening)
- **Escape**: Close popover (when open)

## Accessibility Features

1. **ARIA labels**: All buttons have proper labels
2. **Keyboard navigation**: Full keyboard support
3. **Screen readers**: Announces state changes
4. **Reduced motion**: Respects user preferences
5. **Focus management**: Proper focus trap in popover
6. **Tooltips**: Additional context for screen readers

## Performance Considerations

- **Lazy loading**: Microphone only activates when needed
- **Debouncing**: Prevents rapid state changes
- **Cleanup**: Timers and intervals properly cleared
- **Memory**: Audio chunks released after processing

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.3+)
- **Opera**: Full support

**Note**: Requires `navigator.mediaDevices.getUserMedia()` API

## Future Enhancements

1. **Real Speech Recognition**: Replace mock with actual Web Speech API
2. **Custom Wake Words**: "Hey Assistant, ..."
3. **Multi-language Support**: Auto-detect spoken language
4. **Voice Commands**: "Insert first name variable"
5. **Batch Processing**: Multiple recordings in sequence
6. **Audio Preview**: Listen before inserting
7. **Custom Enhancement Rules**: User-defined keyword mappings

## Related Components

- `VoiceInputButton`: Simple voice input without popover
- `AIPromptGenerator`: Main generator using this component
- `ChipTextarea`: Displays inserted chips
- `InlineChipEditor`: Defines chip types

## Support

For issues or questions, see:
- [AI Components Documentation](./_docs/COMPLETE_AI_SYSTEM_SUMMARY.md)
- [POML Guide](./_docs/POML_IMPLEMENTATION_GUIDE.md)
- [Voice Recorder Core](../components/forms/steppers/profile-form/steps/knowledge/voice/VoiceRecorderCore.tsx)

