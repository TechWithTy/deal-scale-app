'use client';

import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  pageCount: number;
  pageSizeOptions?: number[];
}

export function SocialMediaCampaignTable<TData, TValue>({
  columns,
  data,
  searchKey,
  pageCount,
  pageSizeOptions = [10, 20, 30, 50]
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page') ?? '1';
  const per_page = searchParams?.get('limit') ?? '10';
  const [search, setSearch] = useState('');

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: Number(page) - 1,
      pageSize: Number(per_page)
    });

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        limit: pageSize
      })}`,
      {
        scroll: false
      }
    );
    console.warn('Social Media Campaign Data', data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, router, pathname, createQueryString]);

  const table = useReactTable({
    data: data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), // Limit data by current page and page size
    columns,
    pageCount,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: { pageIndex, pageSize },
      globalFilter: search // This will be used to filter based on search
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });
  return (
    <>
      <Input
        placeholder={`Search ${searchKey}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm"
      />

      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={index === 0 ? 'text-left' : 'text-center'} // Apply left-align for the first header, center for the rest
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={index === 0 ? 'text-left' : ''}
                    >
                      <span className="text-left">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </span>
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
      </div>

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
    </>
  );
}
