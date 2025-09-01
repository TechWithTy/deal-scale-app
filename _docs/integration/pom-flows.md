---
Title: POM Flows (Prompt Orchestration for Action Bar AI)
Description: Define AI suggestion strategies and command routing using POM (Prompt Orchestration Markup) blocks.
---

# Overview

- __What__: POM describes how the Action Bar composes prompts, context, and post-processing to generate AI suggestions.
- __Why__: Keep AI behavior declarative, testable, and environment-portable.
- __How__: Author `<pom-flow>` specs and host them in-app or via CDN. The Action Bar fetches and executes them client-side or on your API server.

# Quick start: attach a POM flow

```html
<deal-action-bar
  ai-suggest-endpoint="/api/ai/command-suggest"
  data-pom-flow="/pom/action-bar/default.pom.json"
></deal-action-bar>
```

Or programmatically via the provider:

```ts
// Next.js/React
<CommandPaletteProvider
  aiSuggestEndpoint="/api/ai/command-suggest"
  pomFlowUrl="/pom/action-bar/default.pom.json"
>
  {/* app */}
</CommandPaletteProvider>
```

# POM schema (concise)

```json
{
  "version": "1.0",
  "id": "action-bar.default",
  "description": "Default AI suggestions for navigation + recent actions",
  "inputs": {
    "query": "string",
    "route": "string",
    "userRole": "string?",
    "recent": "string[]?"
  },
  "contexts": [
    { "id": "routeContext", "use": "window.location.pathname" },
    { "id": "recentContext", "use": "local.recentCommands(10)" }
  ],
  "prompt": {
    "system": "You are a concise command suggester for a SaaS dashboard. Return actionable, safe commands only.",
    "template": "User query: {{query}}\nCurrent route: {{route}}\nRecent: {{recent}}\nRole: {{userRole|default:'guest'}}\nReturn up to 6 suggestions grouped by category.",
    "model": "gpt-4o-mini",
    "temperature": 0.2
  },
  "post": {
    "map": "ai.suggestions -> commandItems",
    "filters": [
      { "name": "dedupeByLabel" },
      { "name": "limit", "args": { "count": 6 } },
      { "name": "roleGate", "args": { "role": "{{userRole}}" } }
    ]
  }
}
```

- __contexts__: lightweight resolvers the runtime provides (route, recent commands, feature flags, etc.).
- __prompt__: model/parameters + message template with handlebars-style binds.
- __post__: adapters/filters that turn model output into `CommandItem[]`.

# Example: navigation-first flow

```json
{
  "version": "1.0",
  "id": "action-bar.nav-first",
  "description": "Prefer navigation commands for short queries",
  "inputs": { "query": "string", "route": "string" },
  "prompt": {
    "system": "Suggest navigation commands first for short queries (<3 chars).",
    "template": "Q={{query}} R={{route}} Return JSON: [{label, href, group:'Navigation'}] then others.",
    "model": "gpt-4o-mini",
    "temperature": 0.1
  },
  "post": {
    "map": "ai.suggestions -> commandItems",
    "filters": [
      { "name": "shortQueryBoost", "args": { "threshold": 3, "boostGroup": "Navigation" } }
    ]
  }
}
```

# Post-processing adapters (builtin names)

- __map ai.suggestions -> commandItems__: Normalize AI JSON into `CommandItem` with `{id,label,group,href|action,icon,shortcut}`.
- __dedupeByLabel__: Remove duplicates keeping highest score.
- __limit {count}__: Cap items.
- __roleGate {role}__: Drop items forbidden for the role.
- __shortQueryBoost {threshold, boostGroup}__: Reorder to prioritize a group when `query.length < threshold`.

# Runtime wiring

- Client sends: `{ query, route, userRole, recent }` to `ai-suggest-endpoint`.
- Server loads the POM (from `pomFlowUrl` or filesystem) and executes:
  1. Resolve `contexts`.
  2. Fill `prompt.template` and call the `model`.
  3. Apply `post.filters` and `map`.
  4. Return `CommandItem[]`.

# Safety and validation

- Validate AI JSON with a strict schema before mapping to commands.
- Only allow `href` navigations or vetted `action` names; block arbitrary function strings.
- Enforce max 6-8 suggestions and timeouts (e.g., 800ms budget) to keep UX snappy.

# Local development

- Put flows in `public/pom/action-bar/*.pom.json` or serve from your API.
- Hot-swap by changing the `pomFlowUrl` prop.

# Testing

- Unit test post-filters deterministically.
- Snapshot-test model outputs using recorded fixtures.
- Add canary CI that lints flows and verifies JSON schema.

# Example: hybrid nav + intent with rerank

```json
{
  "version": "1.0",
  "id": "action-bar.hybrid",
  "inputs": { "query": "string", "route": "string", "userRole": "string?" },
  "prompt": {
    "system": "Produce navigation and intent actions for a CRM dashboard.",
    "template": "Query: {{query}}\nRoute: {{route}}\nRole: {{userRole}}\nReturn JSON with fields: label, group, score(0..1), href|action",
    "model": "gpt-4o-mini"
  },
  "post": {
    "map": "ai.suggestions -> commandItems",
    "filters": [
      { "name": "rerankByScore" },
      { "name": "limit", "args": { "count": 6 } }
    ]
  }
}
```

# FAQ

- __Can I host different flows per page?__ Yes; set `data-pom-flow` on each `<deal-action-bar>` instance.
- __Can I A/B test?__ Point `pomFlowUrl` to an experiment router that serves variants.
- __Which models?__ Any supported by your server; flows specify the `model` key.
