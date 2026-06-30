import { Button } from "@/components/ui/button";
import { cn } from "@/lib/_utils";

// ✅ Define the expected props type
interface AuthToggleProps {
	isSignUp: boolean;
	setIsSignUp: (value: boolean) => void;
}

export default function AuthToggle({ isSignUp, setIsSignUp }: AuthToggleProps) {
	return (
		<Button
			type="button"
			variant="ghost"
			onClick={() => setIsSignUp(!isSignUp)}
			className={cn("absolute top-4 right-4 md:top-8 md:right-8")}
		>
			{isSignUp
				? "Already have an account? Sign In"
				: "Need an account? Sign Up"}
		</Button>
	);
}
