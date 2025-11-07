# Embeddable Charts Testing Notes

Last verified: 2025-11-07

## Current Status

- `pnpm vitest run tests/external/embed-chart.spec.tsx` ✓
- Suite covers three behaviours:
  - Bootstrap renders loading state then mounts success payload
  - Polling cadence reissues requests using mocked fetch
  - Data refresh updates the latest metric and preserves a single mounted instance

## Key Testing Techniques

1. **Mocked Frame Component**  
   The test replaces `EmbedChartFrame` with a lightweight shim that reads the `useLiveChartData` hook and renders deterministic DOM nodes. This keeps assertions focused on data updates without Recharts or layout noise.

2. **Mocked Live Data Endpoint**  
   `global.fetch` is stubbed to return deterministic responses. Each call increments the metric value so we can assert that polling produces visible updates.

3. **DOM Isolation**  
   After every test we clear `document.body` and call `unmountDealScaleCharts()` to prevent residual host nodes from interfering with subsequent assertions.

4. **Timer Expectations**  
   Instead of exact tick counts, tests assert that the polling fetch has fired at least once/twice, making them resilient to internal jitter logic.

## How to Re-run Locally

```bash
pnpm vitest run tests/external/embed-chart.spec.tsx
```

Or to watch other suites while focusing on embeds:

```bash
pnpm vitest --watch --run tests/external/embed-chart.spec.tsx
```

## Future Enhancements

- Add integration coverage that mounts the generated bundle in a JSDOM-like page to ensure stylesheet injection and host attributes behave as expected.
- Introduce Playwright smoke to load the mock API route (`/api/charts/live/:chartId`) and verify the embedded script inside a real browser frame.

