"use client";

import React from "react";
import type { FC, ReactNode } from "react";
import { ArrowBigLeft, ArrowBigRight, Dot } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/_utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickStartCrmSyncModalProps {
	readonly isOpen: boolean;
	readonly connectedCrmNames: readonly string[];
	readonly onCancel: () => void;
	readonly onConfirm: () => void;
	readonly onAutoSelect: () => void;
	readonly isConfirmDisabled?: boolean;
	readonly isAutoSelectDisabled?: boolean;
	readonly footer?: ReactNode;
}

const ColumnCard = ({
	title,
	subtitle,
	children,
}: {
	readonly title: string;
	readonly subtitle?: string;
	readonly children?: ReactNode;
}) => (
	<Card className="flex h-56 w-full flex-col gap-3 rounded-3xl border-primary/40 bg-primary/5 p-5 shadow-[0_0_30px_rgba(59,130,246,0.12)] backdrop-blur">
		<div className="space-y-1">
			<p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
				{subtitle}
			</p>
			<h3 className="font-semibold text-lg text-primary tracking-tight">
				{title}
			</h3>
		</div>
		<div className="flex-1 rounded-2xl border border-primary/30 border-dashed bg-background/40 p-4 text-primary-foreground/80 text-sm">
			{children ?? (
				<p className="text-muted-foreground">
					A live snapshot of mapped lead segments will appear here once sync
					begins.
				</p>
			)}
		</div>
	</Card>
);

export const QuickStartCrmSyncModal: FC<QuickStartCrmSyncModalProps> = ({
	isOpen,
	connectedCrmNames,
	onCancel,
	onConfirm,
	onAutoSelect,
	isConfirmDisabled = false,
	isAutoSelectDisabled = false,
	footer,
}) => {
	const crmLabel =
		connectedCrmNames.length === 0
			? "Your CRM"
			: connectedCrmNames.length === 1
				? connectedCrmNames[0]
				: `${connectedCrmNames.slice(0, -1).join(", ")} & ${
						connectedCrmNames[connectedCrmNames.length - 1]
					}`;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => (!open ? onCancel() : undefined)}
		>
			<DialogContent className="w-full max-w-3xl border-primary/30 bg-background/95 p-8">
				<DialogHeader className="space-y-2">
					<DialogTitle className="font-semibold text-2xl text-primary tracking-tight">
						Sync {crmLabel} leads with DealScale
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						We’ve detected {crmLabel} is connected. Review the mapping before
						importing leads directly into DealScale.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-8">
					<div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
						<ColumnCard title="CRM Leads" subtitle="Connected Source">
							<div className="space-y-2 text-sm">
								<p className="font-medium text-primary-foreground">
									Pick segments, pipelines, or smart lists from your CRM.
								</p>
								<ul className="space-y-1 text-muted-foreground">
									<li>• Preserve original CRM tags & owners</li>
									<li>• Maintain opt-out & suppression flags</li>
									<li>• Track activity after sync in DealScale</li>
								</ul>
							</div>
						</ColumnCard>

						<div className="relative flex flex-col items-center justify-center gap-1 text-primary">
							<div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary/80 text-xs uppercase tracking-[0.3em]">
								Sync Path
							</div>
							<ArrowBigRight className="h-8 w-8" />
							<Dot className="h-5 w-5" />
							<ArrowBigLeft className="h-8 w-8" />
						</div>

						<ColumnCard title="Importing to DealScale" subtitle="Destination">
							<div className="space-y-2 text-sm">
								<p className="font-medium text-primary-foreground">
									Map CRM fields to DealScale journey attributes.
								</p>
								<ul className="space-y-1 text-muted-foreground">
									<li>• AI matches fields & resolves duplicates</li>
									<li>• Apply enrichment & persona scoring</li>
									<li>• Send to instant nurture or lookalike audiences</li>
								</ul>
							</div>
						</ColumnCard>
					</div>

					{footer ? (
						<div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-muted-foreground text-sm">
							{footer}
						</div>
					) : null}

					<div className="flex flex-wrap justify-end gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							className="border border-transparent text-muted-foreground hover:border-muted"
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onAutoSelect}
							disabled={isAutoSelectDisabled}
							className={cn(
								"border-primary/50 text-primary shadow-[0_0_20px_rgba(59,130,246,0.2)] transition",
								isAutoSelectDisabled
									? "opacity-70"
									: "hover:border-primary hover:bg-primary/10",
							)}
						>
							AI Auto Select
						</Button>
						<Button
							type="button"
							onClick={onConfirm}
							disabled={isConfirmDisabled}
							className="bg-primary text-primary-foreground shadow-[0_0_24px_rgba(59,130,246,0.35)] transition hover:bg-primary/90"
						>
							Confirm
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default QuickStartCrmSyncModal;
