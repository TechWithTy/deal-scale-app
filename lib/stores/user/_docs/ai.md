# AI Stores

- `useAISettingsStore`: assistant, squad, voices, avatar/background; hydrate from `UserProfile.aIKnowledgebase`.
- `useAIActionsStore`: quick actions registry by category.
- `useAIChatStore`: persisted threads and messages with `uuid` IDs.
- `useAIReportsStore`: status counts, `directMailSummary`, `textSummary`, `callSummary`, `socialSummary`, and `kanbanSummary`.
- `useAITasksStore`: collects AI-suggested tasks and can `promoteToBoard()` into the main Kanban store.

## Import

```ts
import {
  useAISettingsStore,
  useAIActionsStore,
  useAIChatStore,
  useAIReportsStore,
  useAITasksStore,
} from '@/lib/stores/user/userProfile';
```

## Notes

- Voices typed with `AssistantVoice`.
- Optional chaining everywhere when deriving from mock user.
- Kanban summaries read from `UserProfile.companyInfo.KanbanTasks`.
