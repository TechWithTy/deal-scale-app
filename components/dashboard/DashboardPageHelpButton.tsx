"use client";

import VideoTourModal from "@/external/interactive-avatar-nextjs-demo/components/Sidebar/VideoTourModal";
import { useAppTour } from "@/external/interactive-avatar-nextjs-demo/components/tour/AppTourProvider";
import { tourRegistry } from "@/external/interactive-avatar-nextjs-demo/components/tour/tourRegistry";
import type { TourId } from "@/external/interactive-avatar-nextjs-demo/components/tour/tourTypes";
import { HelpCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const DASHBOARD_HELP_VIDEO_URL =
	"https://app.supademo.com/embed/cmhjlwt7i0jk4u1hm0scmf39w?embed_v=2&utm_source=embed";

const dashboardTourByPath: Array<{ path: string; tourId: TourId }> = [
	{ path: "/dashboard/campaigns", tourId: "campaigns" },
	{ path: "/dashboard/lead-list", tourId: "lead-list" },
	{ path: "/dashboard/kanban", tourId: "kanban" },
	{ path: "/dashboard/chat", tourId: "chat" },
	{ path: "/dashboard/connections", tourId: "connections" },
	{ path: "/dashboard/charts", tourId: "charts" },
	{ path: "/dashboard/calculators", tourId: "calculations" },
	{ path: "/dashboard/resources", tourId: "resources" },
	{ path: "/dashboard/deal-room", tourId: "deal-room" },
	{ path: "/dashboard/employee", tourId: "employee" },
	{ path: "/dashboard/agents", tourId: "agent-manager" },
	{ path: "/dashboard", tourId: "chat" },
];

function getTourId(pathname: string): TourId {
	const match = dashboardTourByPath.find(
		({ path }) => pathname === path || pathname.startsWith(`${path}/`),
	);
	return match?.tourId ?? "chat";
}

export function DashboardPageHelpButton() {
	const pathname = usePathname();
	const { startTour } = useAppTour();
	const [open, setOpen] = useState(false);
	const tourId = useMemo(() => getTourId(pathname || "/dashboard"), [pathname]);
	const tourDefinition = tourRegistry[tourId];
	const title = tourDefinition?.title
		? `${tourDefinition.title} Help`
		: "Dashboard Help";

	return (
		<>
			<button
				aria-label="Open page help"
				className="fixed top-20 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				data-tour="dashboard-page-help"
				title="Open page help"
				type="button"
				onClick={() => setOpen(true)}
			>
				<HelpCircle className="h-5 w-5" aria-hidden />
			</button>
			<VideoTourModal
				open={open}
				title={title}
				subtitle={
					tourDefinition?.description ??
					"Watch the quick video, then start the guided tour for this page."
				}
				tourButtonLabel="Start guided tour"
				videoUrl={DASHBOARD_HELP_VIDEO_URL}
				onClose={() => setOpen(false)}
				onStartTour={() => startTour(tourId)}
			/>
		</>
	);
}
