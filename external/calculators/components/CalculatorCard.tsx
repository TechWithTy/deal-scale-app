"use client";

import React, { type PropsWithChildren } from "react";
import { cn } from "@/lib/_utils";

interface CalculatorCardProps {
	id: string;
	title: string;
	description: string;
	className?: string;
}

export function CalculatorCard({
	id,
	title,
	description,
	className,
	children,
}: PropsWithChildren<CalculatorCardProps>) {
	return (
		<section
			id={`calculator-${id}`}
			aria-labelledby={`calculator-${id}-heading`}
			className={cn(
				"rounded-lg border border-border bg-card p-6 shadow-sm",
				className,
			)}
		>
			<header className="mb-4 space-y-1">
				<h2
					id={`calculator-${id}-heading`}
					className="font-semibold text-xl text-foreground"
				>
					{title}
				</h2>
				<p className="text-muted-foreground text-sm">{description}</p>
			</header>
			<div className="space-y-4">{children}</div>
		</section>
	);
}
