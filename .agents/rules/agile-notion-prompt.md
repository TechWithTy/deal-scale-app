---
trigger: model_decision
---

# Agile Database Orchestration POML

> Prompt Orchestration Markup Language for working with the Deal Scale Notion agile databases.

## Purpose

Use this file as the canonical prompt contract for creating, updating, and coordinating work across:

- [EPICS DB](https://www.notion.so/6e2f4828009c4c90908f950b396a2bfb)
- [SPRINTS DB](https://www.notion.so/b8d212076c484087825c0d842d0ea27a)
- [TASKS DB v 0.2](https://www.notion.so/9b97ef26ffa34674bf2ffe572c137b28)

## Operating Model

1. Epics define business outcomes, ownership, and the strategic goal.
2. Sprints define the time-box, KPI, velocity, and the delivery slice.
3. Tasks define executable work items, acceptance criteria, and implementation detail.
4. Relations must stay consistent in both directions when the database schema supports them.
5. Status updates should reflect the smallest truthful state change.

## Core Rules

- Never invent property names. Use the exact schema names from the Notion database.
- Never update read-only or system-managed fields.
- Prefer short, focused updates instead of rewriting entire records.
- Keep task content action-oriented and testable.
- When a sprint changes, review the linked epics and tasks for alignment drift.
- When an epic changes, cascade the impact into sprint goals and task scope.

## Database Map

### 1. EPICS DB

Primary purpose:

- Define the initiative, business goal, KPI, owner, and team scope.

Key properties:

- `Name` - title
- `Status` - `Not started | In progress | Done`
- `Goal` - text
- `KPI` - text
- `Description` - text
- `Owner` - person
- `Person` - person
- `Team(s)` - multi-select
- `SPRINTS DB` - relation to sprint records
- `Epic Features ` - relation to feature records

Recommended usage:

- Use `Name` for a concise initiative label.
- Use `Goal` for the outcome, not the implementation.
- Use `KPI` for the measurable success condition.
- Use `Description` to capture scope, constraints, and context.
- Use `Status` to indicate epic-level progress only.

### 2. SPRINTS DB

Primary purpose:

- Define delivery windows and coordinate feature and task execution.

Key properties:

- `Sprint Name` - title
- `status` - `Not started | In progress | Done`
- `Sprint Goal` - text
- `KPI` - text
- `Definition Of Done` - text
- `Velocity` - number
- `Start Date` - date
- `End Date` - date
- `TASKS DB v 0.2` - relation to task records
- `EPICS DB` - relation to epic records
- `Sprint Features` - relation to feature records

Recommended usage:

- Use `Sprint Name` as a time-box label or milestone label.
- Use `Sprint Goal` to capture the delivery objective.
- Use `Definition Of Done` as the acceptance contract for the entire sprint.
- Use `Velocity` only when the team has a stable historical baseline.
- Use `status` to reflect sprint lifecycle, not task count.

### 3. TASKS DB v 0.2

Primary purpose:

- Track executable work items, implementation steps, and delivery artifacts.

Key properties:

- `Name` - title
- `Status` - `To Do | In Progress | In Review | Done | Blocked | Backlogged`
- `Priority` - `Low | Medium | High | Critical`
- `Assignee` - person
- `Due Date` - date
- `Story Points` - number
- `Acceptance Criteria` - text
- `User Story` - text
- `Technical Requirements` - text
- `Implementation Steps` - text
- `Deliverables` - text
- `Branch Name` - text
- `Pull Request` - url
- `Dev Demo Link` - url
- `Task Notes` - text
- `Dev Logs / Notes` - text
- `How This Was Solved` - text
- `Project Tasks` - relation to project-task records
- `SPRINTS` - relation to sprint records
- `SOP` - relation to SOP records

Recommended usage:

- Use `Name` for a concise action statement.
- Use `User Story` for the user-facing intent.
- Use `Acceptance Criteria` for testable completion rules.
- Use `Technical Requirements` for implementation constraints.
- Use `Implementation Steps` for the actual build sequence.
- Use `Deliverables` to define what should exist when the task is complete.
- Use `Branch Name`, `Pull Request`, and `Dev Demo Link` to connect dev artifacts.

## Workflow Grammar

Use the following lightweight markup when instructing an agent to work with the databases.

```poml
<workflow id="agile-database-orchestration" mode="human-readable">
  <context>
    <system>Deal Scale agile delivery workspace</system>
    <databases>
      <database name="EPICS DB" role="strategy" />
      <database name="SPRINTS DB" role="delivery-window" />
      <database name="TASKS DB v 0.2" role="execution" />
    </databases>
  </context>

  <rules>
    <rule>Use exact Notion property names.</rule>
    <rule>Do not update system-managed fields.</rule>
    <rule>Preserve relation consistency across epic, sprint, and task records.</rule>
    <rule>Prefer minimal diffs and append-only notes where possible.</rule>
  </rules>

  <orchestration>
    <epic>
      <input>business_goal</input>
      <output>epic_record</output>
      <fields>
        <field name="Name" />
        <field name="Goal" />
        <field name="KPI" />
        <field name="Description" />
        <field name="Owner" />
        <field name="Status" />
        <field name="Team(s)" />
      </fields>
    </epic>

    <sprint>
      <input>epic_record</input>
      <output>sprint_record</output>
      <fields>
        <field name="Sprint Name" />
        <field name="Sprint Goal" />
        <field name="KPI" />
        <field name="Definition Of Done" />
        <field name="Start Date" />
        <field name="End Date" />
        <field name="Velocity" />
        <field name="status" />
      </fields>
    </sprint>

    <task>
      <input>sprint_scope</input>
      <output>task_record</output>
      <fields>
        <field name="Name" />
        <field name="Status" />
        <field name="Priority" />
        <field name="Assignee" />
        <field name="Due Date" />
        <field name="Story Points" />
        <field name="User Story" />
        <field name="Acceptance Criteria" />
        <field name="Technical Requirements" />
        <field name="Implementation Steps" />
        <field name="Deliverables" />
        <field name="Branch Name" />
        <field name="Pull Request" />
        <field name="Dev Demo Link" />
      </fields>
    </task>
  </orchestration>
</workflow>
```

## Prompt Templates

### Epic Planning Prompt

```text
You are organizing an epic in EPICS DB.

Goal:
- Convert the business objective into a single measurable epic.

Output requirements:
- Set the epic `Name`.
- Write a concise `Goal`.
- Add a measurable `KPI`.
- Add `Description` with scope and constraints.
- Set `Owner`, `Person`, `Team(s)`, and `Status`.
- Link related sprint records in `SPRINTS DB` when they exist.

Constraints:
- Do not create implementation details at the epic level.
- Do not add task-level artifacts here.
```

### Sprint Planning Prompt

```text
You are organizing a sprint in SPRINTS DB.

Goal:
- Convert one epic into a time-boxed delivery plan.

Output requirements:
- Set `Sprint Name`, `Sprint Goal`, `KPI`, and `Definition Of Done`.
- Set `Start Date`, `End Date`, and `Velocity` when known.
- Link the parent epic in `EPICS DB`.
- Link all included tasks in `TASKS DB v 0.2`.

Constraints:
- Keep the sprint goal scoped and measurable.
- Do not overload the sprint with unrelated work.
```

### Task Breakdown Prompt

```text
You are breaking sprint scope into tasks in TASKS DB v 0.2.

Goal:
- Convert sprint scope into executable, testable work items.

Output requirements:
- Set `Name`, `User Story`, `Acceptance Criteria`, `Technical Requirements`, and `Implementation Steps`.
- Set `Priority`, `Status`, `Assignee`, `Story Points`, and `Due Date` when available.
- Add `Deliverables`, `Branch Name`, `Pull Request`, and `Dev Demo Link` as work progresses.
- Link the task back to the sprint in `SPRINTS`.

Constraints:
- Every task must be independently checkable.
- Split broad work into smaller tasks if acceptance criteria cannot be tested in one pass.
```

## Status Logic

### Epic

- `Not started` when the initiative has not been decomposed.
- `In progress` when one or more sprints or tasks are active.
- `Done` when the outcome is complete and validated.

### Sprint

- `Not started` when the sprint has been defined but not kicked off.
- `In progress` when delivery is active.
- `Done` when the sprint goals and definition of done are met.

### Task

- `To Do` when not started.
- `In Progress` when actively being worked.
- `In Review` when awaiting validation or PR review.
- `Done` when acceptance criteria are met.
- `Blocked` when work cannot continue without external input.
- `Backlogged` when deferred out of the active sprint.

## Recommended Interaction Flow

1. Read the epic.
2. Extract the delivery objective and success metric.
3. Create or update the sprint.
4. Break the sprint into tasks.
5. Link records bidirectionally.
6. Update statuses as work moves forward.
7. Add implementation evidence to task records.

## Validation Checklist

- Epic fields are strategy-level only.
- Sprint fields are time-box and delivery-level only.
- Task fields are execution-level only.
- Relations are present and point to the correct records.
- Status values match the actual work state.
- No system-managed property was modified.
