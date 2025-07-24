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
