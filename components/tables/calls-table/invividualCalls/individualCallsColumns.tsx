import { PlayButtonTimeLine } from "@/components/reusables/audio/timeline/useAudioPlayer";
import type { GetCallResponse } from "@/types/vapiAi/api/calls/get";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react"; // Assuming you use an icon library like Lucide

// Helper function to format duration in MM:SS format
const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

// Updated Columns for GetCallResponse with alignment rules
export const SingleCallResponseColumns: ColumnDef<GetCallResponse>[] = [
	{
		accessorKey: "status",
		header: () => <div className="text-left">Status</div>,
		cell: ({ row }) => row.original.status,
		meta: {
			align: "text-left",
		},
	},
	{
		accessorKey: "createdAt",
		header: () => <div className="text-center">Created At</div>,
		cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
		meta: {
			align: "text-center",
		},
	},
	{
		accessorKey: "updatedAt",
		header: () => <div className="text-center">Updated At</div>,
		cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
		meta: {
			align: "text-center",
		},
	},
	{
		accessorKey: "startedAt",
		header: () => <div className="text-center">Started At</div>,
		cell: ({ row }) =>
			row.original.startedAt
				? new Date(row.original.startedAt).toLocaleString()
				: "N/A",
		meta: {
			align: "text-center",
		},
	},
	{
		accessorKey: "endedAt",
		header: () => <div className="text-center">Ended At</div>,
		cell: ({ row }) =>
			row.original.endedAt
				? new Date(row.original.endedAt).toLocaleString()
				: "N/A",
		meta: {
			align: "text-center",
		},
	},
	{
		accessorKey: "costBreakdown.total",
		header: () => <div className="text-center">Total Cost</div>,
		cell: ({ row }) => `$${row.original.costBreakdown.total.toFixed(2)}`,
		meta: {
			align: "text-center",
		},
	},
	{
		accessorKey: "phoneCallProvider",
		header: () => <div className="text-center">Provider</div>,
		cell: ({ row }) => row.original.phoneCallProvider,
		meta: {
			align: "text-center",
		},
	},
	{
		// New column for "Download Transcript" with a download icon
		accessorKey: "transcript",
		header: () => <div className="text-center">Download Transcript</div>,
		cell: ({ row }) => {
			const transcript = row.original.transcript || "No transcript available";
			const handleDownload = () => {
				const blob = new Blob([transcript], { type: "text/plain" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `transcript-${row.original.id}.txt`; // Naming the file with call id
				a.click();
				URL.revokeObjectURL(url); // Clean up the URL
			};

			return transcript !== "No transcript available" ? (
				<button
					type="button"
					onClick={handleDownload}
					className="flex items-center space-x-1 text-blue-500 hover:underline"
				>
					<DownloadIcon className="h-4 w-4" />
					<span>Download</span>
				</button>
			) : (
				"No Transcript"
			);
		},
		meta: {
			align: "text-center",
		},
	},
	{
		accessorKey: "recordingUrl",
		header: () => <div className="text-center">Playback</div>,
		cell: ({ row }) => {
			const recordingUrl = row.original.recordingUrl;

			const startTimeInSeconds = row.original.startedAt
				? new Date(row.original.startedAt).getTime() / 1000
				: 0;
			const endTimeInSeconds = row.original.endedAt
				? new Date(row.original.endedAt).getTime() / 1000
				: 0;

			const duration = endTimeInSeconds - startTimeInSeconds;

			return recordingUrl ? (
				<div className="flex items-center space-x-2">
					<PlayButtonTimeLine
						audioSrc={recordingUrl}
						startTime={startTimeInSeconds}
						endTime={endTimeInSeconds}
					/>
					<span>{formatDuration(duration)}</span>
				</div>
			) : (
				"No Recording"
			);
		},
		meta: {
			align: "text-center",
		},
	},
];
