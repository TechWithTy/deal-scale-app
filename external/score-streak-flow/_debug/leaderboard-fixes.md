# Leaderboard Components Debug Log

This log tracks the process of fixing errors in the leaderboard components within the `external/score-streak-flow` package.

## Initial State

- **Problem**: After `tsconfig.json` changes to support importing UI from the root app, multiple leaderboard components are showing type errors, primarily `Type 'Element' is not assignable to type 'ReactNode'`.
- **Hypothesis**: This is caused by a React type conflict due to having `react` as a direct dependency in the submodule. The fix is to make `react` a `peerDependency` and reinstall.

## Action Plan

1.  **Create Debug Log**: Done.
2.  **Re-run `pnpm install`**: Completed by user. Peer dependency changes are now in effect.
3.  **Analyze & Fix**: Errors persist. Proceeding with file-by-file analysis.

---

### `CreditRequestPopover.tsx`

- **Status**: Checked.
- **Result**: No type errors found in this file. The component structure and props are valid.

### `DonationPopover.tsx`

- **Status**: Checked.
- **Result**: No type errors found. The component structure and props are valid.

### `LeaderboardContainer.tsx`

- **Status**: Checked.
- **Result**: The component is correctly defined. The build error is not in the component's code, but is caused by a React version/type conflict in the monorepo.
- **Root Cause**: The submodule had `react` as a direct dependency, causing a type mismatch when consumed by the main app. Changing it to a `peerDependency` is the correct fix, but it requires `pnpm install` to take effect.
- **Next Step**: The `pnpm install` did not resolve the issue.

### Final Diagnosis & Plan

- **Root Cause**: The type error persists because of how the components are typed with `React.FC`. This conflicts with the React types from the main application, even with `peerDependencies`.
- **Solution**: Refactor all functional components to remove the `React.FC` type and instead type the `props` object directly. This is the modern standard and avoids this specific type conflict.

**Example:**

- **From**: `export const MyComponent: React.FC<MyProps> = ({ prop }) => ...`
- **To**: `export const MyComponent = ({ prop }: MyProps) => ...`

### `CreditRequestPopover.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `DonationPopover.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `LeaderboardContainer.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `LeaderboardFooter.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `LeaderboardHeader.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `LeaderboardSettingsPanel.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `OnlineStatus.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `RankRow.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

### `YourRankCard.tsx`

- **Status**: Completed.
- **Fix**: Refactored from `React.FC` to direct prop typing.

---

## Summary

All specified leaderboard components have been refactored to remove `React.FC`. This should resolve the `ReactNode` type conflict. The next step is to run the build and verify the fix.

