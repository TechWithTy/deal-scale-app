import {
  CallCampaign,
  CallInfo,
  SocialAction,
  SocialMediaCampaign
} from '@/types/_dashboard/campaign';
import { LeadList } from '@/types/_dashboard/leadList';
import { LeadTypeGlobal } from '@/types/_dashboard/leads';
import { GetEmailByIdResponse } from '@/types/goHighLevel/email';
import { TextMessage } from '@/types/goHighLevel/text';
import { GetCallResponse } from '@/types/vapiAi/api/calls/get';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';

export async function exportEmailCampaignBulkToExcel(
  sheetName: string,
  columns: {
    header: string;
    accessorKey: keyof GetEmailByIdResponse;
  }[],
  emails: GetEmailByIdResponse[], // Now this accepts an array of GetEmailByIdResponse
  filename: string
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.accessorKey as string,
    width: 30
  }));

  // Iterate over the emails array and add each email as a row
  emails.forEach((email) => {
    const rowData = columns.reduce(
      (rowObj, col) => {
        rowObj[col.accessorKey as string] = email[col.accessorKey] || '';
        return rowObj;
      },
      {} as Record<string, any>
    );

    worksheet.addRow(rowData); // Add each email as a row in the sheet
  });

  // Return Uint8Array instead of Buffer
  return workbook.xlsx.writeBuffer() as Promise<Uint8Array>;
}

// Export campaign messages to Excel
export async function exportCampaignMessagesBulkToExcel(
  sheetName: string,
  columns: { header: string; accessorKey: keyof TextMessage }[],
  messages: TextMessage[],
  filename: string
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.accessorKey as string,
    width: 30
  }));

  messages.forEach((message) => {
    const rowData = columns.reduce(
      (rowObj, col) => {
        rowObj[col.accessorKey as string] = message[col.accessorKey] || '';
        return rowObj;
      },
      {} as Record<string, any>
    );

    worksheet.addRow(rowData);
  });

  // Return Uint8Array
  return workbook.xlsx.writeBuffer() as Promise<Uint8Array>;
}

// Export social campaign data to Excel

export async function exportSocialTableBulkToExcel(
  sheetName: string,
  campaignType: 'text' | 'email' | 'social' | 'call',
  columns: { header: string; accessorKey: string }[],
  data: SocialMediaCampaign[],
  filename: string
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add column headers
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.accessorKey
  }));

  // Process each campaign and create a separate row for each action
  data.forEach((campaign) => {
    campaign.actions.forEach((action: SocialAction) => {
      // Create a row for each action in the campaign
      const rowData = columns.reduce(
        (acc, col) => {
          if (col.accessorKey === 'actions') {
            // Handle the actions column (only the current action for this row)
            acc[col.accessorKey] = `${action.type} (Attempts: ${
              action.attempt
            }, Successes: ${action.successful}, Failures: ${
              action.failed
            }, Status: ${action.status}, View: ${action.viewLink || 'N/A'})`;
          } else if (campaign[col.accessorKey as keyof SocialMediaCampaign]) {
            // Handle all other columns by pulling from the campaign object
            acc[col.accessorKey] =
              campaign[col.accessorKey as keyof SocialMediaCampaign] || '';
          }
          return acc;
        },
        {} as Record<string, any>
      );

      worksheet.addRow(rowData); // Add a new row for the current action
    });
  });

  // Auto-resize columns based on content
  worksheet.columns.forEach((column) => {
    if (column.values) {
      column.width = Math.max(
        ...column.values
          .filter((val) => val !== undefined && val !== null)
          .map((val) => val!.toString().length)
      );
    }
  });

  // Return Uint8Array for zip creation
  return workbook.xlsx.writeBuffer() as Promise<Uint8Array>;
}

export async function exportCallCampaignsToExcel(
  sheetName: string,
  campaignType: 'text' | 'email' | 'social' | 'call', // The campaign type
  columns: { header: string; accessorKey: string }[], // Columns for Excel export
  data: CallCampaign[], // Call campaign data
  filename: string // The output file name
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const campaignName =
    data.length > 0 ? data[0].name.replace(/\s+/g, '_') : 'Unnamed_Campaign';

  // Get today's date in dd/mm/yyyy format
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const yyyy = today.getFullYear();
  const formattedDate = `${dd}_${mm}_${yyyy}`; // Use underscores for filename compatibility

  // Modify the worksheet name to include the campaign name
  const worksheet = workbook.addWorksheet(
    `${sheetName}_${campaignName}_${formattedDate}`
  );

  // Add column headers
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.accessorKey
  }));

  // Process each call campaign and create rows for each call response
  // Process each call campaign and create rows for each call response
  data.forEach((campaign) => {
    campaign.callInformation.forEach(({ callResponse }: CallInfo) => {
      const rowData = columns.reduce(
        (acc, col) => {
          if (col.accessorKey === 'status') {
            acc[col.accessorKey] = campaign.status || 'No Status';
          } else if (col.accessorKey === 'createdAt') {
            acc[col.accessorKey] = new Date(
              callResponse.createdAt
            ).toLocaleString();
          } else if (col.accessorKey === 'updatedAt') {
            acc[col.accessorKey] = new Date(
              callResponse.updatedAt
            ).toLocaleString();
          } else if (col.accessorKey === 'startedAt') {
            acc[col.accessorKey] = callResponse.startedAt
              ? new Date(callResponse.startedAt).toLocaleString()
              : 'N/A';
          } else if (col.accessorKey === 'endedAt') {
            acc[col.accessorKey] = callResponse.endedAt
              ? new Date(callResponse.endedAt).toLocaleString()
              : 'N/A';
          } else if (col.accessorKey === 'costBreakdown.total') {
            acc[col.accessorKey] = `$${callResponse.costBreakdown.total.toFixed(
              2
            )}`;
          } else if (col.accessorKey === 'phoneCallProvider') {
            acc[col.accessorKey] = callResponse.phoneCallProvider;
          } else if (col.accessorKey === 'transcript') {
            acc[col.accessorKey] = callResponse.transcript || 'No Transcript';
          } else if (col.accessorKey === 'recordingUrl') {
            acc[col.accessorKey] = callResponse.recordingUrl || 'No Recording';
          } else {
            acc[col.accessorKey] =
              campaign[col.accessorKey as keyof CallCampaign] || '';
          }
          return acc;
        },
        {} as Record<string, any>
      );

      worksheet.addRow(rowData);
    });
  });

  // Auto-resize columns based on content
  worksheet.columns.forEach((column) => {
    if (column.values) {
      column.width = Math.max(
        ...column.values
          .filter((val) => val !== undefined && val !== null)
          .map((val) => val!.toString().length)
      );
    }
  });

  // Create and return the Excel buffer for download
  return workbook.xlsx.writeBuffer() as Promise<Uint8Array>;
}

// export async function exportLeadsBulkToZip(
//   leads: LeadTypeGlobal[], // Now correctly typed
//   columns: { header: string; accessorKey: keyof LeadTypeGlobal }[],
//   zipFilename: string
// ): Promise<Uint8Array> {
//   const zip = new JSZip(); // Initialize JSZip instance

//   for (const lead of leads) {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet(
//       `${lead.firstName}_${lead.lastName}_Lead`
//     );

//     worksheet.columns = columns.map((col) => ({
//       header: col.header,
//       key: col.accessorKey as string,
//       width: 30
//     }));

//     // Map the lead data, including manually handling nested socials
//     const rowData = {
//       id: lead.id,
//       firstName: lead.firstName,
//       lastName: lead.lastName,
//       phone: lead.phone,
//       email: lead.email,
//       status: lead.status,
//       followUp: lead.followUp,
//       campaignID: lead.campaignID,
//       address1: lead.address1,
//       facebook: lead.socials?.facebook || 'N/A',
//       linkedin: lead.socials?.linkedin || 'N/A',
//       instagram: lead.socials?.instagram || 'N/A',
//       twitter: lead.socials?.twitter || 'N/A'
//     };

//     worksheet.addRow(rowData); // Add the lead's data as a row

//     const excelBuffer = await workbook.xlsx.writeBuffer();
//     zip.file(`${lead.firstName}_${lead.lastName}_Lead.xlsx`, excelBuffer); // Add file to ZIP
//   }

//   return zip.generateAsync({ type: 'uint8array' }); // Return the ZIP as a Uint8Array
// }

export async function exportLeadsToExcel(
  leads: LeadTypeGlobal[], // Array of leads to be exported
  columns: { header: string; accessorKey: keyof LeadTypeGlobal | string }[], // Column definitions
  filename: string // The desired filename for the Excel file
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Leads'); // Create a single worksheet named "Leads"

  // Define the columns for the worksheet, no need to check for `keyof LeadTypeGlobal` here
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.accessorKey, // This will map the data keys from the rowData
    width: 30 // Optional: Set a default width for all columns
  }));

  // Add each lead as a row to the worksheet
  leads.forEach((lead) => {
    const rowData = {
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      email: lead.email,
      status: lead.status,
      followUp: lead.followUp,
      campaignID: lead.campaignID,
      address1: lead.address1,
      // Combine social media profiles into one field
      socials:
        [
          lead.socials?.facebook ? `Facebook: ${lead.socials.facebook}` : '',
          lead.socials?.linkedin ? `LinkedIn: ${lead.socials.linkedin}` : '',
          lead.socials?.instagram ? `Instagram: ${lead.socials.instagram}` : '',
          lead.socials?.twitter ? `Twitter: ${lead.socials.twitter}` : ''
        ]
          .filter(Boolean) // Remove any empty strings
          .join(', ') || 'No Social Profiles' // Fallback if no profiles exist
    };

    worksheet.addRow(rowData); // Add the lead's data as a row
  });

  // Generate the Excel file buffer and cast to Uint8Array
  const buffer = await workbook.xlsx.writeBuffer();
  const uint8Array = new Uint8Array(buffer); // Ensure it's converted to Uint8Array

  return uint8Array; // Return the Uint8Array for further processing (e.g., download)
}

// Utility function to export LeadLists to Excel with their associated leads
export async function exportLeadListsToExcel(
  leadLists: LeadList[], // Array of LeadList objects to export
  filename: string = 'lead_lists.xlsx' // Filename for the Excel file
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();

  leadLists.forEach((leadList) => {
    // Create a new worksheet for each LeadList, named after the list name
    const worksheet = workbook.addWorksheet(
      leadList.listName || `LeadList ${leadList.id}`
    );

    // Define the columns for each worksheet
    worksheet.columns = [
      { header: 'Lead ID', key: 'id', width: 10 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Summary', key: 'summary', width: 30 },
      { header: 'Bedrooms', key: 'bed', width: 10 },
      { header: 'Bathrooms', key: 'bath', width: 10 },
      { header: 'Square Footage', key: 'sqft', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Follow Up', key: 'followUp', width: 20 },
      { header: 'Last Update', key: 'lastUpdate', width: 20 },
      { header: 'Address', key: 'address1', width: 30 },
      { header: 'Campaign ID', key: 'campaignID', width: 20 },
      { header: 'Facebook', key: 'facebook', width: 20 },
      { header: 'LinkedIn', key: 'linkedin', width: 20 },
      { header: 'Instagram', key: 'instagram', width: 20 },
      { header: 'Twitter', key: 'twitter', width: 20 }
    ];

    // Add the list metadata (like listName, uploadDate, and total counts) as headers
    worksheet.addRow([]);
    worksheet.addRow(['List Name', leadList.listName]);
    worksheet.addRow(['Upload Date', leadList.uploadDate]);
    worksheet.addRow(['Total Records', leadList.records]);
    worksheet.addRow(['Phone Count', leadList.phone]);
    worksheet.addRow(['Email Count', leadList.emails]);
    worksheet.addRow([]);
    worksheet.addRow(['Leads Data']);
    worksheet.addRow([]);

    // Add leads to the worksheet with full lead data
    leadList.leads.forEach((lead: LeadTypeGlobal) => {
      worksheet.addRow({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        summary: lead.summary,
        bed: lead.bed,
        bath: lead.bath,
        sqft: lead.sqft,
        status: lead.status,
        followUp: lead.followUp,
        lastUpdate: lead.lastUpdate,
        address1: lead.address1,
        campaignID: lead.campaignID,
        facebook: lead.socials?.facebook || 'N/A', // Handle optional socials
        linkedin: lead.socials?.linkedin || 'N/A',
        instagram: lead.socials?.instagram || 'N/A',
        twitter: lead.socials?.twitter || 'N/A'
      });
    });
  });

  // Write the workbook to a buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer); // Return the file as Uint8Array
}

export async function exportLeadListsToZip(
  leadLists: LeadList[], // Array of LeadList objects
  zipFilename: string = 'lead_lists_export.zip' // Filename for the resulting ZIP file
): Promise<Uint8Array> {
  const zip = new JSZip(); // Initialize JSZip instance

  // Iterate through each lead list
  for (const leadList of leadLists) {
    const workbook = new ExcelJS.Workbook(); // Create a new Excel workbook for each lead list
    const worksheet = workbook.addWorksheet(
      leadList.listName || `LeadList_${leadList.id}`
    ); // Create a worksheet named after the lead list

    // Define the columns for the worksheet
    worksheet.columns = [
      { header: 'Lead ID', key: 'id', width: 10 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Summary', key: 'summary', width: 30 },
      { header: 'Bedrooms', key: 'bed', width: 10 },
      { header: 'Bathrooms', key: 'bath', width: 10 },
      { header: 'Square Footage', key: 'sqft', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Follow Up', key: 'followUp', width: 20 },
      { header: 'Last Update', key: 'lastUpdate', width: 20 },
      { header: 'Address', key: 'address1', width: 30 },
      { header: 'Campaign ID', key: 'campaignID', width: 20 },
      { header: 'Facebook', key: 'facebook', width: 20 },
      { header: 'LinkedIn', key: 'linkedin', width: 20 },
      { header: 'Instagram', key: 'instagram', width: 20 },
      { header: 'Twitter', key: 'twitter', width: 20 }
    ];

    // Add the list metadata (listName, uploadDate, total counts) as headers
    worksheet.addRow([]); // Blank row for spacing
    worksheet.addRow(['List Name', leadList.listName]);
    worksheet.addRow(['Upload Date', leadList.uploadDate]);
    worksheet.addRow(['Total Records', leadList.records]);
    worksheet.addRow(['Phone Count', leadList.phone]);
    worksheet.addRow(['Email Count', leadList.emails]);
    worksheet.addRow([]);
    worksheet.addRow(['Leads Data']);
    worksheet.addRow([]);

    // Add each lead in the lead list as a row in the worksheet
    leadList.leads.forEach((lead: LeadTypeGlobal) => {
      worksheet.addRow({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        summary: lead.summary,
        bed: lead.bed,
        bath: lead.bath,
        sqft: lead.sqft,
        status: lead.status,
        followUp: lead.followUp,
        lastUpdate: lead.lastUpdate,
        address1: lead.address1,
        campaignID: lead.campaignID,
        facebook: lead.socials?.facebook || 'N/A',
        linkedin: lead.socials?.linkedin || 'N/A',
        instagram: lead.socials?.instagram || 'N/A',
        twitter: lead.socials?.twitter || 'N/A'
      });
    });

    // Write the Excel file to a buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    // Add the Excel file to the ZIP archive
    zip.file(
      `${leadList.listName || `LeadList_${leadList.id}`}.xlsx`,
      excelBuffer
    );
  }

  // Generate and return the ZIP file as a Uint8Array
  return zip.generateAsync({ type: 'uint8array' });
}
