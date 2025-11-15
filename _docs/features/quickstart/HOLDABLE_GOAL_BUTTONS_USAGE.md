# Holdable Goal Buttons - User Guide

## Quick Reference

### How to Use

**Normal Workflow (Click):**
1. Click a goal button
2. First step modal opens
3. Complete the step manually
4. Continue through wizard as needed

**Automated Workflow (Hold):**
1. Press and hold a goal button for 2 seconds
2. Progress bar fills from 0% → 100%
3. Release early to cancel, or hold until complete
4. All steps execute automatically in background
5. Watch progress in button text
6. Success notification shows created resources

## Button States

| Visual | State | Meaning |
|--------|-------|---------|
| Default | Idle | Ready to use |
| Green | Selected | This is your current goal |
| Amber filling | Holding | Hold in progress (0-100%) |
| Blue border + spinner | Executing | Running automation |
| Yellow border | Paused | Flow paused mid-execution |
| Green border | Complete | Flow finished successfully |
| Red border | Error | Step failed, retry available |

## Controls

### During Hold (0-2 seconds)
- **Release early** → Cancels hold, returns to idle
- **Hold to 100%** → Starts automation

### During Execution
- **Pause button** (above) → Pauses at current step
- **Stop button** (above) → Cancels entire flow

### When Paused
- **Resume button** → Continues from current step
- **Cancel button** → Aborts flow, returns to idle

### When Error
- **Retry button** → Attempts failed step again (max 3)
- **Cancel button** → Gives up, returns to idle

## Automated Steps

### Step 1: Import/Prepare Leads
**What it does:**
- Checks if you have existing lead lists
- **Has lists**: Opens selector to choose one
- **No lists**: Opens CSV upload

**Headless automation:**
- Creates "Demo Lead List" with 150 mock leads
- Adds to your lead lists automatically
- Toast: "Lead list created: [Name]"

### Step 2: Create Campaign
**What it does:**
- Checks if lead list is selected
- Auto-selects first list if none chosen
- Opens campaign creation modal

**Headless automation:**
- Creates demo campaign linked to lead list
- Sets appropriate channel (call/text/email based on persona)
- Configures basic settings
- Toast: "Campaign created: [Name]"

### Step 3: Connect Integrations
**What it does:**
- Opens webhook/CRM configuration modal
- User can connect OAuth integrations

**Headless automation:**
- Creates mock webhook connection
- Simulates CRM integration
- Toast: "CRM integration connected"

## Progress Feedback

### Button Text Updates
```
Idle: "Nurture your sphere"
  ↓
Holding: "Hold 2s to automate (45%)"
  ↓
Step 1: "Step 1/3: Preparing leads..."
  ↓
Step 2: "Step 2/3: Creating campaign..."
  ↓
Step 3: "Step 3/3: Connecting integrations..."
  ↓
Complete: "Flow Complete! ✓"
  ↓
(3s later): "Nurture your sphere" (idle again)
```

### Toast Notifications
Each step shows:
1. Info toast: "Creating demo lead list..."
2. Success toast: "Lead list created: [Name]"
3. Final toast: "🎉 Automated setup complete! • Lead list: [Name] • Campaign configured • CRM connected"

## Tips

### For Best Experience
- ✅ Use single click for manual control
- ✅ Use hold for quick demos/testing
- ✅ Pause if you need to stop mid-flow
- ✅ Wait for "Flow Complete! ✓" before using button again

### Troubleshooting
- **Button not responding**: Wait 3 seconds for auto-reset
- **Can't hold**: Make sure status is "idle" (not executing)
- **Automation stuck**: Click "Stop" button above the goal button
- **Want to start over**: Refresh page to clear all state

## Background Animation

The Quick Start page features layered animated backgrounds:

### Light Rays
- Gentle pulsing rays from top
- Theme colors automatically match
- Always visible, always animating

### Collision Beams  
- Vertical beams falling from top
- Exploding particles when hitting bottom
- **Pause feature**: Hover over empty background areas (not cards/buttons)
- Cursor changes to crosshair when over pausable area

This creates an engaging, dynamic experience while you work! ✨













