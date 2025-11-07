# AI Chat Integration - Side-by-Side Buttons with Tier Gating

## Overview

The AI prompt generator now includes a **Chat** button alongside **Generate with AI**, with tier-based access control and context passing to a new tab.

## Button Layout

### Desktop Layout
```
┌─────────────────────────────────────────────┐
│ [Cancel]  [Generate with AI ✨] [Chat 💬]  │
└─────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│ [Generate with AI ✨]    │
│ [Chat 💬]                │
│ [Cancel]                 │
└──────────────────────────┘
```

## Chat Button Features

### 1. **Tier Gating**

Uses `FeatureGuard` wrapper for subscription-based access:

```tsx
<FeatureGuard
  featureKey="ai-chat"
  fallbackTier="starter"
  fallbackMode="overlay"
>
  <ChatButton />
</FeatureGuard>
```

**Tiers:**
- ❌ **Free** - Shows upgrade overlay
- ✅ **Starter+** - Full access
- ✅ **Pro** - Full access
- ✅ **Enterprise** - Full access

### 2. **Upsell Overlay**

When user doesn't have access:

```
┌─────────────────────┐
│  🔒                 │
│  AI Chat Assistant  │
│  Upgrade to Starter │
│  Current: Free      │
└─────────────────────┘
```

**Click behavior:**
- Opens pricing page: `https://dealscale.io/pricing`
- Shows current tier vs required tier
- Clear call-to-action

### 3. **Context Passing**

When chat opens, URL includes:

```
https://chat.dealscale.io?
  userId={user.id}&
  agentId={assignedAssistantID}&
  mode=chat-only&
  context={promptValue}&
  title={titleValue}&
  aiAssist=true&
  contextAware=true
```

**Parameters:**
- `userId` - Current user ID
- `agentId` - Assigned AI assistant ID (female, male, ai)
- `mode` - Set to "chat-only" for focused chat experience
- `context` - The current prompt value (passes AI context)
- `title` - The title/name of what they're working on
- `aiAssist` - Enable AI assistance mode
- `contextAware` - Enable context-aware responses

### 4. **Dynamic App Context**

The chat application receives:
- User identity
- AI agent preference
- Current work context
- Prompt content
- Title/name

This allows the chat to:
- Continue the conversation
- Understand what user is building
- Provide contextual suggestions
- Maintain continuity across tabs

## Implementation

### In AIPromptGenerator

```tsx
<div className="flex flex-1 gap-2">
  {/* Generate Button - Left */}
  <Button onClick={handleGenerate}>
    Generate with AI
  </Button>
  
  {/* Chat Button - Right */}
  <AIChatButton
    promptValue={promptValue}
    titleValue={titleValue}
    disabled={isGenerating}
  />
</div>
```

### AIChatButton Component

```tsx
export function AIChatButton({
  promptValue,
  titleValue,
  disabled,
}: AIChatButtonProps) {
  const userId = useUserStore(state => state.userProfile?.id);
  const agentId = useUserStore(
    state => state.userProfile?.aIKnowledgebase?.assignedAssistantID
  );
  
  const handleChatClick = () => {
    const params = new URLSearchParams({
      userId,
      agentId,
      mode: 'chat-only',
      context: promptValue,
      title: titleValue,
      aiAssist: 'true',
      contextAware: 'true',
    });
    
    window.open(`https://chat.dealscale.io?${params}`, '_blank');
  };
  
  return (
    <FeatureGuard featureKey="ai-chat" fallbackTier="starter">
      <Button onClick={handleChatClick}>
        <MessageSquare /> Chat
      </Button>
    </FeatureGuard>
  );
}
```

## User Experience

### For Starter+ Users

1. Click **Chat** button
2. New tab opens instantly
3. Chat loads with their context
4. Toast confirms: "AI Chat Opened"
5. Can switch between tabs seamlessly

### For Free Users

1. Click **Chat** button (shows locked overlay)
2. Sees "Upgrade to Starter" message
3. Click opens pricing page
4. Clear upsell opportunity

## Mobile Optimization

### Button Sizing
- Mobile: `h-11` (44px) for touch targets
- Desktop: `h-10` (40px) for compact layout

### Button Order
- Mobile: Generate first, Chat second, Cancel last
- Desktop: Cancel left, Generate middle, Chat right

### Responsive Text
- Mobile: Shows emoji 💬 only
- Desktop: Shows "Chat" text + icon

## Security

### URL Parameters
- Uses `noopener,noreferrer` for security
- Parameters are URL-encoded
- No sensitive data in URL (IDs only)

### Access Control
- Tier-based feature gating
- Permission checks via FeatureGuard
- Graceful fallback for denied access

## Configuration

### Chat Domain

Update in `AIChatButton.tsx`:

```tsx
const chatUrl = `https://chat.dealscale.io?${params}`;
// Or use env variable:
const chatUrl = `${process.env.NEXT_PUBLIC_CHAT_URL}?${params}`;
```

### Required Tier

Change minimum tier:

```tsx
<FeatureGuard
  featureKey="ai-chat"
  fallbackTier="pro"  // Require Pro instead of Starter
>
```

### Additional Params

Add more context:

```tsx
params.set("campaignId", campaignId);
params.set("leadListId", leadListId);
params.set("industry", userIndustry);
```

## Benefits

### 1. **Seamless Workflow**
- Generate prompts in modal
- Continue conversation in chat
- Context preserved across tabs

### 2. **Monetization**
- Clear tier gate
- Visible upgrade path
- Premium feature showcase

### 3. **User Experience**
- Side-by-side actions
- Context-aware chat
- No context loss

### 4. **Scalability**
- Easy to add params
- Configurable tiers
- Reusable component

## Future Enhancements

### Real-Time Chat
```tsx
// Open chat in sidebar instead of new tab
setChatOpen(true);
setChatContext({ prompt, title });
```

### Chat History
```tsx
params.set("resumeConversation", conversationId);
```

### AI Agent Selection
```tsx
params.set("preferredAgent", "female" | "male" | "ai");
```

The chat button is now fully integrated with tier gating and context passing!

