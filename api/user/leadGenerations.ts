import prisma from '../../lib/prisma'; // Import the singleton PrismaClient
import checkAndUpdateCredits from './_utilils/checkCredits'; // Adjust the path as needed

// Create a new lead
async function createLead(data: any, creditsToUse: number) {
  // Accept creditsToUse as a parameter
  try {
    // Step 1: Check and update LeadCredits before creating the lead
    await checkAndUpdateCredits(
      data.subscriptionId,
      'LeadCredits',
      creditsToUse // Use the parameter passed
    );

    // Step 2: Create the lead if enough credits are available
    const lead = await prisma.leadTypeGlobal.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        status: data.status, // Ensure this matches a LeadStatus enum value
        companyInfoId: data.companyInfoId,
        summary: data.summary, // Add this field
        bed: data.bed, // Add this field
        bath: data.bath, // Add this field
        sqft: data.sqft, // Add this field
        lastUpdate: new Date(), // Or use data.lastUpdate if provided
        address1: data.address1 // Add this field
        // Include any other fields as necessary
      }
    });

    console.log('Lead created:', lead);
    return lead;
  } catch (error) {
    // Safely handle the error, as it might be related to credits or other issues
    if (error instanceof Error) {
      console.error('Error creating lead:', error.message);
      throw new Error(error.message || 'Failed to create lead');
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred during lead creation');
    }
  }
}

// Read leads
async function getLeads() {
  try {
    const leads = await prisma.leadTypeGlobal.findMany();
    console.log('Leads:', leads);
    return leads;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

// Update a lead
async function updateLead(leadId: string, updateData: any) {
  try {
    const updatedLead = await prisma.leadTypeGlobal.update({
      where: { id: leadId },
      data: updateData
    });
    console.log('Lead updated:', updatedLead);
    return updatedLead;
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

// Delete a lead
async function deleteLead(leadId: string) {
  try {
    const deletedLead = await prisma.leadTypeGlobal.delete({
      where: { id: leadId }
    });
    console.log('Lead deleted:', deletedLead);
    return deletedLead;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// Example usage with subscriptionId for credit checks
createLead(
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    phone: '123-456-7890',
    status: 'New_Lead',
    companyInfoId: 'some-company-id',
    subscriptionId: 'subscription-id-here' // Ensure the subscription ID is passed
  },
  5
) // Specify the number of credits to use here
  .then(() => getLeads())
  .catch((error) => console.error(error))
  .finally(() => prisma.$disconnect());
