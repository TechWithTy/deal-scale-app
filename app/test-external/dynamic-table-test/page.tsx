"use client";

import * as React from "react";
import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getFacetedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { DataTable } from "../../../external/shadcn-table/src/components/data-table/data-table";
import { DataTableToolbar } from "../../../external/shadcn-table/src/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "../../../external/shadcn-table/src/components/data-table/data-table-column-header";

// Demo data type
type DemoRow = {
	id: string;
	list: string;
	uploadDate: string; // ISO string for demo simplicity
	records: number;
	phone: number;
	emails: number;
	socials: number;
};

// Demo columns
const columns: ColumnDef<DemoRow>[] = [
	{
		accessorKey: "list",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="List" />
		),
		meta: { label: "List", variant: "text", placeholder: "Search list" },
	},
	{
		accessorKey: "uploadDate",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Upload Date" />
		),
		cell: ({ getValue }) => {
			const d = new Date(String(getValue()));
			return (
				<span className="tabular-nums">
					{isNaN(d.getTime()) ? "-" : d.toLocaleDateString()}
				</span>
			);
		},
		meta: { label: "Upload Date", variant: "date" },
	},
	{
		accessorKey: "records",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Records" />
		),
		sortingFn: "alphanumeric",
		cell: ({ getValue }) => (
			<span className="tabular-nums">{String(getValue())}</span>
		),
		meta: { label: "Records", variant: "range" },
	},
	{
		accessorKey: "phone",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Phone" />
		),
		cell: ({ getValue }) => (
			<span className="tabular-nums">{String(getValue())}</span>
		),
		meta: { label: "Phone", variant: "range" },
	},
	{
		accessorKey: "emails",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Emails" />
		),
		cell: ({ getValue }) => (
			<span className="tabular-nums">{String(getValue())}</span>
		),
		meta: { label: "Emails", variant: "range" },
	},
	{
		accessorKey: "socials",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Socials" />
		),
		cell: ({ getValue }) => (
			<span className="tabular-nums">{String(getValue())}</span>
		),
		meta: { label: "Socials", variant: "range" },
	},
];

function makeDemoData(count = 123): DemoRow[] {
	const lists = [
		"Austin Leads",
		"Dallas Buyers",
		"Houston Sellers",
		"Email Outreach",
		"Phone Sweep",
	];
	const rows: DemoRow[] = [];
	for (let i = 0; i < count; i++) {
		const list = lists[i % lists.length];
		rows.push({
			id: `${i + 1}`,
			list,
			uploadDate: new Date(Date.now() - i * 86_400_000).toISOString(),
			records: Math.floor(Math.random() * 5000) + 100,
			phone: Math.floor(Math.random() * 2000),
			emails: Math.floor(Math.random() * 1500),
			socials: Math.floor(Math.random() * 800),
		});
	}
	return rows;
}

export default function TestExternalPage() {
	const [data, setData] = React.useState<DemoRow[]>([]);
	const [query, setQuery] = React.useState("");

	React.useEffect(() => {
		// Generate data on the client to avoid SSR/CSR mismatch
		setData(makeDemoData(200));
	}, []);

	// Lightweight client-side search filtering for demo
	const filtered = React.useMemo(() => {
		if (!query.trim()) return data;
		const q = query.toLowerCase();
		return data.filter((r) =>
			[r.list, r.records, r.phone, r.emails, r.socials]
				.map((v) => String(v).toLowerCase())
				.some((s) => s.includes(q)),
		);
	}, [data, query]);

	const table = useReactTable({
		data: filtered,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 8 },
		},
	});

	return (
		<main className="container mx-auto max-w-7xl p-6 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					External Table Demo
				</h1>
				<p className="text-sm text-muted-foreground">
					Sorting, global search, and pagination using TanStack Table.
				</p>
			</header>

			<DataTable<DemoRow> table={table} className="mt-2">
				<DataTableToolbar table={table}>
					<input
						aria-label="Global search"
						placeholder="Search all visible fields..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="h-8 w-64 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</DataTableToolbar>
			</DataTable>
		</main>
	);
}
