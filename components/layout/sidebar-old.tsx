import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/_utils";

export default function Sidebar() {
	return (
		<nav
			className={cn("relative hidden h-screen w-72 border-r pt-16 lg:block")}
		>
			<div className="space-y-4 py-4">
				<div className="px-3 py-2">
					<div className="space-y-1">
						<h2 className="mb-2 px-4 font-semibold text-xl tracking-tight">
							Overview
						</h2>
						<DashboardNav items={navItems} />
					</div>
				</div>
			</div>
		</nav>
	);
}
