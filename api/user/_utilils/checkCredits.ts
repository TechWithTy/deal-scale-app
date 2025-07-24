import prisma from '../../../lib/prisma'; // Adjust the path if necessary

// Utility function to check and update credits
async function checkAndUpdateCredits(
  subscriptionId: string,
  creditType: 'AICredits' | 'LeadCredits' | 'SkipTraceCredits',
  creditsToUse: number
) {
  let creditData: any; // Use `any` temporarily for flexibility in fetching data
  let updateResult: any;

  // Fetch and update credits based on the credit type
  if (creditType === 'AICredits') {
    // Fetch AICredits
    creditData = await prisma.aICredits.findUnique({
      where: { subscriptionId }
    });
    if (!creditData)
      throw new Error(
        `No AI credits found for subscription ID: ${subscriptionId}`
      );

    // Check remaining credits
    if (creditData.allotted - creditData.used < creditsToUse) {
      throw new Error(
        `Not enough AI credits. Available: ${
          creditData.allotted - creditData.used
        }, Required: ${creditsToUse}`
      );
    }

    // Update used credits
    updateResult = await prisma.aICredits.update({
      where: { subscriptionId },
      data: {
        used: {
          increment: creditsToUse
        }
      }
    });
  } else if (creditType === 'LeadCredits') {
    // Fetch LeadCredits
    creditData = await prisma.leadCredits.findUnique({
      where: { subscriptionId }
    });
    if (!creditData)
      throw new Error(
        `No lead credits found for subscription ID: ${subscriptionId}`
      );

    // Check remaining credits
    if (creditData.allotted - creditData.used < creditsToUse) {
      throw new Error(
        `Not enough lead credits. Available: ${
          creditData.allotted - creditData.used
        }, Required: ${creditsToUse}`
      );
    }

    // Update used credits
    updateResult = await prisma.leadCredits.update({
      where: { subscriptionId },
      data: {
        used: {
          increment: creditsToUse
        }
      }
    });
  } else if (creditType === 'SkipTraceCredits') {
    // Fetch SkipTraceCredits
    creditData = await prisma.skipTraceCredits.findUnique({
      where: { subscriptionId }
    });
    if (!creditData)
      throw new Error(
        `No skip trace credits found for subscription ID: ${subscriptionId}`
      );

    // Check remaining credits
    if (creditData.allotted - creditData.used < creditsToUse) {
      throw new Error(
        `Not enough skip trace credits. Available: ${
          creditData.allotted - creditData.used
        }, Required: ${creditsToUse}`
      );
    }

    // Update used credits
    updateResult = await prisma.skipTraceCredits.update({
      where: { subscriptionId },
      data: {
        used: {
          increment: creditsToUse
        }
      }
    });
  } else {
    throw new Error('Invalid credit type');
  }

  // Return updated credit info
  return {
    message: `${creditsToUse} credits used successfully.`,
    remainingCredits: updateResult.allotted - updateResult.used,
    updatedCreditInfo: updateResult
  };
}

export default checkAndUpdateCredits;
