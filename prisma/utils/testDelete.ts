import prisma from '../../lib/prisma'; // Import the singleton PrismaClient

// Function to delete the first user in the UserProfile table
async function deleteFirstUser() {
  try {
    // Find the first user (you can adjust the sorting if necessary)
    const firstUser = await prisma.userProfile.findFirst();

    // If a user is found, delete the user
    if (firstUser) {
      const deletedUser = await prisma.userProfile.delete({
        where: {
          id: firstUser.id // Use the `id` field to delete the user
        }
      });
      console.log('Deleted user:', deletedUser);
    } else {
      console.log('No users found in the database.');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the delete function directly
deleteFirstUser().catch((error) => {
  console.error('Error:', error);
});
