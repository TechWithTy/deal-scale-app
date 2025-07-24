import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/_utils/kanban/utils";
import Link from "next/link";

// ✅ Define the expected props type
interface AuthToggleProps {
	isSignUp: boolean;
	setIsSignUp: (value: boolean) => void;
}

export default function AuthToggle({ isSignUp, setIsSignUp }: AuthToggleProps) {
	return (
		<Link
			href="/examples/authentication"
			className={cn(
				buttonVariants({ variant: "ghost" }),
				"absolute top-4 right-4 hidden md:top-8 md:right-8",
			)}
		>
			{isSignUp
				? "Already have an account? Sign In"
				: "Need an account? Sign Up"}
		</Link>
	);
}
