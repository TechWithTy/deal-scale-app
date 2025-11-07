/**
 * SessionsSection: Active sessions and device management
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AlertCircle,
	Globe,
	LogOut,
	MapPin,
	Monitor,
	Smartphone,
	Tablet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Session {
	id: string;
	device: "desktop" | "mobile" | "tablet";
	browser: "chrome" | "firefox" | "safari" | "other";
	os: string;
	location: string;
	ip: string;
	lastActive: string;
	isCurrent: boolean;
}

const SessionsSection: React.FC = () => {
	const [sessions, setSessions] = useState<Session[]>([
		{
			id: "1",
			device: "desktop",
			browser: "chrome",
			os: "Windows 11",
			location: "New York, US",
			ip: "192.168.1.1",
			lastActive: "Active now",
			isCurrent: true,
		},
		{
			id: "2",
			device: "mobile",
			browser: "safari",
			os: "iOS 17",
			location: "San Francisco, US",
			ip: "192.168.1.2",
			lastActive: "2 hours ago",
			isCurrent: false,
		},
		{
			id: "3",
			device: "tablet",
			browser: "chrome",
			os: "Android 14",
			location: "Los Angeles, US",
			ip: "192.168.1.3",
			lastActive: "1 day ago",
			isCurrent: false,
		},
	]);

	const getDeviceIcon = (device: Session["device"]) => {
		switch (device) {
			case "desktop":
				return <Monitor className="h-5 w-5" />;
			case "mobile":
				return <Smartphone className="h-5 w-5" />;
			case "tablet":
				return <Tablet className="h-5 w-5" />;
		}
	};

	const getBrowserIcon = (browser: Session["browser"]) => {
		// Using Globe icon as generic browser icon since brand icons don't exist in lucide-react
		return <Globe className="h-4 w-4" />;
	};

	const revokeSession = (sessionId: string) => {
		setSessions(sessions.filter((s) => s.id !== sessionId));
		toast.success("Session revoked successfully");
	};

	const revokeAllOtherSessions = () => {
		setSessions(sessions.filter((s) => s.isCurrent));
		toast.success("All other sessions have been revoked");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						Active Sessions
					</h3>
					<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
						Manage where you're logged in and revoke access to any suspicious
						sessions
					</p>
				</div>
				{sessions.filter((s) => !s.isCurrent).length > 0 && (
					<Button variant="outline" onClick={revokeAllOtherSessions}>
						<LogOut className="mr-2 h-4 w-4" />
						Revoke All Others
					</Button>
				)}
			</div>

			{/* Warning for multiple sessions */}
			{sessions.length > 2 && (
				<div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
					<div className="flex gap-3">
						<AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
						<div>
							<p className="font-medium text-orange-900 text-sm dark:text-orange-100">
								Multiple active sessions detected
							</p>
							<p className="mt-1 text-orange-800 text-sm dark:text-orange-200">
								Review your active sessions and revoke any you don't recognize
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Sessions List */}
			<div className="space-y-3">
				{sessions.map((session) => (
					<div
						key={session.id}
						className={`rounded-lg border p-4 ${
							session.isCurrent
								? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
								: "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex gap-3">
								{/* Device Icon */}
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-lg ${
										session.isCurrent
											? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
											: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
									}`}
								>
									{getDeviceIcon(session.device)}
								</div>

								{/* Session Info */}
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h4 className="font-semibold text-gray-900 dark:text-white">
											{session.os}
										</h4>
										{session.isCurrent && (
											<Badge variant="default" className="bg-blue-600">
												Current Session
											</Badge>
										)}
									</div>

									{/* Browser & Location */}
									<div className="mt-2 space-y-1 text-gray-600 text-sm dark:text-gray-400">
										<div className="flex items-center gap-2">
											{getBrowserIcon(session.browser)}
											<span className="capitalize">{session.browser}</span>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											<span>{session.location}</span>
										</div>
										<div className="flex items-center gap-2">
											<span>IP: {session.ip}</span>
										</div>
									</div>

									{/* Last Active */}
									<div className="mt-2 text-gray-500 text-xs dark:text-gray-500">
										Last active: {session.lastActive}
									</div>
								</div>
							</div>

							{/* Revoke Button */}
							{!session.isCurrent && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => revokeSession(session.id)}
								>
									<LogOut className="h-4 w-4 text-red-500" />
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Security Tips */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
				<p className="font-medium text-blue-900 text-sm dark:text-blue-100">
					Security Tips:
				</p>
				<ul className="mt-2 list-inside list-disc space-y-1 text-blue-800 text-sm dark:text-blue-200">
					<li>Always log out from public or shared devices</li>
					<li>Revoke sessions from devices you no longer use</li>
					<li>Report any suspicious activity immediately</li>
				</ul>
			</div>
		</div>
	);
};

export default SessionsSection;
