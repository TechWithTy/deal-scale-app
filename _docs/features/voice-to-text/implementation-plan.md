# Voice-to-Text Implementation Plan

## Overview
Add a stateful voice input button to all AI generators (workflow, campaign, search) that allows users to speak their prompts instead of typing.

## Context from Existing Codebase

### Existing Voice Recording Implementations
We already have voice recording infrastructure in:
- `components/forms/steppers/profile-form/steps/knowledge/voice/VoiceRecorderCore.tsx`
- `components/forms/steppers/utils/voice/dynamicVoiceRecord.tsx`
- `components/reusables/audio/recorderVisualizer.tsx`

### Key Technologies in Use
- **Web Audio API**: `navigator.mediaDevices.getUserMedia()`
- **MediaRecorder API**: For capturing audio
- **Lottie Animations**: For visual feedback during recording
- **React Hooks**: For state management

## Architecture

### Components Structure
```
components/reusables/ai/
├── VoiceInputButton.tsx (New)
│   ├── Stateful button component
│   ├── Recording states: idle, listening, processing, error, success
│   ├── Visual feedback with animations
│   └── Mock speech-to-text for now
│
├── AIPromptGenerator.tsx (Updated)
│   └── Integrate VoiceInputButton next to textarea
```

### State Machine

```
[idle] → (click) → [requesting_permission]
         ↓
[listening] ← (permission granted)
         ↓
         ├── (speak) → [processing] → [success] → [idle]
         ├── (stop) → [processing] → [success] → [idle]
         └── (error) → [error] → [idle]
```

## Implementation Phases

### Phase 1: Mock Implementation (Current)
- ✅ Create VoiceInputButton with full UI/UX
- ✅ Implement all visual states
- ✅ Mock speech recognition (simulate delay + random text)
- ✅ Integrate with AIPromptGenerator
- ✅ Add keyboard shortcuts (Ctrl/Cmd + Shift + V)
- ✅ Mobile-optimized touch targets

### Phase 2: Real Implementation (Future)
#### Option A: Web Speech API (Browser Native)
```typescript
const recognition = new window.SpeechRecognition() || new window.webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = true;
```
**Pros:**
- Free, built into browsers
- Real-time transcription
- No server required

**Cons:**
- Limited browser support (Chrome, Edge, Safari)
- Privacy concerns (Google servers)
- Less accurate than paid services

#### Option B: OpenAI Whisper API
```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'speech.webm');
formData.append('model', 'whisper-1');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
  body: formData
});
```
**Pros:**
- Highly accurate
- Multi-language support
- Works in all browsers

**Cons:**
- Costs money per minute
- Requires server roundtrip
- Slight delay for processing

#### Option C: AssemblyAI (Recommended)
```typescript
const response = await fetch('https://api.assemblyai.com/v2/transcript', {
  method: 'POST',
  headers: {
    'authorization': ASSEMBLYAI_API_KEY,
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    audio_url: audioUrl,
    language_detection: true,
    punctuate: true,
    format_text: true
  })
});
```
**Pros:**
- Best accuracy
- Real-time streaming option
- Auto-punctuation & formatting
- Speaker diarization

**Cons:**
- Most expensive option
- Requires API integration

#### Recommendation: Hybrid Approach
1. **Default**: Use Web Speech API for real-time, free transcription
2. **Fallback**: If not supported, record audio and use OpenAI Whisper
3. **Pro Feature**: AssemblyAI for pro/enterprise users

## UI/UX Design

### Button States
| State | Icon | Color | Animation | Tooltip |
|-------|------|-------|-----------|---------|
| **idle** | 🎤 Mic | muted | none | "Voice input (Ctrl+Shift+V)" |
| **listening** | 🔴 Mic | red | pulse | "Listening... (click to stop)" |
| **processing** | ⏳ Loader | blue | spin | "Processing speech..." |
| **success** | ✅ Check | green | scale | "Transcribed successfully!" |
| **error** | ❌ X | red | shake | "Error: {message}" |

### Position
- **Desktop**: Right side of textarea (inline with header)
- **Mobile**: Below textarea (full-width helper button)

### Accessibility
- ✅ ARIA labels for screen readers
- ✅ Keyboard shortcuts
- ✅ High contrast mode support
- ✅ Focus indicators
- ✅ Error messages for screen readers

## Integration Points

### 1. AIPromptGenerator Props
```typescript
export interface AIPromptGeneratorProps {
  // ... existing props
  
  // Voice input
  showVoiceInput?: boolean;
  voiceInputLanguage?: string; // Default: "en-US"
  onVoiceTranscription?: (text: string, append: boolean) => void;
  voiceInputMode?: "replace" | "append"; // Default: "append"
}
```

### 2. Usage in Generators
```typescript
<AIPromptGenerator
  showVoiceInput={true}
  voiceInputLanguage="en-US"
  voiceInputMode="append"
  onVoiceTranscription={(text) => {
    // Custom handling if needed
    console.log('Transcribed:', text);
  }}
  // ... other props
/>
```

## Mock Implementation Details

### Simulated Speech Recognition
```typescript
// Mock responses based on recording duration
const mockTranscriptions = [
  "Create a campaign targeting tech executives in San Francisco",
  "Generate a workflow that enriches leads and sends personalized emails",
  "Find companies in the software industry with 50-100 employees",
  "Set up an automation to follow up with leads after 3 days",
];

// Simulate processing delay (500-1500ms)
// Return random transcription or append mode-aware text
```

### Error Simulation
```typescript
// 10% chance of mock errors for testing
const mockErrors = [
  "Microphone not available",
  "No speech detected",
  "Audio too quiet",
  "Timeout after 30 seconds",
];
```

## Testing Checklist

### Functional Tests
- [ ] Button click triggers recording
- [ ] Microphone permission request
- [ ] Visual feedback during states
- [ ] Text appends to existing prompt
- [ ] Keyboard shortcut works
- [ ] Cancel/stop recording works
- [ ] Error handling graceful

### UI/UX Tests
- [ ] Button visible on desktop
- [ ] Button visible on mobile
- [ ] Animations smooth
- [ ] Tooltips accurate
- [ ] High contrast mode works
- [ ] Touch targets ≥ 44px (mobile)

### Browser Tests
- [ ] Chrome (native speech)
- [ ] Firefox (fallback)
- [ ] Safari (webkit speech)
- [ ] Edge (native speech)
- [ ] Mobile browsers

## Future Enhancements

1. **Language Selection**: Dropdown for multi-language support
2. **Continuous Mode**: Keep listening until manually stopped
3. **Voice Commands**: "Insert variable leadName", "Add tool Apollo"
4. **Custom Vocabulary**: Train on sales/tech terms
5. **Speaker Profiles**: Save voice settings per user
6. **Offline Mode**: Local speech recognition (TensorFlow.js)

## Performance Considerations

### Optimization
- ✅ Lazy load speech recognition library
- ✅ Debounce interim results
- ✅ Compress audio before upload (if using API)
- ✅ Cache permission status
- ✅ Preload animations

### Monitoring
- Track usage metrics (start/success/error rates)
- Monitor API costs (if using paid service)
- Log browser compatibility issues
- A/B test different UI positions

## Security & Privacy

### Considerations
- ✅ Never store raw audio without consent
- ✅ Use HTTPS for all API calls
- ✅ Clear transcription cache after use
- ✅ Allow users to disable feature
- ✅ GDPR compliance for EU users
- ✅ Transparent about which service is used

### Settings
```typescript
// Future user settings
interface VoiceInputSettings {
  enabled: boolean;
  service: 'browser' | 'openai' | 'assemblyai';
  language: string;
  autoStopAfterSilence: number; // seconds
  confidenceThreshold: number; // 0-1
}
```

## Migration Path

### Current Implementation
```typescript
// 1. Add feature flag
const VOICE_INPUT_ENABLED = process.env.NEXT_PUBLIC_VOICE_INPUT_ENABLED === 'true';

// 2. Gradual rollout
- Week 1: Internal testing (mock)
- Week 2: Beta users (mock)
- Week 3: 10% users (real)
- Week 4: 50% users (real)
- Week 5: 100% users (real)
```

## Cost Analysis (Future)

### OpenAI Whisper
- $0.006 per minute
- Average prompt: 30 seconds = $0.003
- 1000 voice prompts/day = $3/day = $90/month

### AssemblyAI
- $0.37 per hour real-time
- $0.25 per hour batch
- Average: $0.125 per hour = $0.00208 per minute
- 1000 voice prompts/day × 0.5 min = $1.04/day = $31/month

### Recommendation
- **Freemium**: Web Speech API (free)
- **Pro**: OpenAI Whisper (better accuracy)
- **Enterprise**: AssemblyAI (best features)

## References

- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text
- AssemblyAI: https://www.assemblyai.com/docs
- VAPI: Internal docs at `_docs/features/vapi/vapi-web.md`
















