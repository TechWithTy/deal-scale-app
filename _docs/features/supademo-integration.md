# Supademo Integration Guide

This document explains how to integrate Supademo interactive demos and showcases into the Deal Scale application.

## Overview

Supademo provides interactive product demos and showcases that can be embedded in your application. We've integrated the Supademo SDK to provide contextual help and guided tours throughout the application.

## Implementation

### 1. SDK Setup

The Supademo SDK is loaded globally in the application layout:

```typescript
// app/layout.tsx
<Script
  src="https://script.supademo.com/script.js"
  strategy="beforeInteractive"
/>
```

### 2. SupademoTrigger Component

We've created a reusable `SupademoTrigger` component for easy integration:

```typescript
import { SupademoTrigger } from "@/components/ui/supademo-trigger";

// Data attribute method (recommended)
<SupademoTrigger demoId="your-demo-id">
  <HelpCircle className="w-5 h-5" />
</SupademoTrigger>

// Programmatic method
const { loadDemo, loadShowcase } = useSupademo();
loadDemo("your-demo-id");
```

### 3. Trigger Methods

#### Option 1: Data Attributes (Recommended)
Add data attributes to any HTML element:

```html
<!-- For demos -->
<button data-supademo-demo="YOUR_DEMO_ID">View Demo</button>

<!-- For showcases -->
<button data-supademo-showcase="YOUR_SHOWCASE_ID">View Showcase</button>
```

#### Option 2: Programmatic API
Use JavaScript for dynamic triggers:

```typescript
import { useSupademo } from "@/components/ui/supademo-trigger";

const { loadDemo, loadShowcase } = useSupademo();

// Trigger demo programmatically
loadDemo("YOUR_DEMO_ID");

// Trigger showcase programmatically
loadShowcase("YOUR_SHOWCASE_ID");
```

## Current Integration Points

### 1. Quick Start Page
- **Trigger:** Question mark icon in top-right corner
- **Demo ID:** `quickstart-demo-123`
- **Purpose:** Getting started guidance

### 2. Property Search Page
- **Enhanced WalkThroughModal** supports both YouTube and Supademo embeds
- **Demo IDs:** `demo-123`, `showcase-456` (example)
- **Title:** "Welcome To Your Lead Search"

### 3. WalkThroughModal Enhancement
The existing WalkThroughModal now supports:
- **YouTube embeds** (existing functionality)
- **Supademo embeds** (new functionality)
- **Interactive demo buttons** for Supademo content

## Usage Examples

### Example 1: Help Icon with Supademo
```tsx
<SupademoTrigger demoId="getting-started-demo">
  <HelpCircle className="w-5 h-5 text-muted-foreground" />
</SupademoTrigger>
```

### Example 2: Button with Showcase
```tsx
<SupademoTrigger showcaseId="product-tour">
  <Button>Take Product Tour</Button>
</SupademoTrigger>
```

### Example 3: Programmatic Trigger
```tsx
const { loadDemo } = useSupademo();

const handleFirstTimeUser = () => {
  loadDemo("onboarding-demo");
};
```

## Configuration

### Environment Variables
Add your Supademo API key to environment variables:

```env
NEXT_PUBLIC_SUPADEMO_API_KEY=your_api_key_here
```

### Demo/Showcase IDs
Replace placeholder IDs with actual Supademo content:
- `quickstart-demo-123` → Your actual Quick Start demo ID
- `demo-123` → Your actual Property Search demo ID
- `showcase-456` → Your actual Showcase ID

## Benefits

1. **Interactive Demos:** More engaging than static videos
2. **Contextual Help:** Triggers at relevant moments
3. **User Onboarding:** Guides new users through key features
4. **Flexible Integration:** Both declarative and programmatic approaches
5. **Performance:** SDK loads once globally, efficient for multiple triggers

## Best Practices

1. **Use Data Attributes** for static elements (buttons, icons)
2. **Use Programmatic API** for dynamic triggers (first visit, state changes)
3. **Keep Demo IDs Updated** with actual Supademo content
4. **Test Integration** in different scenarios (mobile, desktop, different user states)
5. **Monitor Usage** to understand which demos are most helpful

## Troubleshooting

- **SDK Not Loading:** Check network tab for script loading errors
- **Demo Not Triggering:** Verify Demo ID exists in your Supademo workspace
- **Modal Not Appearing:** Check that API key is properly configured
- **TypeScript Errors:** Ensure Window interface extension is loaded
