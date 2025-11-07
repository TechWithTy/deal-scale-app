import { ControlPanel } from "@/components/reusables/ControlPanel";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { CallCampaign } from "@/types/_dashboard/campaign";
import type { ColumnDef } from "@tanstack/react-table";
import { PlaybackCell } from "external/audio-playback";

// Use Partial because we also have a safe fallback when a status is not mapped
const statusColor: Partial<Record<CallCampaign["status"], string>> = {
	delivering: "bg-green-100 text-green-600",
	completed: "bg-blue-100 text-blue-600",
	failed: "bg-red-100 text-red-600",
	missed: "bg-yellow-100 text-yellow-600",
	delivered: "bg-teal-100 text-teal-600",
	pending: "bg-orange-100 text-orange-600",
	queued: "bg-gray-100 text-gray-600",
	read: "bg-indigo-100 text-indigo-600",
	unread: "bg-purple-100 text-purple-600",
	paused: "bg-gray-100 text-gray-600",
};

// Adjust the column structure to match the table design
export const callCampaignColumns: ColumnDef<CallCampaign>[] = [
	{
		id: "select",
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
		enableHiding: false,
	},
	{
		id: "controls",
		header: "Controls",
		cell: ({ row }) => {
			const status = row.original.status as string | undefined;
			const active =
				status === "queued" || status === "delivering" || status === "pending";
			return active ? <ControlPanel campaignId={row.original.id} /> : null;
		},
	},
	{
		accessorKey: "name",
		header: "Campaign Name",
		cell: ({ row }) => <span className="text-left">{row.original.name}</span>,
	},
	{
		accessorKey: "calls",
		header: "Calls",
		cell: ({ row }) => <span>{row.original.calls}</span>,
	},
	{
		accessorKey: "inQueue",
		header: "In Queue",
		cell: ({ row }) => <span>{row.original.inQueue}</span>,
	},
	{
		accessorKey: "leads",
		header: "Leads",
		cell: ({ row }) => <span>{row.original.leads}</span>,
	},
	{
		accessorKey: "voicemail",
		header: "Voicemail",
		cell: ({ row }) => <span>{row.original.voicemail}</span>,
	},
	{
		accessorKey: "hungUp",
		header: "Hung Up",
		cell: ({ row }) => <span>{row.original.hungUp}</span>,
	},
	{
		accessorKey: "dead",
		header: "Dead",
		cell: ({ row }) => <span>{row.original.dead}</span>,
	},
	{
		accessorKey: "wrongNumber",
		header: "Wrong #",
		cell: ({ row }) => <span>{row.original.wrongNumber}</span>,
	},
	{
		accessorKey: "inactiveNumbers",
		header: "Inactive #",
		cell: ({ row }) => <span>{row.original.inactiveNumbers}</span>,
	},
	{
		id: "countVoicemailAsAnswered",
		header: "VM Counts as Answered",
		cell: ({ row }) => {
			const v = Boolean(row.original.countVoicemailAsAnswered ?? false);
			return (
				<Badge variant={v ? "default" : "outline"}>{v ? "Yes" : "No"}</Badge>
			);
		},
	},
	{
		accessorKey: "dnc",
		header: "DNC",
		cell: ({ row }) => <span>{row.original.dnc}</span>,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const colorClass =
				statusColor[row.original.status] || "bg-gray-100 text-gray-600";
			return (
				<span
					className={`rounded-full px-2 py-1 font-medium text-sm ${colorClass}`}
				>
					{row.original.status}
				</span>
			);
		},
	},
	{
		accessorKey: "startDate",
		header: "Start Date",
		cell: ({ row }) => (
			<span>{new Date(row.original.startDate).toLocaleDateString()}</span>
		),
	},
	{
		accessorKey: "callRecording",
		header: "Playback",
		cell: ({ row }) => {
			if (
				row.original.callInformation &&
				row.original.callInformation.length > 0
			) {
				return <PlaybackCell callInformation={row.original.callInformation} />;
			}
			return "No Calls";
		},
	},
];
