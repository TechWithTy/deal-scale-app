import { faker } from '@faker-js/faker';
import { APP_TESTING_MODE } from '../../../data';
import {
  KanbanTask,
  TaskActivity,
  TaskTracking
} from '@/types/_dashboard/kanban';

// Generate mock TaskActivity logs using Faker.js
const generateMockTaskActivity = (): TaskActivity[] => {
  const numberOfLogs = faker.number.int({ min: 1, max: 5 }); // Random number of logs per task
  return Array.from({ length: numberOfLogs }, () => ({
    action: faker.helpers.arrayElement(['created', 'updated', 'deleted']),
    timestamp: faker.date.recent(),
    performedBy: faker.person.firstName()
  }));
};

// Generate mock tasks using Faker.js
const generateMockTasks = (count: number): KanbanTask[] => {
  const statuses: Array<'TODO' | 'IN_PROGRESS' | 'DONE'> = [
    'TODO',
    'IN_PROGRESS',
    'DONE'
  ];

  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(statuses), // Random status
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']), // Random priority
    dueDate: faker.date.soon().toISOString().split('T')[0], // Random future date in YYYY-MM-DD format
    assignedToTeamMember: faker.string.uuid(), // Random team member ID
    activityLog: generateMockTaskActivity() // Generate random activity logs
  }));
};

export const generateTaskTracking = (taskCount: number): TaskTracking => {
  const tasks = generateMockTasks(taskCount);

  const tasksByStatus = {
    TODO: tasks.filter((task) => task.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((task) => task.status === 'DONE').length
  };

  // Flatten activity logs and filter out undefined values
  const taskHistory: TaskActivity[] = tasks
    .flatMap((task) => task.activityLog || []) // Ensure the log exists or provide an empty array
    .filter(Boolean); // Filter out undefined entries

  const assignedTasks: Record<string, KanbanTask[]> = tasks.reduce(
    (acc, task) => {
      if (task.assignedToTeamMember) {
        if (!acc[task.assignedToTeamMember]) {
          acc[task.assignedToTeamMember] = [];
        }
        acc[task.assignedToTeamMember].push(task);
      }
      return acc;
    },
    {} as Record<string, KanbanTask[]>
  );

  return {
    totalTasks: tasks.length,
    tasksByStatus,
    tasksAssigned: Object.values(assignedTasks).reduce(
      (total, tasks) => total + tasks.length,
      0
    ),
    tasksCompleted: tasksByStatus.DONE,
    tasksInProgress: tasksByStatus.IN_PROGRESS,
    assignedTasks,
    taskHistory // Track all task activities in a history log
  };
};

export const mockTrackingData = APP_TESTING_MODE && generateTaskTracking(10); // Generates tracking for 10 tasks
