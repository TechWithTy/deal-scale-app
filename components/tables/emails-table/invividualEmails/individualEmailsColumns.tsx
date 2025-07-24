import { ColumnDef } from '@tanstack/react-table';
import { GetEmailByIdResponse } from '@/types/goHighLevel/email';
import { DownloadIcon } from 'lucide-react';
import React from 'react';

// Helper function to download email content
const downloadEmailContent = (email: GetEmailByIdResponse) => {
  const emailContent = email.body || 'No content available';
  const blob = new Blob([emailContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `email-${email.id}.txt`; // Naming the file with email id
  a.click();
  URL.revokeObjectURL(url); // Clean up the URL
};

// Column definition for displaying emails
export const emailColumns: ColumnDef<GetEmailByIdResponse>[] = [
  {
    accessorKey: 'subject',
    header: 'Subject',
    cell: ({ row }) => row.original.subject || 'No Subject', // Default if no subject
    meta: {
      align: 'text-left'
    }
  },
  {
    accessorKey: 'from',
    header: 'Sender',
    cell: ({ row }) => row.original.from,
    meta: {
      align: 'text-left'
    }
  },
  {
    accessorKey: 'to',
    header: 'Recipients',
    cell: ({ row }) => row.original.to.join(', '), // Join the recipient list into a string
    meta: {
      align: 'text-left'
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => row.original.status,
    meta: {
      align: 'text-center'
    }
  },
  {
    accessorKey: 'dateAdded',
    header: 'Date Added',
    cell: ({ row }) => new Date(row.original.dateAdded).toLocaleString(),
    meta: {
      align: 'text-center'
    }
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => row.original.provider,
    meta: {
      align: 'text-center'
    }
  },
  {
    accessorKey: 'attachments',
    header: 'Attachments',
    cell: ({ row }) =>
      row.original.attachments && row.original.attachments.length > 0
        ? row.original.attachments.map((attachment, index) => (
            <a
              key={index}
              href={attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Attachment {index + 1}
            </a>
          ))
        : 'No Attachments',
    meta: {
      align: 'text-center'
    }
  },
  {
    // Action for downloading the email body content
    accessorKey: 'body',
    header: 'Download Email',
    cell: ({ row }) => (
      <button
        onClick={() => downloadEmailContent(row.original)}
        className="flex items-center space-x-1 text-blue-500 hover:underline"
      >
        <DownloadIcon className="h-4 w-4" />
        <span>Download</span>
      </button>
    ),
    meta: {
      align: 'text-center'
    }
  }
];
