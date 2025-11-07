/**
 * ActivityLogSection: Security activity log and audit trail
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Calendar,
	Download,
	FileText,
	Key,
	LogIn,
	LogOut,
	MapPin,
	Monitor,
	Search,
	Settings,
	Shield,
} from "lucide-react";
import { useState } from "react";

interface ActivityLog {
	id: string;
	type:
		| "login"
		| "logout"
		| "password_change"
		| "2fa_enabled"
		| "2fa_disabled"
		| "api_key_created"
		| "settings_changed";
	description: string;
	timestamp: string;
	ip: string;
	location: string;
	device: string;
	status: "success" | "failed" | "warning";
}

const ActivityLogSection: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<string>("all");

	// Mock activity logs
	const [logs] = useState<ActivityLog[]>([
		{
			id: "1",
			type: "login",
			description: "Successful login from Chrome on Windows",
			timestamp: "2025-11-06 14:30:00",
			ip: "192.168.1.1",
			location: "New York, US",
			device: "Desktop",
			status: "success",
		},
		{
			id: "2",
			type: "password_change",
			description: "Password changed successfully",
			timestamp: "2025-11-05 10:15:00",
			ip: "192.168.1.1",
			location: "New York, US",
			device: "Desktop",
			status: "success",
		},
		{
			id: "3",
			type: "2fa_enabled",
			description: "Two-factor authentication enabled via authenticator app",
			timestamp: "2025-11-04 16:45:00",
			ip: "192.168.1.1",
			location: "New York, US",
			device: "Desktop",
			status: "success",
		},
		{
			id: "4",
			type: "login",
			description: "Failed login attempt - incorrect password",
			timestamp: "2025-11-03 22:30:00",
			ip: "203.0.113.42",
			location: "Unknown",
			device: "Unknown",
			status: "failed",
		},
		{
			id: "5",
			type: "api_key_created",
			description: "New API key created: Production API",
			timestamp: "2025-11-02 09:20:00",
			ip: "192.168.1.1",
			location: "New York, US",
			device: "Desktop",
			status: "success",
		},
		{
			id: "6",
			type: "settings_changed",
			description: "Email notification preferences updated",
			timestamp: "2025-11-01 13:10:00",
			ip: "192.168.1.2",
			location: "San Francisco, US",
			device: "Mobile",
			status: "success",
		},
	]);

	const getActivityIcon = (type: ActivityLog["type"]) => {
		switch (type) {
			case "login":
				return <LogIn className="h-4 w-4" />;
			case "logout":
				return <LogOut className="h-4 w-4" />;
			case "password_change":
				return <Key className="h-4 w-4" />;
			case "2fa_enabled":
			case "2fa_disabled":
				return <Shield className="h-4 w-4" />;
			case "api_key_created":
				return <Key className="h-4 w-4" />;
			case "settings_changed":
				return <Settings className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	const getStatusColor = (status: ActivityLog["status"]) => {
		switch (status) {
			case "success":
				return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
			case "failed":
				return "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30";
			case "warning":
				return "text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30";
		}
	};

	const filteredLogs = logs.filter((log) => {
		const matchesSearch =
			log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
			log.ip.includes(searchQuery);

		const matchesFilter = filterType === "all" || log.type === filterType;

		return matchesSearch && matchesFilter;
	});

	const exportLogs = () => {
		const csvContent = [
			[
				"Timestamp",
				"Type",
				"Description",
				"IP",
				"Location",
				"Device",
				"Status",
			],
			...logs.map((log) => [
				log.timestamp,
				log.type,
				log.description,
				log.ip,
				log.location,
				log.device,
				log.status,
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "security-activity-log.csv";
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						Activity Log
					</h3>
					<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
						View all security-related activities on your account
					</p>
				</div>
				<Button variant="outline" onClick={exportLogs}>
					<Download className="mr-2 h-4 w-4" />
					Export
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-3 sm:flex-row">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
					<Input
						type="text"
						placeholder="Search activity logs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Type Filter */}
				<select
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}
					className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
				>
					<option value="all">All Activities</option>
					<option value="login">Logins</option>
					<option value="logout">Logouts</option>
					<option value="password_change">Password Changes</option>
					<option value="2fa_enabled">2FA Changes</option>
					<option value="api_key_created">API Keys</option>
					<option value="settings_changed">Settings</option>
				</select>
			</div>

			{/* Activity Timeline */}
			<div className="space-y-2">
				{filteredLogs.map((log, index) => (
					<div
						key={log.id}
						className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
					>
						<div className="flex items-start gap-3">
							{/* Icon */}
							<div
								className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${getStatusColor(log.status)}`}
							>
								{getActivityIcon(log.type)}
							</div>

							{/* Content */}
							<div className="flex-1">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<p className="font-medium text-gray-900 text-sm dark:text-white">
											{log.description}
										</p>

										{/* Metadata */}
										<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-600 text-xs dark:text-gray-400">
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<span>{log.timestamp}</span>
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												<span>{log.location}</span>
											</div>
											<div className="flex items-center gap-1">
												<Monitor className="h-3 w-3" />
												<span>{log.device}</span>
											</div>
											<div className="flex items-center gap-1">
												<span className="font-mono">{log.ip}</span>
											</div>
										</div>
									</div>

									{/* Status Badge */}
									<Badge
										variant={
											log.status === "success" ? "default" : "destructive"
										}
									>
										{log.status}
									</Badge>
								</div>
							</div>
						</div>
					</div>
				))}

				{filteredLogs.length === 0 && (
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
						<FileText className="mx-auto h-12 w-12 text-gray-400" />
						<p className="mt-2 font-medium text-gray-600 text-sm dark:text-gray-400">
							No activity logs found
						</p>
						<p className="mt-1 text-gray-500 text-xs dark:text-gray-500">
							Try adjusting your search or filter criteria
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ActivityLogSection;
