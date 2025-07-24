// testPost.ts
import prisma from '../../lib/prisma'; // Import the singleton PrismaClient

async function main() {
  const user = await prisma.userProfile.create({
    data: {
      uniqueIdentifier: '12345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      country: 'USA',
      city: 'New York',
      personalNum: '123-456-7890'
    }
  });
  console.log(user);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
