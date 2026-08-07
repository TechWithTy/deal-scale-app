"use client";

import { Switch } from "@/components/ui/switch";
import {
	listNotificationPreferences,
	updateNotificationPreferences,
} from "@/lib/api/public-api-notifications";
import {
	type NotificationPreferenceRow,
	normalizeNotificationPreferences,
	preferenceUpdate,
} from "@/lib/notifications/public-api-preferences";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CHANNELS = [
	{ key: "in_app_enabled", label: "In-app" },
	{ key: "email_enabled", label: "Email" },
	{ key: "sms_enabled", label: "SMS" },
] as const;

function label(category: string) {
	return category
		.replaceAll("_", " ")
		.replace(/^./, (value) => value.toUpperCase());
}

export function PublicApiNotificationPreferencesPanel() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const [preferences, setPreferences] = useState<NotificationPreferenceRow[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [pending, setPending] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		if (!token) {
			setLoading(false);
			return;
		}
		void listNotificationPreferences(token)
			.then(
				(payload) =>
					active && setPreferences(normalizeNotificationPreferences(payload)),
			)
			.catch((caught) => {
				if (active)
					setError(
						caught instanceof Error
							? caught.message
							: "Unable to load preferences.",
					);
			})
			.finally(() => active && setLoading(false));
		return () => {
			active = false;
		};
	}, [token]);

	async function toggle(
		row: NotificationPreferenceRow,
		channel: (typeof CHANNELS)[number]["key"],
	) {
		if (!token || pending) return;
		setPending(`${row.category}:${channel}`);
		setError(null);
		try {
			const payload = await updateNotificationPreferences(
				[preferenceUpdate(row, channel, !row[channel])],
				token,
			);
			setPreferences(normalizeNotificationPreferences(payload));
		} catch (caught) {
			const message =
				caught instanceof Error
					? caught.message
					: "Unable to save preferences.";
			setError(message);
			toast.error(message);
		} finally {
			setPending(null);
		}
	}

	if (loading)
		return (
			<div className="flex min-h-24 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin" />
			</div>
		);
	if (!token)
		return (
			<p className="text-muted-foreground text-sm">
				Sign in to manage notification delivery.
			</p>
		);
	if (error && !preferences.length)
		return (
			<p className="border border-destructive/30 p-3 text-destructive text-sm">
				{error}
			</p>
		);

	return (
		<section className="space-y-4 border p-4">
			<div>
				<h2 className="font-semibold text-lg">Notification delivery</h2>
				<p className="text-muted-foreground text-sm">
					Choose how each update reaches you.
				</p>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="border-b text-muted-foreground">
						<tr>
							<th className="pb-2 font-medium">Category</th>
							{CHANNELS.map((channel) => (
								<th className="pb-2 text-center font-medium" key={channel.key}>
									{channel.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{preferences.map((row) => (
							<tr className="border-b last:border-0" key={row.category}>
								<td className="py-3 font-medium">{label(row.category)}</td>
								{CHANNELS.map((channel) => (
									<td className="py-3 text-center" key={channel.key}>
										<Switch
											aria-label={`${label(row.category)} ${channel.label}`}
											checked={row[channel.key]}
											disabled={pending !== null}
											onCheckedChange={() => void toggle(row, channel.key)}
										/>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{error && <p className="text-destructive text-sm">{error}</p>}
		</section>
	);
}
