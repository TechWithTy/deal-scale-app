import { NextApiRequest, NextApiResponse } from 'next';
import checkAndUpdateCredits from '../_utilils/checkCredits';

// Function to perform the AI task (e.g., voice cloning, text generation, etc.)
async function performAITask(taskType: string, taskData: any): Promise<any> {
  switch (taskType) {
    case 'voice_cloning':
      // Logic for voice cloning task using taskData
      console.log('Performing voice cloning with data:', taskData);
      return { result: 'Voice cloned successfully' }; // Simulated result

    case 'text_generation':
      // Logic for text generation task using taskData
      console.log('Generating text with data:', taskData);
      return { result: 'Text generated successfully' }; // Simulated result

    case 'image_generation':
      // Logic for image generation task using taskData
      console.log('Generating image with data:', taskData);
      return { result: 'Image generated successfully' }; // Simulated result

    default:
      throw new Error(`Unsupported AI task type: ${taskType}`);
  }
}

// Function to handle AI credits and tasks (renamed from useAICredits)
async function processAICredits(
  subscriptionId: string,
  creditsToUse: number,
  taskType: string,
  taskData: any
) {
  // Step 1: Check and update AI credits
  await checkAndUpdateCredits(subscriptionId, 'AICredits', creditsToUse);

  // Step 2: Perform the AI task (e.g., voice cloning, etc.)
  const taskResult = await performAITask(taskType, taskData);

  // Step 3: Return the task result
  return taskResult;
}

// API route handler for using AI credits for various tasks
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscriptionId, creditsToUse, taskType, taskData } = req.body;

  // Basic validation for required fields
  if (!subscriptionId || !creditsToUse || !taskType || !taskData) {
    return res.status(400).json({
      error: 'subscriptionId, creditsToUse, taskType, and taskData are required'
    });
  }

  try {
    // Step 1: Use AI credits and perform the task
    const taskResult = await processAICredits(
      subscriptionId,
      creditsToUse,
      taskType,
      taskData
    );

    // Step 2: Return the task result
    return res.status(200).json({
      message: `${taskType} completed successfully`,
      result: taskResult
    });
  } catch (error) {
    // Type guard to handle 'unknown' errors
    if (error instanceof Error) {
      console.error('Error using AI credits:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: 'An unknown error occurred' });
  }
}
