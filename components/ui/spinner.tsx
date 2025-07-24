import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/_utils";

const spinnerVariants = cva("relative block opacity-65", {
	variants: {
		size: {
			sm: "size-5",
			md: "size-9",
			lg: "size-10",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

export interface SpinnerProps
	extends Omit<React.ComponentPropsWithoutRef<"span">, "ref">,
		VariantProps<typeof spinnerVariants> {
	loading?: boolean;
	asChild?: boolean;
}

const SPINNER_LEAVES = Array.from({ length: 8 }, (_, i) => `spinner-leaf-${i}`);

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
	({ className, size, loading = true, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "span";

		const [bgColorClass, filteredClassName] = React.useMemo(() => {
			const bgClass = className?.match(/(?:dark:bg-|bg-)\S+/g) || [
				"bg-current",
			];
			const filteredClasses = className
				?.replace(/(?:dark:bg-|bg-)\S+/g, "")
				.trim();
			return [bgClass, filteredClasses];
		}, [className]);

		if (!loading) {
			return null;
		}

		return (
			<div className="relative">
				<Comp
					ref={ref}
					className={cn(
						spinnerVariants({ size, className: filteredClassName }),
					)}
					{...props}
				>
					{SPINNER_LEAVES.map((leafId, i) => (
						<span
							key={leafId}
							className="absolute top-0 left-1/2 h-full w-[12.5%] animate-spinner-leaf-fade"
							style={{
								transform: `rotate(${i * 45}deg)`,
								animationDelay: `${-(7 - i) * 100}ms`,
								transformOrigin: "0% 50%",
							}}
						>
							<span
								className={cn("block h-full w-full rounded-full", bgColorClass)}
							/>
						</span>
					))}
				</Comp>
			</div>
		);
	},
);

Spinner.displayName = "Spinner";

export { Spinner };
