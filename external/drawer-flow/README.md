# Drawer Flow

A self-contained, reusable drawer package for displaying and selecting items (e.g., properties) with search, pagination, and list operations (Create List and Add to List).

## Installation

Placed under `external/drawer-flow/`. Import via alias paths (e.g., `@/external/drawer-flow`).

## Public API

```ts
import { DrawerFlow } from '@/external/drawer-flow';
import type { DrawerItem, DrawerFlowProps, ListService } from '@/external/drawer-flow';
```

See `types/` for all exported types.

## Basic Usage

```tsx
<DrawerFlow
  listService={listService}
  loadMore={({ pageSize }) => listService.loadMore({ pageSize })}
  defaultPageSize={12}
  pageSizeOptions={[12, 24, 48, 96]}
/>
```

- Keep UI primitives from `components/ui/*` external.
- Pass a `listService` implementation to integrate with your backend.
