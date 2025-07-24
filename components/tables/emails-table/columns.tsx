// columns.tsx

import { ColumnDef } from '@tanstack/react-table';
import { EmailCampaign, GetEmailByIdResponse } from '@/types/goHighLevel/email';
import { exportEmailCampaignToExcel } from '@/lib/_utils/files/downloadTableData';
import { Checkbox } from '@/components/ui/checkbox';

// Color statuses for the email campaign
const statusColor: Record<EmailCampaign['status'], string> = {
  pending: 'bg-orange-100 text-orange-600',
  delivered: 'bg-green-100 text-green-600',
  delivering: 'bg-blue-100 text-blue-600',
  completed: 'bg-blue-100 text-blue-600',
  missed: 'bg-gray-100 text-gray-600',
  queued: 'bg-yellow-100 text-yellow-600',
  failed: 'bg-red-100 text-red-600',
  read: 'bg-indigo-100 text-indigo-600',
  unread: 'bg-purple-100 text-purple-600'
};

// Functional component for viewing an individual email via an external link
// const ViewEmailButton = ({ emailId }: { emailId: string }) => {
//   // Assuming that you construct the external email URL using the email ID
//   const externalEmailUrl = `https://emailprovider.com/view/${emailId}`;

//   return (
//     <a
//       href={externalEmailUrl}
//       target="_blank"
//       rel="noreferrer"
//       className="p-2 text-blue-500"
//     >
//       <EyeIcon className="h-5 w-5" />
//     </a>
//   );
// };

// const handleEmailSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
//   const emailUrl = event.target.value;
//   if (emailUrl) {
//     window.open(emailUrl, '_blank', 'noopener,noreferrer'); // Open the email in a new tab
//   }
// };
export const emailCampaignColumns: ColumnDef<EmailCampaign>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'Campaign Name',
    cell: ({ row }) => <span className="text-left">{row.original.name}</span>
  },
  {
    accessorKey: 'senderEmail',
    header: 'Sender Email',
    cell: ({ row }) => <span>{row.original.senderEmail}</span>
  },
  {
    accessorKey: 'recipientCount',
    header: 'Recipients',
    cell: ({ row }) => <span>{row.original.recipientCount}</span>
  },
  {
    accessorKey: 'sentCount',
    header: 'Sent',
    cell: ({ row }) => <span>{row.original.sentCount}</span>
  },
  {
    accessorKey: 'deliveredCount',
    header: 'Delivered',
    cell: ({ row }) => <span>{row.original.deliveredCount}</span>
  },
  {
    accessorKey: 'openedCount',
    header: 'Opened',
    cell: ({ row }) => <span>{row.original.openedCount}</span>
  },
  {
    accessorKey: 'bouncedCount',
    header: 'Bounced',
    cell: ({ row }) => <span>{row.original.bouncedCount}</span>
  },
  {
    accessorKey: 'failedCount',
    header: 'Failed',
    cell: ({ row }) => <span>{row.original.failedCount}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const colorClass =
        statusColor[row.original.status] || 'bg-gray-100 text-gray-600';
      return (
        <span
          className={`rounded-full px-2 py-1 text-sm font-medium ${colorClass}`}
        >
          {row.original.status}
        </span>
      );
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => (
      <span>{new Date(row.original.startDate).toLocaleDateString()}</span>
    )
  },
  {
    accessorKey: 'emails',
    header: 'Download Emails',
    cell: ({ row }) => {
      // Define the columns for exporting emails with correct keyof GetEmailByIdResponse type
      const emailColumns: {
        header: string;
        accessorKey: keyof GetEmailByIdResponse;
      }[] = [
        { header: 'Email ID', accessorKey: 'id' },
        { header: 'Subject', accessorKey: 'subject' },
        { header: 'Body', accessorKey: 'body' },
        { header: 'From', accessorKey: 'from' },
        { header: 'To', accessorKey: 'to' },
        { header: 'CC', accessorKey: 'cc' }, // Optional
        { header: 'BCC', accessorKey: 'bcc' }, // Optional
        { header: 'Status', accessorKey: 'status' },
        { header: 'Attachments', accessorKey: 'attachments' }, // Attachments column
        { header: 'Date Added', accessorKey: 'dateAdded' }
      ];

      // Extract the emails from the campaign
      const emails = row.original.emails as GetEmailByIdResponse[];

      return (
        <div className="flex space-x-2">
          {/* Button to download the emails as an Excel file */}
          <button
            className="p-2 text-blue-500 hover:underline"
            onClick={() => {
              exportEmailCampaignToExcel(
                `Emails_${row.original.name}`, // Sheet name based on campaign name
                emailColumns, // Columns for the Excel export
                emails, // Pass the emails array from the campaign
                `${row.original.name}_emails.xlsx` // Filename for the downloaded file
              );
            }}
          >
            Download Emails
          </button>
        </div>
      );
    }
  }
];
