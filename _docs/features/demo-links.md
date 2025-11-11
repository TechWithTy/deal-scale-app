# Demo Test User Link Overrides

This guide explains how to preconfigure demo accounts through URL parameters on the sign-in screen. Sales and success teams can craft shareable links that hydrate the Test Users panel, set tier/role/quota overrides, inject branding, and optionally auto-login—perfect for rapid demo setup without touching the UI.

## Base URL

```
http://localhost:3000/signin
```

Append query parameters to control the seed user and overrides. The parser lives in `app/(auth)/signin/_components/test_users/urlOverrides.ts`.

## Core Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `demoUser` / `user` / `target` | Seed user ID or email to override. Defaults to the first mock user if omitted. | `demoUser=admin@example.com` |
| `name` | Display name used in Test Users list. | `name=Demo%20Sales%20User` |
| `email` | Login email override. | `email=demo@dealscale.example.com` |
| `password` | Password override (useful when sharing with prospects). | `password=demo123` |
| `role` | User role (`admin`, `member`, `platform_admin`, etc.). | `role=admin` |
| `tier` | Subscription tier (`Basic`, `Starter`, `Enterprise`). Case-insensitive. | `tier=Enterprise` |
| `beta` | Beta tester flag (`true`, `false`, `1`, `0`). | `beta=true` |
| `pilot` | Pilot tester flag. | `pilot=false` |
| `autoLogin` | Automatically triggers the credentials sign-in flow after hydration. | `autoLogin=1` |

## QuickStart Defaults

| Parameter | Description | Example |
|-----------|-------------|---------|
| `persona` / `quickstartPersona` | QuickStart persona (`agent`, `investor`, `wholesaler`, `lender`). | `persona=agent` |
| `goal` / `quickstartGoal` | QuickStart goal ID or title (`agent-sphere`, `lender-fund-fast`, etc.). | `goal=agent-sphere` |
| `clientType` / `segment` | Mirrors `DemoConfig.clientType` (`agent`, `loan_officer`, etc.). Automatically inferred from goal if omitted. | `clientType=agent` |

Selecting a goal automatically aligns persona, demo config goal text, and QuickStart defaults.

## Branding & Contact Fields

| Parameter | Description |
|-----------|-------------|
| `company` / `companyName` | Company name displayed in Demo Configuration. |
| `logo` | Company logo URL. |
| `website` | Company website. |
| `industry` | Industry descriptor. |
| `crmProvider` / `crm` | CRM dropdown value (`gohighlevel`, `salesforce`, `hubspot`, `close`, `zoho`, `other`). |
| `contactEmail` | Primary contact email. |
| `phone` / `phoneNumber` | Phone number. |
| `address` / `city` / `state` / `zip` / `zipCode` | Address fields. |
| `notes` | Free-form notes (displayed in Demo Configuration). |

### ROI Calculator Overrides

Use these optional numeric fields to prefill the QuickStart ROI calculator’s profile inputs. All values accept plain numbers; currency symbols and commas are stripped automatically.

| Parameter | Description |
|-----------|-------------|
| `roiDealsPerMonth` | Deals closed per month. |
| `roiAvgDealValue` | Average revenue per deal (USD). |
| `roiMonths` | Duration in months for the ROI projection. |
| `roiProfitMargin` | Profit margin percentage. |
| `roiMonthlyOverhead` | Monthly overhead cost (USD). |
| `roiHoursPerDeal` | Hours spent per deal (used to estimate time savings). |

Leaving any of these blank falls back to persona/goal presets.

## Social Media

Supported keys: `facebook`, `instagram`, `linkedin`, `twitter`/`x`, `youtube`, `tiktok`. Each value should be a URL.

Example:

```
&facebook=https://facebook.com/dealscale
&instagram=https://instagram.com/dealscale
```

## Quota Overrides

Optional numeric fields to showcase different usage levels. Values are clamped to allotted amounts.

| Parameter | Description |
|-----------|-------------|
| `aiAllotted`, `aiUsed` |
| `leadsAllotted`, `leadsUsed` |
| `skipAllotted`, `skipUsed` |

## Seed Control

| Parameter | Description |
|-----------|-------------|
| `seed` | Explicit seed user ID/email to clone, useful when creating a new link-only user rather than mutating the base. |

If neither `demoUser`, `user`, nor `seed` is provided, the first mock user is used.

## JSON Payload Override

For advanced scenarios, supply a JSON payload via:

| Parameter | Description |
|-----------|-------------|
| `config` | URL-encoded JSON string merged directly into `DemoConfig`. |
| `config64` | Base64-encoded JSON variant (handy for longer payloads). |

Example payload:

```
config=%7B%22brandColor%22%3A%22%2300B4D8%22%2C%22social%22%3A%7B%22linkedin%22%3A%22https%3A%2F%2Flinkedin.com%2Fcompany%2Fdealscale%22%7D%7D
```

## Full Example

```
http://localhost:3000/signin?demoUser=admin@example.com&name=Demo%20Sales%20User&email=demo@dealscale.example.com&password=demo123&role=admin&tier=Enterprise&beta=true&pilot=true&persona=agent&goal=agent-sphere&clientType=agent&company=Deal%20Scale%20Demo&logo=https%3A%2F%2Fvia.placeholder.com%2F200x60%2F3b82f6%2Fffffff%3Ftext%3DDEALSCALE&website=https%3A%2F%2Fdealscale.example.com&industry=Real%20Estate%20Technology&crmProvider=gohighlevel&roiDealsPerMonth=12&roiAvgDealValue=75000&roiMonths=12&roiProfitMargin=28&roiMonthlyOverhead=4000&roiHoursPerDeal=18&phone=%28555%29%20988-7654&contactEmail=contact%40dealscale.example.com&address=789%20Demo%20Street&city=San%20Francisco&state=CA&zip=94105&notes=Full%20feature%20demo%20for%20sales%20presentation&facebook=https%3A%2F%2Ffacebook.com%2Fdealscale&instagram=https%3A%2F%2Finstagram.com%2Fdealscale&linkedin=https%3A%2F%2Flinkedin.com%2Fcompany%2Fdealscale&twitter=https%3A%2F%2Ftwitter.com%2Fdealscale&youtube=https%3A%2F%2Fyoutube.com%2F%40dealscale&tiktok=https%3A%2F%2Ftiktok.com%2F%40dealscale&aiAllotted=1500&aiUsed=200&leadsAllotted=800&leadsUsed=150&skipAllotted=300&skipUsed=45&autoLogin=1
```

Opening this link:

1. Updates the Admin demo user with the provided persona/goal, branding, quotas, and CRM provider.
2. Hydrates all Demo Configuration fields.
3. Auto-logs in to `/dashboard`.

## Notes

- Parameters are case-insensitive for boolean toggles and aliases (e.g., `gohighlevel`, `GoHighLevel`, `ghl` all map to the same CRM).
- When `autoLogin=1`, the URL triggers a credentials sign-in after the Test Users list hydrates—ideal for landing directly on the dashboard.
- Link-specific users (created via overrides when `demoUser` doesn’t match an existing record) are not persisted to localStorage, preventing leftover data.
- The parser is defensive: invalid numbers are ignored, and quotas are clamped to prevent “used” from exceeding “allotted”.

Share this document with the sales team so they can generate demo links quickly and confidently.

