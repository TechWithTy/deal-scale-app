import * as React from "react";

import { cn } from "@/lib/_utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, error, id, ...props }, ref) => {
		const inputId = id || React.useId();
		return (
			<div className="w-full">
				{label && (
					<label htmlFor={inputId} className="mb-1 block font-medium text-sm">
						{label}
					</label>
				)}
				<input
					id={inputId}
					type={type}
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
						!!error && "border-red-500 focus-visible:ring-red-500",
						className,
					)}
					aria-invalid={!!error}
					aria-describedby={error ? `${inputId}-error` : undefined}
					ref={ref}
					{...props}
				/>
				{error && (
					<p id={`${inputId}-error`} className="mt-1 text-red-600 text-xs">
						{error}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
