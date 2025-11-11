# AI Chip Theming Documentation

## Overview
The AI chip system uses theme-aware CSS variables that automatically adapt to light/dark mode and follow the application's theming system.

## Chip Types & Color Variants

### 1. **Variables (Blue Variant)**
- **Purpose**: Represent dynamic data keys, leads, and platform variables
- **Color**: Blue spectrum
- **Class**: `chip-variant-variable`
- **Examples**: `{{leadSource}}`, `{{campaignName}}`, `{{location}}`
- **Visual Indicators**: Database, target, map pin icons
- **Adapts to**: `.variant-mood-calm` theme

### 2. **Tools (Green Variant)**
- **Purpose**: Represent action-performing tools
- **Color**: Green spectrum
- **Class**: `chip-variant-tool`
- **Examples**: `{{analyze}}`, `{{filter}}`, `{{score}}`
- **Visual Indicators**: Single letter badges (A, F, S)
- **Adapts to**: `.variant-pipeline-healthy` theme

### 3. **Functions (Purple Variant)**
- **Purpose**: Represent resource call functions
- **Color**: Purple spectrum
- **Class**: `chip-variant-function`
- **Examples**: `{{getLeadList}}`, `{{getCampaignData}}`
- **Visual Indicators**: "fn" monospace badge
- **Adapts to**: `.variant-mood-focused` theme

### 4. **Parameters (Orange Variant)**
- **Purpose**: Represent configurable parameters
- **Color**: Orange spectrum
- **Class**: `chip-variant-parameter`
- **Examples**: Reserved for future use
- **Visual Indicators**: Parameter icons
- **Adapts to**: `.variant-pipeline-watch` theme

### 5. **Scripts (Rose/Pink Variant)** 🆕
- **Purpose**: Represent sales scripts and messaging prompts
- **Color**: Rose/pink spectrum
- **Class**: `chip-variant-script`
- **Examples**: `{{coldCallScript}}`, `{{emailTemplate}}`, `{{objectionHandler}}`
- **Visual Indicators**: Phone, mail, message icons
- **Adapts to**: `.variant-mood-energetic`, `.variant-pipeline-risk` themes

## CSS Variables

Each chip variant defines three CSS custom properties:

```css
.chip-variant-{type} {
	--chip-bg: HSL_VALUE;      /* Background color */
	--chip-text: HSL_VALUE;    /* Text color */
	--chip-border: HSL_VALUE;  /* Border color */
}
```

### Light Mode Values

```css
.chip-variant-variable {
	--chip-bg: 217 91% 60%;    /* Blue */
	--chip-text: 217 91% 20%;
	--chip-border: 217 91% 50%;
}

.chip-variant-tool {
	--chip-bg: 142 76% 55%;    /* Green */
	--chip-text: 142 76% 15%;
	--chip-border: 142 76% 45%;
}

.chip-variant-function {
	--chip-bg: 258 84% 60%;    /* Purple */
	--chip-text: 258 84% 20%;
	--chip-border: 258 84% 50%;
}

.chip-variant-parameter {
	--chip-bg: 38 92% 60%;     /* Orange */
	--chip-text: 38 92% 20%;
	--chip-border: 38 92% 50%;
}
```

### Dark Mode Values

```css
.dark .chip-variant-variable {
	--chip-bg: 217 91% 40%;
	--chip-text: 217 91% 90%;
	--chip-border: 217 91% 45%;
}

.dark .chip-variant-tool {
	--chip-bg: 142 76% 36%;
	--chip-text: 142 76% 90%;
	--chip-border: 142 76% 40%;
}

.dark .chip-variant-function {
	--chip-bg: 258 84% 45%;
	--chip-text: 258 84% 90%;
	--chip-border: 258 84% 50%;
}

.dark .chip-variant-parameter {
	--chip-bg: 38 92% 50%;
	--chip-text: 38 92% 90%;
	--chip-border: 38 92% 55%;
}
```

## Usage

### Inline Usage
Chips automatically apply the correct variant based on their type:

```tsx
<ChipDefinition 
	type="variable"  // Applies blue variant
	key="leadSource"
	label="Lead Source"
/>

<ChipDefinition 
	type="tool"      // Applies green variant
	key="analyze"
	label="Analyze"
/>

<ChipDefinition 
	type="function"  // Applies purple variant
	key="getLeadList"
	label="Get Lead List"
/>
```

### Style Application
The chip component uses inline styles with CSS variables:

```tsx
style={{
	backgroundColor: `hsl(var(--chip-bg) / 0.2)`,  // 20% opacity for bg
	color: `hsl(var(--chip-text))`,
	borderColor: `hsl(var(--chip-border) / 0.4)`,  // 40% opacity for border
}}
```

## Customizing Theme Variants

To create a custom theme variant:

1. **Add to globals.css**:
```css
/* Light mode */
.chip-variant-custom {
	--chip-bg: HUE SATURATION LIGHTNESS;
	--chip-text: HUE SATURATION LIGHTNESS;
	--chip-border: HUE SATURATION LIGHTNESS;
}

/* Dark mode */
.dark .chip-variant-custom {
	--chip-bg: HUE SATURATION LIGHTNESS;
	--chip-text: HUE SATURATION LIGHTNESS;
	--chip-border: HUE SATURATION LIGHTNESS;
}
```

2. **Update chipColorMap**:
```tsx
const chipColorMap: Record<ChipType, {...}> = {
	custom: {
		variant: "chip-variant-custom",
		label: "Custom",
		hue: "custom-color",
	},
};
```

## Best Practices

1. **Maintain Contrast**: Ensure text is readable on backgrounds in both light and dark modes
2. **Use HSL**: HSL values allow easy theme adjustments
3. **Consistent Opacity**: Background uses 20% opacity, borders use 40%
4. **Semantic Colors**: 
   - Blue for data/variables
   - Green for actions/tools
   - Purple for functions/calls
   - Orange for parameters/config

## Integration with Existing Themes

The chip variants follow the same pattern as existing app themes:
- `.variant-mood-*` (calm, energetic, focused)
- `.variant-weather-*` (sunny, rainy, stormy)
- `.variant-pipeline-*` (healthy, watch, risk)

This ensures consistency across the application's theming system.

## Accessibility

- All chips include ARIA attributes
- Tooltips provide context: `"{Type}: {Description}"`
- Hover states increase opacity for visual feedback
- High contrast maintained in both light/dark modes
- Non-verbose icons provide quick visual identification

## Example Output

**Variable Chip (Blue)**:
```
🔵 {{leadSource}}  [×]
```

**Tool Chip (Green)**:
```
🟢 A {{analyze}}  [×]
```

**Function Chip (Purple)**:
```
🟣 fn {{getLeadList}}  [×]
```

Each chip adapts to the current theme automatically while maintaining its semantic color variant.

