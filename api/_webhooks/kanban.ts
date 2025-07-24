import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client'; // Prisma client import
import { Priority } from '@/types/_dashboard/kanban'; // Adjust this import path as needed

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Helper to validate priority and dueDate
const isValidPriority = (priority: any): priority is Priority =>
  ['low', 'medium', 'high'].includes(priority);

const isValidDueDate = (dueDate: any): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(dueDate);

const isValidStatus = (status: any): status is string =>
  ['TODO', 'IN_PROGRESS', 'DONE'].includes(status);

// Webhook to add a task for a specific customer
app.post('/webhook/add-task', async (req: Request, res: Response) => {
  const {
    customerId,
    kanbanStateId,
    status,
    taskTitle,
    taskDescription,
    priority,
    dueDate
  } = req.body as {
    customerId: string;
    kanbanStateId: string; // ID of the KanbanState to which the task belongs
    status: string;
    taskTitle: string;
    taskDescription?: string;
    priority?: Priority;
    dueDate?: string;
  };

  // Convert status to string if it's not already
  const statusAsString = String(status);

  // Validate incoming data
  if (
    !customerId ||
    !kanbanStateId ||
    !statusAsString ||
    !taskTitle ||
    !isValidStatus(statusAsString)
  ) {
    return res.status(400).json({
      message:
        'Invalid input. Please provide valid customerId, kanbanStateId, status, and taskTitle.'
    });
  }

  if (priority && !isValidPriority(priority)) {
    return res.status(400).json({
      message: 'Invalid priority. Must be "low", "medium", or "high".'
    });
  }

  if (dueDate && !isValidDueDate(dueDate)) {
    return res.status(400).json({
      message: 'Invalid due date format. Must be YYYY-MM-DD.'
    });
  }

  // Check if customer exists (assumes UserProfile represents customer)
  const customer = await prisma.userProfile.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  // Check if KanbanState exists
  const kanbanState = await prisma.kanbanState.findUnique({
    where: { id: kanbanStateId }
  });

  if (!kanbanState) {
    return res.status(404).json({ message: 'Kanban state not found.' });
  }

  // Create a new task
  try {
    const newTask = await prisma.kanbanTask.create({
      data: {
        id: uuidv4(),
        title: taskTitle,
        description: taskDescription || '',
        status: statusAsString,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        userProfile: { connect: { id: customerId } },
        kanbanState: { connect: { id: kanbanStateId } } // Connect to the KanbanState
      }
    });

    return res.status(200).json({
      message: 'Task added successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      message: 'Failed to create task. Please try again later.'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.warn(`Server is running on http://localhost:${port}`);
});
