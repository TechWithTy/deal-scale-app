import prisma from '../../lib/prisma'; // Import the singleton PrismaClient

// Function to update the first user in the UserProfile table
async function updateFirstUser() {
  try {
    // Find the first user
    const firstUser = await prisma.userProfile.findFirst();

    // If a user is found, update the user
    if (firstUser) {
      const updatedUser = await prisma.userProfile.update({
        where: {
          id: firstUser.id // Locate the user by ID
        },
        data: {
          firstName: 'Jane', // Update the first name
          lastName: 'Doe', // Update the last name
          city: 'Los Angeles', // Update the city
          personalNum: '987-654-3210' // Update the phone number
        }
      });
      console.log('Updated user:', updatedUser);
    } else {
      console.log('No users found in the database.');
    }
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the update function directly
updateFirstUser().catch((error) => {
  console.error('Error:', error);
});
