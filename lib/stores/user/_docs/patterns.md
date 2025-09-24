# Patterns and Conventions

- Use specific types; avoid `any`.
- Use optional chaining (e.g., `MockUserProfile?.companyInfo?.campaigns`).
- Import campaign types from `types/_dashboard/campaign`.
- For transfer breakdowns, use a temporary variable for the computed key:

```ts
const key = campaign.transfer?.type; // TransferType | undefined
if (key) breakdown[key] = (breakdown[key] ?? 0) + 1;
```

- Keep files small and single-purpose. Prefer selectors over in-place mutation.
