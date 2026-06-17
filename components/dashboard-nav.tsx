"use client";

import { Icons } from "@/components/icons";
import VideoTourModal from "@/external/interactive-avatar-nextjs-demo/components/Sidebar/VideoTourModal";
import { useAppTour } from "@/external/interactive-avatar-nextjs-demo/components/tour/AppTourProvider";
import { tourRegistry } from "@/external/interactive-avatar-nextjs-demo/components/tour/tourRegistry";
import type { TourId } from "@/external/interactive-avatar-nextjs-demo/components/tour/tourTypes";
import { cn } from "@/lib/_utils";
import type { NavItem } from "@/types";
import { HelpCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	type Dispatch,
	Fragment,
	type MouseEvent,
	type SetStateAction,
	useEffect,
	useState,
} from "react";
import { FeatureGuard } from "./access/FeatureGuard";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const dashboardTourByHref: Partial<Record<string, TourId>> = {
	"/dashboard": "chat",
	"/dashboard/agents": "agent-manager",
	"/dashboard/campaigns": "campaigns",
	"/dashboard/lead-list": "lead-list",
	"/dashboard/kanban": "kanban",
	"/dashboard/chat": "chat",
	"/dashboard/connections": "connections",
	"/dashboard/charts": "charts",
	"/dashboard/calculators": "calculations",
	"/dashboard/resources": "resources",
	"/dashboard/deal-room": "deal-room",
	"/dashboard/employee": "employee",
};

const DASHBOARD_HELP_VIDEO_URL =
	"https://app.supademo.com/embed/cmhjlwt7i0jk4u1hm0scmf39w?embed_v=2&utm_source=embed";

interface DashboardNavProps {
	items: NavItem[];
	setOpen?: Dispatch<SetStateAction<boolean>>;
	isMobileNav?: boolean;
	isMinimized?: boolean;
}

export function DashboardNav({
	items,
	setOpen,
	isMobileNav = false,
	isMinimized,
}: DashboardNavProps) {
	const path = usePathname();
	const router = useRouter();
	const { startTour } = useAppTour();
	const [loading, setLoading] = useState(false);
	const [pendingTour, setPendingTour] = useState<{
		href: string;
		tourId: TourId;
	} | null>(null);
	const [helpTour, setHelpTour] = useState<{
		href: string;
		title: string;
		tourId: TourId;
	} | null>(null);

	useEffect(() => {
		if (!pendingTour || path !== pendingTour.href) return;

		const timer = window.setTimeout(() => {
			startTour(pendingTour.tourId);
			setPendingTour(null);
		}, 100);

		return () => window.clearTimeout(timer);
	}, [path, pendingTour, startTour]);

	const handleLogout = async (event: MouseEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			await signOut({ callbackUrl: "/signin", redirect: true });
		} finally {
			setLoading(false);
		}
	};

	if (!items?.length) {
		return null;
	}

	const startRouteTour = (href: string, tourId: TourId) => {
		if (path === href) {
			startTour(tourId);
			return;
		}

		setPendingTour({ href, tourId });
		router.push(href);
	};

	const openHelpVideo = (href: string, title: string, tourId: TourId) => {
		setHelpTour({ href, title, tourId });
	};

	const helpTourDefinition = helpTour ? tourRegistry[helpTour.tourId] : null;

	return (
		<>
			<nav className="grid items-start gap-2 overflow-visible">
				{items.map((item) => {
					if (item.onlyMobile && !isMobileNav) {
						return null;
					}

					// Handle separator
					if (item.icon === "separator") {
						return (
							<div
								key={`separator-${item.title ?? item.href ?? "dashboard-nav-separator"}`}
								className={cn(
									"my-2 h-px bg-border",
									isMinimized ? "mx-2" : "mx-3",
								)}
							/>
						);
					}

					const Icon = Icons[item.icon || "arrowRight"];
					const tourId = item.href ? dashboardTourByHref[item.href] : undefined;
					const showTourButton = Boolean(
						tourId && !item.external && !item.disabled && !isMinimized,
					);

					const featureKey = item.featureKey;
					const isPrimary = item.variant === "primary";
					const guardWrapperClass = cn(
						"nav-item",
						isMobileNav
							? "nav-item--mobile"
							: isMinimized
								? "nav-item--minimized"
								: "nav-item--expanded",
						item.disabled && "is-disabled",
						isPrimary && "nav-item--primary",
					);
					const itemClasses = cn(
						"flex items-center gap-2 rounded-md font-medium text-sm transition-colors group relative overflow-visible",
						isMinimized
							? "w-10 h-10 justify-center p-0 mx-auto"
							: "w-full px-3 py-2",
						!isPrimary && "hover:bg-accent hover:text-accent-foreground",
						path === item.href && !isPrimary ? "bg-accent" : "transparent",
						item.disabled && "cursor-not-allowed opacity-80",
						featureKey && "opacity-75",
						isPrimary &&
							"bg-slate-900 text-slate-50 shadow-lg hover:bg-slate-800 border border-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100",
					);

					const tourButton = showTourButton ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="mr-1 inline-flex size-8 flex-none items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
									aria-label={`Start ${item.title} tour`}
									data-tour-sidebar-launch={tourId}
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										if (item.href && tourId) {
											openHelpVideo(item.href, item.title, tourId);
										}
										if (setOpen) setOpen(false);
									}}
								>
									<HelpCircle className="size-4" aria-hidden />
								</button>
							</TooltipTrigger>
							<TooltipContent side="right" sideOffset={8}>
								Open {item.title} help
							</TooltipContent>
						</Tooltip>
					) : null;

					const navContent = (
						<>
							{item.title === "Logout" ? (
								<button
									type="button"
									onClick={handleLogout}
									className={cn(
										"flex items-center rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
										isMinimized
											? "mx-auto h-10 w-10 justify-center p-0"
											: "w-full gap-2 overflow-hidden px-3 py-2",
										item.disabled && "cursor-not-allowed opacity-80",
									)}
									disabled={loading}
								>
									<Icon
										className={cn(
											"size-5 flex-none",
											isMinimized ? "ml-0" : "ml-3",
										)}
									/>
									{isMobileNav || (!isMinimized && !isMobileNav) ? (
										<span className="mr-2 truncate">Logout</span>
									) : null}
								</button>
							) : item.external ? (
								<a
									href={item.disabled ? "#" : item.href || "/"}
									className={itemClasses}
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => {
										if (setOpen) setOpen(false);
									}}
								>
									<Icon
										className={cn(
											"size-5 flex-none",
											isMinimized ? "ml-0" : "ml-3",
										)}
									/>
									{isMobileNav || (!isMinimized && !isMobileNav) ? (
										<span className="mr-2 truncate">{item.title}</span>
									) : null}
									{/* Badge indicator */}
									{item.badge && !isMinimized && (
										<span className="mr-2 ml-auto rounded-full bg-primary px-2 py-0.5 font-semibold text-[10px] text-primary-foreground">
											{item.badge}
										</span>
									)}
									{/* Sale indicator with tooltip - only show when no featureKey (no tab blockers) to avoid overlap */}
									{item.hasSaleItems && item.saleLink && !featureKey && (
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														e.preventDefault();
														window.open(
															item.saleLink,
															"_blank",
															"noopener,noreferrer",
														);
														if (setOpen) setOpen(false);
													}}
													className={cn(
														"-translate-y-1/2 absolute top-1/2 h-2.5 w-2.5 cursor-pointer rounded-full bg-red-500 ring-2 ring-background transition-transform hover:scale-125",
														isMinimized ? "right-0" : "right-2",
													)}
													aria-label="Items on sale"
												/>
											</TooltipTrigger>
											<TooltipContent side="right" sideOffset={8}>
												<p className="font-semibold">Items on sale</p>
												<p className="text-xs">
													Click to view marketplace deals
												</p>
											</TooltipContent>
										</Tooltip>
									)}
								</a>
							) : (
								<div
									className={cn(
										"flex items-center",
										isMinimized ? "w-full justify-center" : "gap-1",
									)}
								>
									<Link
										href={item.disabled ? "/" : item.href || "/"}
										className={cn(itemClasses, tourButton && "min-w-0 flex-1")}
										onClick={() => {
											if (setOpen) setOpen(false);
										}}
									>
										<Icon
											className={cn(
												"size-5 flex-none",
												isMinimized ? "ml-0" : "ml-3",
											)}
										/>
										{isMobileNav || (!isMinimized && !isMobileNav) ? (
											<span className="mr-2 truncate">{item.title}</span>
										) : null}
										{/* Badge indicator */}
										{item.badge && !isMinimized && (
											<span className="mr-2 ml-auto rounded-full bg-primary px-2 py-0.5 font-semibold text-[10px] text-primary-foreground">
												{item.badge}
											</span>
										)}
										{/* Sale indicator with tooltip - only show when no featureKey (no tab blockers) to avoid overlap */}
										{item.hasSaleItems && item.saleLink && !featureKey && (
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
															window.open(
																item.saleLink,
																"_blank",
																"noopener,noreferrer",
															);
															if (setOpen) setOpen(false);
														}}
														className={cn(
															"-translate-y-1/2 absolute top-1/2 h-2.5 w-2.5 cursor-pointer rounded-full bg-red-500 ring-2 ring-background transition-transform hover:scale-125",
															isMinimized ? "right-0" : "right-2",
														)}
														aria-label="Items on sale"
													/>
												</TooltipTrigger>
												<TooltipContent side="right" sideOffset={8}>
													<p className="font-semibold">Items on sale</p>
													<p className="text-xs">
														Click to view marketplace deals
													</p>
												</TooltipContent>
											</Tooltip>
										)}
									</Link>
									{tourButton}
								</div>
							)}
						</>
					);

					const guardedNavContent = featureKey ? (
						<FeatureGuard
							featureKey={featureKey}
							wrapperClassName={guardWrapperClass}
							orientation={isMinimized ? "vertical" : "auto"}
							showPopover={!isMobileNav}
						>
							{navContent}
						</FeatureGuard>
					) : (
						navContent
					);

					if (!isMinimized) {
						return <Fragment key={item.title}>{guardedNavContent}</Fragment>;
					}

					return (
						<Tooltip key={item.title}>
							<TooltipTrigger asChild>
								<div>{guardedNavContent}</div>
							</TooltipTrigger>
							<TooltipContent align="center" side="right" sideOffset={8}>
								{item.title}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</nav>
			<VideoTourModal
				open={Boolean(helpTour)}
				title={
					helpTourDefinition?.title
						? `${helpTourDefinition.title} Help`
						: `${helpTour?.title ?? "Dashboard"} Help`
				}
				subtitle={
					helpTourDefinition?.description ??
					"Watch the quick video, then start the guided tour for this sidebar item."
				}
				tourButtonLabel={`Start ${helpTour?.title ?? "guided"} tour`}
				videoUrl={DASHBOARD_HELP_VIDEO_URL}
				onClose={() => setHelpTour(null)}
				onStartTour={() => {
					if (!helpTour) return;
					startRouteTour(helpTour.href, helpTour.tourId);
				}}
			/>
		</>
	);
}
