// lib/prisma.ts (or lib/prisma.js for JavaScript projects)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to log activities
prisma.$use(async (params, next) => {
  // Perform the actual operation (create, update, delete)
  const result = await next(params);

  // Check if the operation is one of 'create', 'update', or 'delete'
  if (['create', 'update', 'delete'].includes(params.action)) {
    // You can replace this with actual logic to get the user ID and task ID
    const userId = 'some-user-id'; // You can replace this with real user ID logic
    const someTaskId = '123'; // Task ID can be dynamic or optional
    const userAgent = 'Unknown'; // Default value for userAgent, replace with actual logic

    // Log the activity in the `activityLog` table
    await prisma.activityLog.create({
      data: {
        userProfileId: userId,
        action: `${params.model} - ${params.action}`, // Logs the model and action
        timestamp: new Date(),
        performedBy: userId, // Replace with the actual performer of the action
        taskTrackingId: someTaskId, // Task tracking ID (optional)
        userAgent: userAgent // User agent is required
      }
    });
  }

  return result;
});

export default prisma;
