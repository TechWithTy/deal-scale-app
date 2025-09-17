"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type MarketRow = {
	id: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	beds: number | null;
	baths: number | null;
	price: number | null;
	status: string;
	source: "realtor" | "rentcast";
};

export const marketColumns: ColumnDef<MarketRow, unknown>[] = [
	{
		accessorKey: "address",
		header: "Address",
		cell: ({ row }) => {
			const r = row.original;
			return (
				<div className="flex flex-col">
					<span className="font-medium">{r.address}</span>
					<span className="text-muted-foreground text-xs">
						{r.city}, {r.state} {r.zip}
					</span>
				</div>
			);
		},
	},
	{ accessorKey: "beds", header: "Beds" },
	{ accessorKey: "baths", header: "Baths" },
	{
		accessorKey: "price",
		header: "Price/Rent",
		cell: ({ getValue }) => {
			const v = getValue<number | null>();
			return v != null ? `$${v.toLocaleString()}` : "-";
		},
	},
	{ accessorKey: "status", header: "Status" },
	{ accessorKey: "source", header: "Source" },
];
