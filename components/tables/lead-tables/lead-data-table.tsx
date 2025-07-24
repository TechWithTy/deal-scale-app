import React, { useState } from 'react';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { ScrollArea, ScrollBar } from '../../ui/scroll-area';
import { MessageCircle, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import ActivitySidebar from '../../reusables/sidebars/activity';
import { mockGeneratedLeads } from '@/constants/data'; // Make sure Lead is the correct type
import { LeadTypeGlobal } from '@/types/_dashboard/leads';

// Status options for the dropdown
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

// Function to get the status color for the dropdown
// const getStatusColor = (status: string) => {
//   const selectedStatus = statusOptions.find(
//     (option) => option.value === status
//   );
//   return selectedStatus
//     ? `${selectedStatus.bgColor} ${selectedStatus.textColor}`
//     : '';
// };

interface DataTableProps {
  columns: ColumnDef<LeadTypeGlobal>[]; // Ensure the columns expect Lead data
  data: LeadTypeGlobal[]; // Ensure data is of type Lead
  searchKey: string;
  pageCount: number; // Total number of pages
  pageSizeOptions?: number[]; // Optional: page size options
}

export function LeadDataTable({
  columns,
  data,
  searchKey,
  pageCount,
  pageSizeOptions = [10, 20, 30, 50]
}: DataTableProps) {
  const [search, setSearch] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<LeadTypeGlobal>(
    mockGeneratedLeads[0]
  ); // Store the selected lead's data

  // State for pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0, // Start from the first page
    pageSize: pageSizeOptions[0] // Default page size
  });

  // Create a table instance with pagination
  const table = useReactTable({
    data: data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), // Limit data by current page and page size
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount,
    manualPagination: true,
    state: { pagination: { pageIndex, pageSize }, globalFilter: search },
    onPaginationChange: setPagination // Update pagination state
  });

  const handleStatusChange = (id: string, newValue: string) => {
    setStatuses((prev) => ({ ...prev, [id]: newValue }));
  };

  // Open the sidebar and set the selected lead's data
  const openSidebar = (lead: LeadTypeGlobal) => {
    setSelectedLead(lead);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border md:h-[calc(80dvh-200px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center" // Center the table headers
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-center align-top" // Center the table content
                    >
                      {/* Status column handling */}
                      {cell.column.id === 'status' ? (
                        <select
                          className="rounded px-2 py-1 text-sm"
                          value={row.original.status}
                          onChange={(e) =>
                            handleStatusChange(
                              row.original.id.toString(),
                              e.target.value
                            )
                          }
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : cell.column.id === 'actions' ? (
                        /* Message column handling */
                        <button
                          className="text-center"
                          onClick={() => openSidebar(row.original)}
                        >
                          <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex items-center justify-between gap-2 py-4">
        <div className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conditionally render the ActivitySidebar with the selected lead */}
      {isSidebarOpen && (
        <ActivitySidebar onClose={closeSidebar} leadData={selectedLead} />
      )}
    </>
  );
}
