import { PlayButtonSkip } from "@/components/reusables/audio/playButton";
import { Checkbox } from "@/components/ui/checkbox";
import type { CallCampaign, CallInfo } from "@/types/_dashboard/campaign";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

const statusColor: Record<CallCampaign["status"], string> = {
	delivering: "bg-green-100 text-green-600",
	completed: "bg-blue-100 text-blue-600",
	failed: "bg-red-100 text-red-600",
	missed: "bg-yellow-100 text-yellow-600",
	delivered: "bg-teal-100 text-teal-600",
	pending: "bg-orange-100 text-orange-600",
	queued: "bg-gray-100 text-gray-600",
	read: "bg-indigo-100 text-indigo-600",
	unread: "bg-purple-100 text-purple-600",
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

interface PlaybackCellProps {
	callInformation: CallInfo[];
}

export const PlaybackCell = ({ callInformation }: PlaybackCellProps) => {
	const [currentCallIndex, setCurrentCallIndex] = useState(0);

	const handleNextCall = () => {
		if (currentCallIndex < callInformation.length - 1) {
			setCurrentCallIndex(currentCallIndex + 1); // Move to the next call
		}
	};

	const handlePrevCall = () => {
		if (currentCallIndex > 0) {
			setCurrentCallIndex(currentCallIndex - 1); // Move to the previous call
		}
	};

	const currentCall = callInformation[currentCallIndex].callResponse; // Access the current call's response
	const title = currentCall.id;
	const recordingUrl = currentCall.recordingUrl;
	const startedAt = currentCall.startedAt
		? new Date(currentCall.startedAt).getTime() / 1000
		: 0;
	const endedAt = currentCall.endedAt
		? new Date(currentCall.endedAt).getTime() / 1000
		: 0;

	if (recordingUrl) {
		return (
			<PlayButtonSkip
				title={title}
				audioSrc={recordingUrl}
				startTime={startedAt}
				endTime={endedAt}
				onNextCall={handleNextCall}
				onPrevCall={handlePrevCall}
				isNextDisabled={currentCallIndex >= callInformation.length - 1}
				isPrevDisabled={currentCallIndex <= 0}
			/>
		);
	}
	return <span>No Recording</span>;
};
