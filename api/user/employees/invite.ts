import prisma from '../../../lib/prisma'; // Adjust the path as needed

// Middleware to log activities
prisma.$use(async (params, next) => {
  const result = await next(params);

  if (['create', 'update', 'delete'].includes(params.action)) {
    const { userId, taskTrackingId } = params.args; // Expect `userId` and `taskTrackingId` to be passed as part of args

    // Ensure `userId` is provided
    if (!userId) {
      throw new Error('User ID is required for activity logging');
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userProfileId: userId,
        action: `${params.model} - ${params.action}`,
        timestamp: new Date(),
        performedBy: userId, // Same as `userProfileId`, or use another source for performedBy
        taskTrackingId: taskTrackingId || null // Make `taskTrackingId` optional
      }
    });
  }

  return result;
});

// Other parts of your code...
