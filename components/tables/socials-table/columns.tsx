import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { SocialAction, SocialMediaCampaign } from '@/types/_dashboard/campaign';
import { exportSocialTableDataToExcel } from '@/lib/_utils/files/downloadTableData';
import { Checkbox } from '@/components/ui/checkbox';

// Color statuses for the social media campaign
// Color statuses for the social media campaign
const statusColor: Record<
  | 'pending'
  | 'completed'
  | 'failed'
  | 'delivered'
  | 'delivering'
  | 'missed'
  | 'queued'
  | 'read'
  | 'unread',
  string
> = {
  pending: 'bg-orange-100 text-orange-600',
  completed: 'bg-green-100 text-green-600',
  failed: 'bg-red-100 text-red-600',
  delivered: 'bg-blue-100 text-blue-600',
  delivering: 'bg-yellow-100 text-yellow-600',
  missed: 'bg-gray-100 text-gray-600',
  queued: 'bg-purple-100 text-purple-600',
  read: 'bg-indigo-100 text-indigo-600',
  unread: 'bg-teal-100 text-teal-600'
};

// Define your types for row.original
interface RowOriginal {
  name: string;
  platform: string;
  senderHandle: string;
  startDate: string;
  endDate: string;
  status: string;
  actions: SocialAction[] | Record<string, SocialAction>; // Can be either an array or object
}

// Ensure the type string is cast properly for SocialAction
export function assertActionType(actionType: string): SocialAction['type'] {
  // A map to check valid action types for SocialAction
  const actionTypeMap: { [key: string]: SocialAction['type'] } = {
    Like: 'Like',
    Follow: 'Follow',
    Retweet: 'Retweet',
    '📩 Followers': '📩 Followers',
    Connect: 'Connect',
    'Connect & Follow Up': 'Connect & Follow Up',
    Message: 'Message',
    'Invite to Follow': 'Invite to Follow',
    Comment: 'Comment',
    '📩 Connections': '📩 Connections',
    '📩 Groups': '📩 Groups',
    '👁️ Story': '👁️ Story'
  };

  // Cast actionType to the correct SocialAction['type'] if it exists in the map
  if (actionTypeMap[actionType]) {
    return actionTypeMap[actionType];
  }

  throw new Error(`Invalid action type: ${actionType}`);
}
// Component for rendering actions in a dropdown per platform
export const PlatformActionsDropdown = ({
  actions
}: {
  actions: SocialMediaCampaign['actions'];
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Extract available platforms from the actions
  const platforms = Array.from(
    new Set(
      actions.map((action) => {
        if (action.type.includes('📩')) return 'LinkedIn';
        if (['Like', 'Follow', 'Retweet'].includes(action.type))
          return 'Twitter';
        return 'Instagram';
      })
    )
  );

  // Get actions for the selected platform
  const filteredActions = selectedPlatform
    ? actions.filter((action) => {
        if (selectedPlatform === 'LinkedIn') return action.type.includes('📩');
        if (selectedPlatform === 'Twitter')
          return ['Like', 'Follow', 'Retweet'].includes(action.type);
        return ['Like', 'Follow', 'Comment', '👁️ Story'].includes(action.type);
      })
    : [];

  return (
    <div className="relative">
      <select
        className="max-w-[150px] rounded-md border p-2" // Dropdown for selecting platform
        onChange={(e) => setSelectedPlatform(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Select Platform
        </option>
        {platforms.map((platform, index) => (
          <option key={index} value={platform}>
            {platform}
          </option>
        ))}
      </select>

      {/* Display actions for the selected platform */}
      {selectedPlatform && (
        <ul className="mt-2 space-y-1">
          {filteredActions.map((action, index) => (
            <li key={index} className="flex justify-between">
              <div>
                {/* Action type with interaction counts */}
                <span>{action.type}</span>
                <span className="ml-2 text-sm text-gray-600">
                  (Attempts: {action.attempt}, Successes: {action.successful},
                  Failures: {action.failed})
                </span>
              </div>
              <a
                href={action.viewLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Columns for the social media campaign table
export const socialMediaCampaignColumns: ColumnDef<SocialMediaCampaign>[] = [
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
    accessorKey: 'platform',
    header: 'Platform',
    cell: ({ row }) => {
      const uniquePlatforms = Array.from(
        new Set(
          row.original.actions.map((action) => {
            if (action.type.includes('📩')) return 'LinkedIn';
            if (['Like', 'Follow', 'Retweet'].includes(action.type))
              return 'Twitter';
            return 'Instagram';
          })
        )
      );
      return <span>{uniquePlatforms.join(', ')}</span>; // List all platforms
    }
  },
  {
    accessorKey: 'senderHandle',
    header: 'Sender Handle',
    cell: ({ row }) => <span>{row.original.senderHandle}</span>
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => (
      <span>{new Date(row.original.startDate).toLocaleDateString()}</span>
    )
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => (
      <span>{new Date(row.original.endDate).toLocaleDateString()}</span>
    )
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
    accessorKey: 'download',
    header: 'Download',
    cell: ({ row }: { row: { original: RowOriginal } }) => (
      <button
        className="text-blue-500 hover:underline"
        onClick={() => {
          // Define the columns for the Excel export
          const columns = [
            { header: 'Campaign Name', accessorKey: 'name' },
            { header: 'Platform', accessorKey: 'platform' },
            { header: 'Sender Handle', accessorKey: 'senderHandle' },
            { header: 'Start Date', accessorKey: 'startDate' },
            { header: 'End Date', accessorKey: 'endDate' },
            { header: 'Status', accessorKey: 'status' },
            { header: 'Actions', accessorKey: 'actions' }
          ];

          // Extract platforms from the actions (similar to PlatformActionsDropdown)
          const platforms = Array.from(
            new Set(
              (row.original.actions as SocialAction[]).map(
                (action: SocialAction) => {
                  if (action.type.includes('📩')) return 'LinkedIn';
                  if (['Like', 'Follow', 'Retweet'].includes(action.type))
                    return 'Twitter';
                  return 'Instagram'; // Default to Instagram
                }
              )
            )
          );

          // Debug: Log available platforms
          console.warn('Available Platforms:', platforms);

          // Function to filter actions by platform
          const filterActionsByPlatform = (platform: string) => {
            const actionsArray = row.original.actions as SocialAction[]; // Ensure actions is treated as an array

            return actionsArray.filter((action: SocialAction) => {
              if (platform === 'LinkedIn') return action.type.includes('📩');
              if (platform === 'Twitter')
                return ['Like', 'Follow', 'Retweet'].includes(action.type);
              return ['Like', 'Follow', 'Comment', '👁️ Story'].includes(
                action.type
              ); // Default for Instagram
            });
          };

          // Generate data array by looping over platforms and actions
          const data = platforms.flatMap((platform: string) =>
            filterActionsByPlatform(platform).map((action: SocialAction) => ({
              name: row.original.name,
              platform, // Set the platform
              senderHandle: row.original.senderHandle,
              startDate: row.original.startDate,
              endDate: row.original.endDate,
              status: row.original.status,
              actions: `${action.type} (Attempts: ${action.attempt}, Successes: ${action.successful}, Failures: ${action.failed}, Status: ${action.status}, View: ${action.viewLink})`
            }))
          );

          // Debug: Log the data that will be exported
          console.warn('Data to export:', data);

          // Call the export function (ensure it's defined elsewhere in your code)
          exportSocialTableDataToExcel(
            'Campaign Data', // Sheet name
            'social', // Campaign type
            columns, // Column definitions
            data, // Data array to be exported
            `${row.original.name}-campaign.xlsx` // Filename
          );
        }}
      >
        Download Excel
      </button>
    )
  }
];
