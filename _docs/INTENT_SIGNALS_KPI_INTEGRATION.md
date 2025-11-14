# Intent Signals & KPI Integration Guide

## Overview

This document explains how Intent Signals integrate with the existing Sales KPI dashboard at `/dashboard/charts` and how to leverage intent signal data for better sales analytics.

## Architecture

### Data Flow

```
Lead Activity → Intent Signals → Intent Score → KPI Metrics
                       ↓                ↓
                 Lead Table         Analytics
                   Column          Dashboard
                       ↓
                Intent Signals
                     Tab
```

## Intent Signal Types

### 1. Engagement Signals (Direct Interactions)
- **Email opens** (+7 pts): Lead opened an email
- **Email clicks** (+6 pts): Lead clicked a link in email
- **Email replies** (+11 pts): Lead responded to email
- **SMS replies** (+11 pts): Lead responded to SMS
- **Call answered** (+22 pts): Lead answered phone call
- **Call connected** (+27 pts): Extended phone conversation
- **Voicemail listened** (+4 pts): Lead listened to voicemail

### 2. Behavioral Signals (Platform Activity)
- **Website visit** (+5 pts): Lead visited your website
- **Pricing viewed** (+30 pts): HIGH INTENT - Viewed pricing page
- **Demo request** (+28 pts): HIGH INTENT - Requested a demo
- **Property viewed** (+4 pts): Viewed a property listing
- **Property search** (+15 pts): Searched for properties
- **Document downloaded** (+14 pts): Downloaded resources
- **Form submitted** (+25 pts): HIGH INTENT - Submitted a form
- **Contract viewed** (+26 pts): HIGH INTENT - Viewed contract
- **Video watched** (+12 pts): Watched video content
- **Calculator used** (+12 pts): Used ROI/mortgage calculator

### 3. External Signals (Third-party Data)
- **LinkedIn visit** (+2 pts): Visited your LinkedIn profile
- **LinkedIn profile view** (+5 pts): Viewed your profile
- **Company growth** (+1 pt): Company hiring/expanding
- **Job change** (+1 pt): Lead changed jobs
- **Funding event** (+1 pt): Company received funding
- **Social follow** (+2 pts): Followed on social media
- **Social mention** (+2 pts): Mentioned you on social

## Intent Score Calculation

### Scoring Formula

```typescript
intentScore = Σ(signalWeight × decayFactor) × 0.8

where:
- signalWeight = base weight from signal category
- decayFactor = time-based decay (1.0 for signals < 7 days old)
- 0.8 = normalization factor to keep scores in 0-100 range
```

### Time Decay

- **Days 0-7**: No decay (factor = 1.0)
- **Days 8+**: 5% decay per day
- **Days 30+**: Signals expire (factor = 0)

### Intent Levels

| Score Range | Level  | Color  | Badge Variant |
|-------------|--------|--------|---------------|
| 75-100      | High   | Green  | Default       |
| 50-74       | Medium | Yellow | Secondary     |
| 1-49        | Low    | Gray   | Outline       |
| 0           | None   | Gray   | Outline       |

## Integration Points

### 1. Lead Table (`/dashboard/leads`)

**Intent Score Column**
- Displays intent score (0-100)
- Shows intent level badge (High/Medium/Low)
- Sortable column
- Click lead → opens modal with Intent Signals tab

**Usage:**
```typescript
// Sort leads by intent score
const highIntentLeads = leads
  .filter(lead => lead.intentScore?.total >= 75)
  .sort((a, b) => (b.intentScore?.total || 0) - (a.intentScore?.total || 0));
```

### 2. Lead Detail Modal

**Intent Signals Tab**
- Shows only if lead has `intentSignals` array with data
- Displays intent score widget with breakdown
- Lists all signals grouped by type
- Filterable by Engagement/Behavioral/External

**Visibility Logic:**
```typescript
const hasIntentSignals = Boolean(
  lead.intentSignals && 
  Array.isArray(lead.intentSignals) && 
  lead.intentSignals.length > 0
);
const showIntentTab = hasIntentSignals && lead.intentScore;
```

### 3. Sales KPI Dashboard (`/dashboard/charts`)

**Existing Components:**
- **KPI Cards**: Total Leads, Campaigns, Conversion Rate, Active Tasks
- **Campaign Performance Chart**: Track campaign effectiveness
- **Lead Trends Chart**: Monitor lead volume over time
- **Sales Pipeline Funnel**: Visualize conversion funnel
- **ROI Calculator**: Calculate return on investment

**Intent Signal Integration:**
- High-intent leads improve conversion rates
- Track intent score trends alongside lead trends
- Correlate intent signals with closed deals
- Use intent data for predictive lead scoring (Advanced tab)

### 4. Advanced Analytics Tab

**Signal Attribution Component:**
```typescript
interface SignalToSaleAttribution {
  signalType: string;        // e.g., "pricing_viewed"
  leadCount: number;         // Leads with this signal
  dealsClosed: number;       // How many closed
  conversionRate: number;    // Conversion %
  avgIntentScore: number;    // Average intent score
  avgDealValue: number;      // Average deal size
}
```

This allows you to identify which signals are most predictive of closing deals.

## Connecting Intent Signals to KPIs

### Conversion Rate Analysis

```typescript
// Calculate conversion rate by intent level
const highIntentLeads = leads.filter(l => l.intentScore?.level === "high");
const highIntentClosed = highIntentLeads.filter(l => l.status === "Closed");
const highIntentConversionRate = 
  (highIntentClosed.length / highIntentLeads.length) * 100;

// Compare to overall conversion rate
const overallConversionRate = 
  (closedLeads.length / totalLeads.length) * 100;

console.log(`High-intent conversion: ${highIntentConversionRate}%`);
console.log(`Overall conversion: ${overallConversionRate}%`);
// Expected: High-intent leads convert 2-3x better
```

### Pipeline Velocity

High-intent leads move faster through the pipeline:

```typescript
// Average days to close by intent level
const closedLeads = leads.filter(l => l.status === "Closed");

const avgDaysToCloseByIntent = {
  high: calculateAvgDaysToClose(
    closedLeads.filter(l => l.intentScore?.level === "high")
  ),
  medium: calculateAvgDaysToClose(
    closedLeads.filter(l => l.intentScore?.level === "medium")
  ),
  low: calculateAvgDaysToClose(
    closedLeads.filter(l => l.intentScore?.level === "low")
  ),
};

// Expected results:
// High: 7-14 days
// Medium: 14-30 days  
// Low: 30-60 days
```

### ROI Impact

```typescript
// Calculate ROI improvement from intent signals
const highIntentDeals = closedDeals.filter(
  d => d.intentScore?.level === "high"
);

const avgDealValue = {
  highIntent: calculateAvg(highIntentDeals.map(d => d.propertyValue)),
  allDeals: calculateAvg(closedDeals.map(d => d.propertyValue)),
};

const roiImprovement = 
  ((avgDealValue.highIntent - avgDealValue.allDeals) / avgDealValue.allDeals) * 100;

console.log(`ROI improvement from high-intent leads: +${roiImprovement}%`);
```

## Using Intent Signals for Sales Prioritization

### Daily Workflow

1. **Morning**: Open `/dashboard/charts` → Review KPIs
   - Check conversion rate trends
   - Identify pipeline bottlenecks

2. **Lead Review**: Navigate to `/dashboard/leads`
   - Sort by Intent Score (descending)
   - Focus on High-intent leads first (75+)
   - Review Intent Signals tab to understand engagement

3. **Outreach Strategy**:
   - **High Intent (75+)**: Immediate outreach, offer demo/pricing
   - **Medium Intent (50-74)**: Nurture with targeted content
   - **Low Intent (0-49)**: Add to email drip campaign

### Automation Ideas

```typescript
// Auto-assign high-intent leads to sales reps
const highIntentLeads = leads.filter(l => l.intentScore?.total >= 75);
const unassignedHighIntent = highIntentLeads.filter(l => !l.assignedTo);

for (const lead of unassignedHighIntent) {
  // Auto-assign to available rep
  assignToNextAvailableRep(lead);
  // Send notification
  notifyRep(lead.assignedTo, `High-intent lead: ${lead.contactInfo.firstName}`);
}
```

## API Integration (Future)

### Recording Intent Signals

```typescript
// POST /api/leads/:leadId/intent-signals
{
  "type": "behavioral",
  "category": "pricing_viewed",
  "timestamp": "2024-11-06T10:30:00Z",
  "metadata": {
    "pageUrl": "https://dealscale.app/pricing",
    "timeOnPage": 180
  }
}
```

### Fetching Lead with Intent Data

```typescript
// GET /api/leads/:leadId?include=intentSignals,intentScore
{
  "id": "lead_123",
  "contactInfo": {...},
  "intentSignals": [...],
  "intentScore": {
    "total": 72,
    "level": "medium",
    "breakdown": {
      "engagement": 25,
      "behavioral": 40,
      "external": 7
    },
    "trend": "up",
    "trendPercent": 15.5,
    "signalCount": 18
  }
}
```

## Best Practices

### 1. Signal Quality Over Quantity
- Focus on high-value signals (pricing, demo, contract)
- Don't over-weight low-value signals
- Adjust weights based on your conversion data

### 2. Timing Matters
- Recent signals (< 7 days) are most predictive
- Act quickly on high-intent signals
- Re-engage leads whose intent is declining

### 3. Combine with Other Data
- Intent signals + demographics = better targeting
- Intent signals + property fit = prioritization
- Intent signals + budget = qualification

### 4. Track Signal Attribution
- Which signals lead to closes?
- What's the avg intent score of closed deals?
- Optimize your outreach based on data

## Performance Metrics to Track

### Lead-Level
- Average intent score
- Intent score at conversion
- Time from first signal to close
- Signal velocity (signals per week)

### Campaign-Level
- Intent signals generated per campaign
- Cost per high-intent signal
- Campaign ROI by intent level

### Team-Level
- Response time to high-intent signals
- Conversion rate by intent level
- Revenue from high-intent vs. low-intent

## Troubleshooting

### Intent Signals Tab Not Showing
- **Check**: Does the lead have `intentSignals` array?
- **Check**: Does the lead have `intentScore` object?
- **Check**: Is the signals array non-empty?
- **Fix**: Run `enrichLeadWithIntentSignals(lead)` to add signals

### Intent Score is 0
- **Cause**: No signals or all signals expired (>30 days)
- **Fix**: Record recent signals or wait for new activity

### Intent Column Shows "No Data"
- **Cause**: Lead has no `intentScore` object
- **Fix**: Ensure mock data includes intent enrichment

## Summary

Intent Signals provide a quantitative measure of lead engagement, enabling:
1. **Better Prioritization**: Focus on high-intent leads
2. **Improved Conversion**: Target the right leads at the right time
3. **Faster Cycles**: Engage when leads are hot
4. **Higher ROI**: Convert more leads with less effort

The integration with your existing KPI dashboard allows you to track these improvements and optimize your sales process continuously.

