import React from "react";

export const statusColor: Record<
	| "pending"
	| "completed"
	| "failed"
	| "delivered"
	| "delivering"
	| "missed"
	| "queued"
	| "read"
	| "unread",
	string
> = {
	pending: "bg-orange-100 text-orange-600",
	completed: "bg-green-100 text-green-600",
	failed: "bg-red-100 text-red-600",
	delivered: "bg-blue-100 text-blue-600",
	delivering: "bg-yellow-100 text-yellow-600",
	missed: "bg-gray-100 text-gray-600",
	queued: "bg-purple-100 text-purple-600",
	read: "bg-indigo-100 text-indigo-600",
	unread: "bg-teal-100 text-teal-600",
};

type StatusType =
	| "pending"
	| "completed"
	| "failed"
	| "delivered"
	| "delivering"
	| "missed"
	| "queued"
	| "read"
	| "unread";

export const StatusCell = ({ status }: { status: StatusType | string }) => {
	const colorClass =
		statusColor[
			(status as StatusType) in statusColor ? (status as StatusType) : "missed"
		] || "bg-gray-100 text-gray-600";
	return (
		<span
			className={`rounded-full px-2 py-1 font-medium text-sm ${colorClass}`}
		>
			{status}
		</span>
	);
};

export default StatusCell;
