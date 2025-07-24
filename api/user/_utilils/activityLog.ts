import prisma from '../../../lib/prisma';

/**
 * Utility function to log HTTP request activities
 * @param userId - The ID of the user making the request
 * @param method - HTTP method used in the request (e.g., 'GET', 'POST')
 * @param url - The API endpoint being accessed
 * @param userAgent - The User-Agent string from the request (optional)
 * @param taskTrackingId - The ID for task tracking (optional)
 */
export async function logHttpRequestActivity(
  userId: string,
  method: string,
  url: string,
  userAgent: string,
  taskTrackingId?: string // Make taskTrackingId optional
) {
  try {
    // Log the HTTP request activity in the `activityLog` table
    await prisma.activityLog.create({
      data: {
        userProfileId: userId,
        action: `HTTP ${method} - ${url}`, // Log the HTTP method and endpoint
        timestamp: new Date(),
        performedBy: userId,
        userAgent: userAgent, // Log the User-Agent header
        taskTrackingId: taskTrackingId || 'default-task-id' // Provide a default taskTrackingId or make it nullable
      }
    });
  } catch (error) {
    console.error('Error logging HTTP request activity:', error);
  }
}
