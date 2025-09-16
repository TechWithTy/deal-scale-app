"use client";

import { cn } from "@/lib/_utils";
import { Switch } from "@/components/ui/switch";
import type { CrudFlags, CrudKey } from "../utils/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CrudToggleProps {
	value: CrudFlags;
	onChange?: (next: CrudFlags) => void;
	/**
	 * If true, switches do not change state. Clicking will trigger onInviteRequest
	 * so callers can initiate an invite/access request flow.
	 */
	readOnly?: boolean;
	/**
	 * Called when user interacts with a disabled (readOnly) flag.
	 */
	onInviteRequest?: (key: CrudKey, desired: boolean) => void;
	size?: "sm" | "md";
	className?: string;
}

const LABELS: Record<CrudKey, string> = {
	create: "C",
	read: "R",
	update: "U",
	delete: "D",
};

export function CrudToggle({
	value,
	onChange,
	readOnly = false,
	onInviteRequest,
	size = "md",
	className,
}: CrudToggleProps) {
	const keys: CrudKey[] = ["create", "read", "update", "delete"];
	const switchSize = size === "sm" ? "h-4 w-7" : "h-5 w-9";

	const setFlag = (key: CrudKey, enabled: boolean) => {
		if (readOnly) {
			onInviteRequest?.(key, enabled);
			return;
		}
		onChange?.({ ...value, [key]: enabled });
	};

	return (
		<div
			className={cn(
				"inline-flex items-center gap-3 rounded-md border p-2",
				"border-border bg-card text-foreground",
				className,
			)}
		>
			{keys.map((key) => {
				const desired = !value[key];
				return (
					<div
						key={key}
						className="flex items-center gap-1.5"
						onClick={() => readOnly && setFlag(key, desired)}
						role={readOnly ? "button" : undefined}
						tabIndex={readOnly ? 0 : undefined}
						onKeyDown={(e) => {
							if (!readOnly) return;
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setFlag(key, desired);
							}
						}}
					>
						<span
							className="select-none text-xs font-medium text-muted-foreground"
							aria-hidden
						>
							{LABELS[key]}
						</span>
						{readOnly ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="cursor-help">
											<Switch
												aria-label={`Request ${key} permission`}
												checked={!!value[key]}
												onCheckedChange={(v) => setFlag(key, v)}
												disabled
												className={cn(switchSize, "opacity-70")}
											/>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<span>Request access to {key.toUpperCase()}</span>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<Switch
								aria-label={`${key} permission`}
								checked={!!value[key]}
								onCheckedChange={(v) => setFlag(key, v)}
								className={cn(switchSize)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
