# External Kanban Module

A self-contained Kanban module that lives entirely under `external/kanban/`.

- Local types: `./types.ts`
- Local mocks: `./mocks.ts`
- Local store (Zustand): `./store.ts`
- Local utils: `./utils.ts`
- Components: `KanbanBoard`, `BoardColumn`, `TaskCard`, `ColumnActions`, `NewSectionDialog`
- New Task UI: `NewTaskDialog` + components in `./new-task-dialog/`
- Barrel export: `./index.ts`

UI components are expected from your existing shadcn setup (`@/components/ui/*`). No other imports reference outside the `external/` folder.

## Install peer dependencies

This module uses the following libraries from your app:

- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
- class-variance-authority
- lucide-react
- zustand
- uuid

Ensure they are installed in your project.

## Usage

```tsx
import { KanbanBoard, NewTaskDialog } from "@/external/kanban";

export default function Page() {
  return (
    <div className="space-y-4">
      <NewTaskDialog />
      <KanbanBoard />
    </div>
  );
}
```

## Notes

- The store (`useTaskStore`) is persisted under the key `external-task-store`.
- `mocks.ts` provides simple team members, leads, and lead lists for demo purposes.
- You can replace mocks with real data sources by extending the store/actions as needed.
