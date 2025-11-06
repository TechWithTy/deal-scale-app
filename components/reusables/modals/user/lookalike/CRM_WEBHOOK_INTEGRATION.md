# CRM & Webhook Integration for Lookalike Audiences

## Overview

The Lookalike Results Modal now includes integrated CRM connection and webhook setup options, allowing users to automatically sync generated leads to their existing systems.

## Features

### 1. CRM OAuth Connections
Connect lookalike audiences directly to popular CRM platforms:
- **GoHighLevel** - All-in-one marketing & CRM platform
- **Lofty** - Real estate CRM & automation
- **Salesforce** - Enterprise CRM integration
- **Zoho** - Business management suite

### 2. Webhook Integration
Set up custom webhooks to sync leads to any system that accepts webhooks.

## User Interface

### Location
The sync options appear under the "Save as Lead List" section in a highlighted box:

```
┌─────────────────────────────────────────┐
│ 💾 Save as Lead List                    │
│ ┌─────────────────┐  ┌──────────┐      │
│ │ List name...    │  │ 💾 Save  │      │
│ └─────────────────┘  └──────────┘      │
│                                          │
│ ⚡ Sync to Your Systems                 │
│ ┌──────────┐ ┌──────────┐             │
│ │🔗 GoHL   │ │🔗 Lofty  │             │
│ └──────────┘ └──────────┘             │
│ ┌──────────┐ ┌──────────┐             │
│ │🔗 Salesf.│ │🔗 Zoho   │             │
│ └──────────┘ └──────────┘             │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │🎣 Setup Webhook Integration          ││
│ │                        Custom sync ⟶ ││
│ └──────────────────────────────────────┘│
│                                          │
│ Connect your CRM or setup webhooks to   │
│ automatically sync leads                 │
└─────────────────────────────────────────┘
```

## CRM Connection Flow

### Step 1: Select Leads
User selects leads they want to sync from the results table.

### Step 2: Click CRM Button
User clicks on their preferred CRM (GoHighLevel, Lofty, Salesforce, or Zoho).

### Step 3: Save Lead List
System automatically saves the lead list first:
- Shows saving indicator
- Saves selected leads to list
- Shows success confirmation

### Step 4: OAuth Redirect
System redirects to OAuth page with:
- `platform={platform}` - CRM platform to connect
- `source=lookalike` - Indicates source of request
- `listName={name}` - Pre-filled list name
- `leadCount={count}` - Number of leads in list

**Example URL**:
```
/dashboard/profile#oauth?platform=salesforce&source=lookalike&listName=Lookalike%20-%20Top%20Investors&leadCount=50
```

### Step 5: OAuth Authorization
User completes OAuth flow on profile page:
1. Authenticate with CRM
2. Grant permissions
3. Confirm sync settings
4. Return to dashboard

### Step 6: Automatic Sync
Once connected, leads are automatically synced to the CRM.

## Webhook Setup Flow

### Step 1: Select Leads
User selects leads they want to sync.

### Step 2: Click Webhook Button
User clicks "Setup Webhook Integration".

### Step 3: Auto-Save List
System automatically saves the lead list first:
- Shows success toast
- List is saved with user-specified name

### Step 4: Open Webhook Modal
System opens the webhook configuration modal:
- **Stage**: "outgoing" (sending data out)
- **Category**: "leads" (lead data)
- Pre-configured for lead export

### Step 5: Configure Webhook
User configures webhook settings:
- Webhook URL
- Authentication headers
- Payload format
- Trigger conditions
- Test webhook

### Step 6: Activate
Webhook is activated and leads sync automatically.

## Technical Implementation

### CRM Connection Handler
```typescript
const handleConnectCRM = async (platform: string) => {
  // Validate selection
  if (selectedCandidates.length === 0) {
    toast.error("Please select at least one lead");
    return;
  }

  if (!listName.trim()) {
    toast.error("Please enter a list name");
    return;
  }

  try {
    setIsSaving(true);
    
    // Save the lead list first
    await onSaveAsList(listName, selectedCandidates);
    toast.success(`Saved ${selectedCandidates.length} leads`);
    
    // Small delay to show success message
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate to OAuth setup
    router.push(
      `/dashboard/profile#oauth?` +
      `platform=${platform}&` +
      `source=lookalike&` +
      `listName=${encodeURIComponent(listName)}&` +
      `leadCount=${selectedCandidates.length}`
    );
    
    toast.info(`Redirecting to ${platform} OAuth setup...`);
  } catch (error) {
    toast.error("Failed to save leads");
  } finally {
    setIsSaving(false);
  }
};
```

**Process**:
1. Validate lead selection
2. Validate list name
3. **Save lead list first** (critical step)
4. Show success message
5. Redirect to OAuth page with parameters

**Parameters**:
- `platform`: "gohighlevel" | "lofty" | "salesforce" | "zoho"
- `listName`: Current list name from input
- `source`: "lookalike" (for tracking)
- `leadCount`: Number of leads being synced

### Webhook Handler
```typescript
const handleSetupWebhook = async () => {
  // Validate selection
  if (selectedCandidates.length === 0) {
    toast.error("Please select at least one lead");
    return;
  }

  if (!listName.trim()) {
    toast.error("Please enter a list name");
    return;
  }

  try {
    setIsSaving(true);
    
    // Save lead list first
    await onSaveAsList(listName, selectedCandidates);
    toast.success(`Saved ${selectedCandidates.length} leads`);
    
    // Small delay to show success message
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Open webhook modal
    openWebhookModal("outgoing", "leads");
    toast.info("Configure webhook to sync leads");
  } catch (error) {
    toast.error("Failed to save leads");
  } finally {
    setIsSaving(false);
  }
};
```

**Process**:
1. Validate selection and list name
2. **Save lead list first** (critical step)
3. Show success message with delay
4. Open webhook modal (outgoing, leads)
5. Show guidance toast

## URL Parameters

### OAuth Page Parameters (Profile#oauth)
| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | CRM platform identifier |
| `source` | string | Origin of connection request |
| `listName` | string | Pre-filled list name (URL encoded) |
| `leadCount` | number | Number of leads in the list |
| `reconnect` | boolean | (Optional) Force reconnection |

**Supported Platforms**:
- `gohighlevel` - GoHighLevel CRM
- `lofty` - Lofty Real Estate CRM
- `salesforce` - Salesforce CRM
- `zoho` - Zoho CRM
- `pipedrive` - Pipedrive (future)
- `hubspot` - HubSpot (future)
- `monday` - Monday.com (future)

### Example URLs

#### New Connection
```
/dashboard/profile#oauth?platform=salesforce&source=lookalike&listName=Lookalike%20-%20Investors&leadCount=50
```

#### Reconnection
```
/dashboard/profile#oauth?platform=gohighlevel&source=lookalike&reconnect=true&listName=My%20List&leadCount=100
```

## Webhook Modal Integration

### Modal States
The webhook modal is opened with specific parameters:

**Stage**: `"outgoing"`
- Indicates data is being sent OUT to external system
- Configures payload structure
- Sets up authentication

**Category**: `"leads"`
- Specifies lead data format
- Includes standard lead fields
- Supports custom field mapping

### Webhook Configuration
Users can configure:
- **URL**: Destination endpoint
- **Method**: POST, PUT, PATCH
- **Headers**: Authorization, Content-Type, custom headers
- **Payload**: Lead data structure
- **Retries**: Retry logic for failures
- **Filters**: Which leads to sync

## Data Flow

### CRM Sync Flow
```
User selects leads
  ↓
Clicks CRM button
  ↓
Lead list saved (async)
  ↓
Success message shown
  ↓
Redirects to OAuth page
  ↓
User authorizes
  ↓
OAuth callback received
  ↓
Leads synced to CRM
  ↓
Success notification
```

### Webhook Sync Flow
```
User selects leads
  ↓
Clicks webhook button
  ↓
Lead list saved (async)
  ↓
Success message shown
  ↓
Webhook modal opens
  ↓
User configures webhook
  ↓
Webhook activated
  ↓
Leads sent to endpoint
  ↓
Success/failure logged
```

## Security

### OAuth Security
- ✅ **Secure Tokens**: OAuth 2.0 tokens stored encrypted
- ✅ **PKCE**: Proof Key for Code Exchange
- ✅ **Refresh Tokens**: Automatic token refresh
- ✅ **Scope Limitation**: Minimal required permissions

### Webhook Security
- ✅ **HTTPS Only**: All webhook URLs must use HTTPS
- ✅ **Authentication**: Support for API keys, bearer tokens
- ✅ **Signature Verification**: HMAC signatures
- ✅ **IP Whitelisting**: Optional IP restrictions
- ✅ **Rate Limiting**: Prevent abuse

## Error Handling

### CRM Connection Errors
- **No leads selected**: Show error toast
- **OAuth failure**: Redirect back with error message
- **Permission denied**: Show upgrade prompt
- **Connection timeout**: Retry with exponential backoff

### Webhook Errors
- **No leads selected**: Show error toast
- **Save failed**: Show error, don't open modal
- **Invalid URL**: Validate in webhook modal
- **Send failure**: Retry with backoff, log error
- **Timeout**: Queue for retry

## Benefits

### For Users
- ✅ **Seamless Integration**: Direct CRM connection
- ✅ **Automation**: Automatic lead sync
- ✅ **Flexibility**: Choose CRM or webhook
- ✅ **Real-time**: Immediate data transfer
- ✅ **Custom Workflows**: Webhook flexibility

### For Developers
- ✅ **Reusable**: Uses existing OAuth infrastructure
- ✅ **Maintainable**: Centralized webhook logic
- ✅ **Extensible**: Easy to add new CRMs
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Tested**: Existing webhook tests apply

## Supported CRM Platforms

### Currently Integrated
| Platform | OAuth | Sync Type | Status |
|----------|-------|-----------|--------|
| GoHighLevel | ✅ | Real-time | Active |
| Lofty | ✅ | Real-time | Active |
| Salesforce | ✅ | Real-time | Active |
| Zoho | ✅ | Real-time | Active |

### Coming Soon
| Platform | OAuth | Sync Type | ETA |
|----------|-------|-----------|-----|
| HubSpot | 🔄 | Real-time | Q1 2025 |
| Pipedrive | 🔄 | Real-time | Q1 2025 |
| Monday.com | 🔄 | Real-time | Q1 2025 |
| Copper | 🔄 | Real-time | Q2 2025 |

## User Experience

### Visual Feedback
- **Disabled State**: Gray out when no leads selected
- **Loading State**: Show spinner during save
- **Success Toast**: Confirm successful action
- **Error Toast**: Clear error messages
- **External Link Icon**: Indicates navigation

### Accessibility
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Clear ARIA labels
- ✅ High contrast icons
- ✅ Tooltip explanations

## Analytics Tracking

### Events Tracked
- `lookalike_crm_connect_clicked` - CRM button clicked
- `lookalike_crm_oauth_completed` - OAuth successful
- `lookalike_webhook_opened` - Webhook modal opened
- `lookalike_webhook_configured` - Webhook configured
- `lookalike_leads_synced` - Leads synced successfully

### Properties
- Platform name
- Lead count
- List name
- Source (always "lookalike")
- Timestamp

## Testing

### Manual Testing Steps
1. Generate lookalike audience
2. Select some leads
3. Click Salesforce button
4. Verify redirect to connections page
5. Check URL parameters are correct
6. Complete OAuth flow
7. Verify leads appear in Salesforce

### Webhook Testing Steps
1. Generate lookalike audience
2. Select some leads
3. Click "Setup Webhook Integration"
4. Verify list is saved
5. Verify webhook modal opens
6. Configure webhook URL
7. Test webhook endpoint
8. Verify leads are received

## Troubleshooting

### CRM Connection Issues
**Problem**: OAuth redirect fails
- Check browser popup blockers
- Verify CRM credentials
- Check network connection

**Problem**: Leads not syncing
- Verify OAuth token is valid
- Check CRM API limits
- Review sync logs

### Webhook Issues
**Problem**: Webhook not receiving data
- Verify webhook URL is accessible
- Check HTTPS certificate
- Review webhook logs

**Problem**: Duplicate leads
- Check webhook deduplication settings
- Verify lead ID mapping
- Review retry logic

## Future Enhancements

### Planned Features
- [ ] Bi-directional sync (CRM → Platform)
- [ ] Field mapping customization
- [ ] Sync scheduling (hourly, daily)
- [ ] Conflict resolution rules
- [ ] Bulk sync optimization
- [ ] Sync status dashboard
- [ ] More CRM platforms
- [ ] Advanced webhook templates

## Support

For assistance with:
- **CRM OAuth**: Contact support with platform name
- **Webhook Setup**: Refer to webhook documentation
- **Sync Issues**: Check sync logs in dashboard
- **API Limits**: Review your CRM plan

---

**Status**: ✅ Production Ready  
**Version**: 2.1.0  
**Last Updated**: November 6, 2024  

