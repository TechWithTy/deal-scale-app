import prisma from '../../lib/prisma'; // Adjust the path as needed
import axios from 'axios';
import checkAndUpdateCredits from './_utilils/checkCredits';

// Perform Skip Trace and save results
async function performSkipTrace(
  leadId: string,
  subscriptionId: string,
  creditsToUse: number = 1
) {
  try {
    // Step 1: Check if the user has enough SkipTraceCredits
    await checkAndUpdateCredits(
      subscriptionId,
      'SkipTraceCredits',
      creditsToUse
    );

    // Step 2: Find the lead associated with the skip trace
    const lead = await prisma.leadTypeGlobal.findUnique({
      where: { id: leadId },
      include: {
        companyInfo: {
          include: {
            userProfile: {
              include: {
                subscription: true
              }
            }
          }
        }
      }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Step 3: Perform skip trace using an external API
    const response = await axios.post('https://api.example.com/skip-trace', {
      phone: lead.phone
    });

    const skipTraceData = response.data;

    // Step 4: Log the result and return the skip trace data
    console.log('Skip trace data:', skipTraceData);
    return skipTraceData;
  } catch (error) {
    console.error('Error performing skip trace:', error);
    throw error;
  }
}

// Call the skip trace function (example usage)
performSkipTrace('some-lead-id', 'subscription-id-here', 1) // Deduct 1 credit for the skip trace
  .catch((error) => console.error(error))
  .finally(() => prisma.$disconnect());
