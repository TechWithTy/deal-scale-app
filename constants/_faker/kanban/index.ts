import { faker } from '@faker-js/faker';
import { APP_TESTING_MODE } from '../../data';
import {
  KanbanColumn,
  KanbanTask,
  Priority,
  KanbanState,
  Status
} from '@/types/_dashboard/kanban';

// Default column structure with status-based `id`
const defaultCols: KanbanColumn[] = [
  {
    id: 'TODO',
    title: 'To Do'
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress'
  },
  {
    id: 'DONE',
    title: 'Done'
  }
];

// Generate random task activities
// const generateTaskActivity = (): TaskActivity => {
//   const actions: TaskActivity['action'][] = ['created', 'updated', 'deleted'];
//   const action = faker.helpers.arrayElement(actions); // Random action (created, updated, or deleted)
//   const timestamp = faker.date.recent(); // Random recent timestamp
//   const performedBy = faker.person.fullName(); // Random person performing the action

//   return {
//     action,
//     timestamp,
//     performedBy
//   };
// };

// const generateMockTasksWithTracking = (
//   count: number
// ): { tasks: KanbanTask[]; taskActivities: TaskActivity[] } => {
//   const statuses: KanbanTask['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];
//   const teamMembers = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Lee'];
//   const tasks: KanbanTask[] = [];
//   const taskActivities: TaskActivity[] = [];

//   // Create tasks and log activities
//   for (let i = 0; i < count; i++) {
//     const status = faker.helpers.arrayElement(statuses); // Random status
//     const assignedToTeamMember = faker.helpers.arrayElement(teamMembers); // Random team member

//     const task: KanbanTask = {
//       id: faker.string.uuid(),
//       title: faker.company.catchPhrase(),
//       description: faker.lorem.sentences(2),
//       status,
//       priority: faker.helpers.arrayElement(['low', 'medium', 'high', ]), // Random priority
//       dueDate: faker.date.future().toISOString().split('T')[0], // Due date in YYYY-MM-DD format
//       assignedToTeamMember,
//       activityLog: [] // Ensure this is always initialized
//     };

//     // Track the creation of the task in the activity log
//     const activity = generateTaskActivity();
//     task.activityLog && task.activityLog.push(activity); // Safely push to activityLog

//     tasks.push(task);
//     taskActivities.push(activity);
//   }

//   return { tasks, taskActivities };
// };

// Faker utility to generate mock tasks

export const generateMockTasks = (count: number): KanbanTask[] => {
  const statuses: Status[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  const priorities: Priority[] = ['low', 'medium', 'high'];

  return Array.from({ length: count }, () => {
    const status = faker.helpers.arrayElement(statuses); // Random status for the task
    const priority = faker.helpers.arrayElement(priorities); // Random priority
    const dueDate = faker.date.future().toISOString().split('T')[0]; // Future date in YYYY-MM-DD format
    const assignedToTeamMember = faker.person.fullName(); // Random team member name

    return {
      id: faker.string.uuid(),
      title: faker.company.catchPhrase(),
      description: faker.lorem.sentences(2),
      status,
      priority,
      dueDate,
      assignedToTeamMember
    };
  });
};
// Function to generate the initial Kanban state with Faker data
export const generateKanbanState = (taskCount: number): KanbanState => {
  const tasks = generateMockTasks(taskCount);

  // Organize tasks into columns based on their status
  const columns = defaultCols.map((column) => ({
    ...column,
    taskIds: tasks
      .filter((task) => task.status === column.id) // Only add tasks matching the column's status
      .map((task) => task.id) // Collect task IDs
  }));

  return {
    tasks,
    columns,
    draggedTask: null // Initially, no task is being dragged
  };
};

// Example usage: Generate a Kanban state with 10 tasks
export const mockKanbanState = APP_TESTING_MODE && generateKanbanState(10);
