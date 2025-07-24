import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; // Adjust the path as needed
import { v4 as uuidv4 } from 'uuid'; // Import UUID to generate unique identifiers
// Main handler for the API requests
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query; // Extract the ID from query params

  switch (method) {
    case 'POST':
      return await createUserProfile(req, res);
    case 'GET':
      if (id) {
        return await getUserProfile(req, res, id as string); // Get single user profile by id
      }
      return await getAllUserProfiles(req, res); // Get all user profiles if no id is provided
    case 'PUT':
      return await updateUserProfile(req, res, id as string); // Update user profile by id
    case 'DELETE':
      return await deleteUserProfile(req, res, id as string); // Delete user profile by id
    default:
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
// Create a new user profile
async function createUserProfile(req: NextApiRequest, res: NextApiResponse) {
  const {
    firstName,
    lastName,
    email,
    country,
    city,
    personalNum,
    subscriptionId
  } = req.body;

  // Ensure required fields are provided
  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: 'First Name, Last Name, and Email are required' });
  }

  try {
    // Generate a unique identifier
    const uniqueIdentifier = uuidv4();

    // Create a new user profile with the required fields
    const newUserProfile = await prisma.userProfile.create({
      data: {
        uniqueIdentifier, // Required field
        firstName,
        lastName,
        email,
        country,
        city,
        personalNum,
        subscription: subscriptionId
          ? {
              connect: { id: subscriptionId } // If the subscription exists, connect it
            }
          : undefined
      },
      include: {
        subscription: true // Include subscription in the response if it exists
      }
    });

    return res.status(201).json({
      message: 'User profile created successfully',
      user: newUserProfile
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return res.status(500).json({ error: 'Failed to create user profile' });
  }
}

// Get a single user profile by id
async function getUserProfile(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        subscription: true,
        connectedAccounts: true,
        notificationPreferences: true,
        twoFactorAuth: true
      }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

// Get all user profiles
async function getAllUserProfiles(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userProfiles = await prisma.userProfile.findMany({
      include: {
        subscription: true,
        connectedAccounts: true
      }
    });
    return res.status(200).json(userProfiles);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
}

// Update a user profile by id
async function updateUserProfile(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const {
    firstName,
    lastName,
    email,
    country,
    city,
    personalNum,
    subscriptionId
  } = req.body;

  try {
    const updatedUserProfile = await prisma.userProfile.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        country,
        city,
        personalNum,
        subscription: subscriptionId
          ? {
              connect: { id: subscriptionId }
            }
          : undefined // If the subscription exists, connect it
      },
      include: {
        subscription: true
      }
    });

    return res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUserProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
}

// Delete a user profile by id
async function deleteUserProfile(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const deletedUserProfile = await prisma.userProfile.delete({
      where: { id },
      include: {
        subscription: true
      }
    });

    return res.status(200).json({
      message: 'User profile deleted successfully',
      user: deletedUserProfile
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return res.status(500).json({ error: 'Failed to delete user profile' });
  }
}
