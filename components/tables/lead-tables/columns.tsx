'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MessageCircle } from 'lucide-react';
import { exportLeadsTableDataToExcel } from '@/lib/_utils/files/downloadTableData';
import { LeadTypeGlobal } from '@/types/_dashboard/leads';

// Assuming the Lead type matches the lead/contact structure

export const leadListColumns: ColumnDef<LeadTypeGlobal>[] = [
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
    header: 'Lead',
    cell: ({ row }) => (
      <div>
        <strong>
          {row.original.firstName} {row.original.lastName}
        </strong>
        <div className="text-sm text-muted-foreground">
          {row.original.address1}
        </div>
      </div>
    )
  },

  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => <span>{row.original.phone}</span>
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
    cell: ({ row }: { row: { original: LeadTypeGlobal } }) => {
      const email = row.original.email; // Assume a single email address for simplicity

      return email ? (
        <a href={`mailto:${email}`} className="text-blue-500 hover:underline">
          {email}
        </a>
      ) : (
        <span className="text-gray-500">No Email</span>
      );
    }
  },
  {
    accessorKey: 'socials',
    header: 'Social Media Profiles',
    cell: ({ row }: { row: { original: LeadTypeGlobal } }) => {
      const { socials } = row.original;

      return (
        <div className="flex flex-col space-y-2">
          {socials?.facebook && (
            <a
              href={socials.facebook}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              Facebook
            </a>
          )}
          {socials?.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              LinkedIn
            </a>
          )}
          {socials?.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              Instagram
            </a>
          )}
          {socials?.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              Twitter
            </a>
          )}
          {!socials && (
            <span className="text-gray-500">No Social Profiles</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'summary',
    header: 'Summary',
    cell: ({ row }) => <span>{row.original.summary}</span>
  },
  {
    accessorKey: 'bed',
    header: 'Bed',
    cell: ({ row }) => <span>{row.original.bed}</span>
  },
  {
    accessorKey: 'bath',
    header: 'Bath',
    cell: ({ row }) => <span>{row.original.bath}</span>
  },
  {
    accessorKey: 'sqft',
    header: 'SqFt',
    cell: ({ row }) => <span>{row.original.sqft}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <select
        className={`rounded px-2 py-1 text-sm`}
        value={row.original.status}
        onChange={(e) =>
          handleStatusChange(row.original.id.toString(), e.target.value)
        }
      >
        {statusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            style={{
              backgroundColor: option.bgColor,
              color: option.textColor
            }}
          >
            {option.label}
          </option>
        ))}
      </select>
    )
  },
  {
    accessorKey: 'followUp',
    header: 'Follow Up',
    cell: ({ row }) => (
      <div className="flex items-center">
        <Calendar className="mr-2" />
        {row.original.followUp ? row.original.followUp : 'None'}
      </div>
    )
  },
  {
    accessorKey: 'lastContactDate',
    header: 'Last Contact Date',
    cell: ({ row }) => (
      <div className="flex items-center">
        <Calendar className="mr-2" />
        {row.original.lastUpdate || 'Not Contacted'}
      </div>
    )
  },
  {
    accessorKey: 'actions',
    header: 'Activity',
    cell: ({ row }) => (
      <button
        className="text-center"
        onClick={() => openSidebar(row.original.id.toString())}
      >
        <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>
    )
  },
  {
    accessorKey: 'download',
    header: 'Download',
    cell: ({ row }: { row: { original: LeadTypeGlobal } }) => (
      <button
        className="text-blue-500 hover:underline"
        onClick={() => {
          // Define the columns for the Excel export, including the email and social links
          const columns = [
            { header: 'Lead ID', accessorKey: 'id' },
            { header: 'Name', accessorKey: 'name' },
            { header: 'Phone', accessorKey: 'phone' },
            { header: 'Email', accessorKey: 'email' },
            { header: 'Summary', accessorKey: 'summary' },
            { header: 'Bedrooms', accessorKey: 'bed' },
            { header: 'Bathrooms', accessorKey: 'bath' },
            { header: 'Square Footage', accessorKey: 'sqft' },
            { header: 'Status', accessorKey: 'status' },
            { header: 'Follow Up', accessorKey: 'followUp' },
            { header: 'Last Update', accessorKey: 'lastUpdate' },
            { header: 'Address', accessorKey: 'address1' },
            // Add a single column for social media profiles
            { header: 'Social Media Profiles', accessorKey: 'socials' } // Combined socials
          ];

          // Generate the data array for the Excel export
          const data = [
            {
              id: row.original.id,
              name: `${row.original.firstName} ${row.original.lastName}`,
              phone: row.original.phone,
              email: row.original.email ?? 'No Email',
              summary: row.original.summary,
              bed: row.original.bed,
              bath: row.original.bath,
              sqft: row.original.sqft,
              status: row.original.status,
              followUp: row.original.followUp,
              lastUpdate: row.original.lastUpdate,
              address1: row.original.address1,

              // Combine the social media links into one string
              socials:
                [
                  row.original.socials?.facebook
                    ? `Facebook: ${row.original.socials.facebook}`
                    : '',
                  row.original.socials?.linkedin
                    ? `LinkedIn: ${row.original.socials.linkedin}`
                    : '',
                  row.original.socials?.instagram
                    ? `Instagram: ${row.original.socials.instagram}`
                    : '',
                  row.original.socials?.twitter
                    ? `Twitter: ${row.original.socials.twitter}`
                    : ''
                ]
                  .filter(Boolean) // Remove empty strings
                  .join(', ') || 'No Social Profiles' // Join and fallback if no socials
            }
          ];

          // Debug: Log the data that will be exported
          console.warn('Data to export:', data);

          // Call the export function for Leads with Social Links and Email
          exportLeadsTableDataToExcel(
            'Lead Data', // Sheet name
            columns, // Column definitions
            data, // Data array to be exported
            `${row.original.firstName}-${row.original.lastName}-lead.xlsx` // Filename
          );
        }}
      >
        Download Excel
      </button>
    )
  }
];

// Function to handle status change (can be moved into a component where state is maintained)
const handleStatusChange = (id: string, newValue: string) => {
  // Your logic to handle status change, e.g., updating state or making an API call
  console.warn(`Status changed for Lead ID ${id} to ${newValue}`);
};

// Function to get status color (should match your dark mode colors)
const statusOptions = [
  {
    value: 'new',
    label: 'New Lead',
    bgColor: 'bg-blue-600',
    textColor: 'text-white'
  },
  {
    value: 'contacted',
    label: 'Contacted',
    bgColor: 'bg-yellow-600',
    textColor: 'text-white'
  },
  {
    value: 'closed',
    label: 'Closed',
    bgColor: 'bg-green-600',
    textColor: 'text-white'
  },
  {
    value: 'lost',
    label: 'Lost',
    bgColor: 'bg-red-600',
    textColor: 'text-white'
  }
];

// Sidebar logic
const openSidebar = (leadId: string) => {
  // Logic to open the sidebar for a given lead
  console.warn(`Opening sidebar for Lead ID ${leadId}`);
};
