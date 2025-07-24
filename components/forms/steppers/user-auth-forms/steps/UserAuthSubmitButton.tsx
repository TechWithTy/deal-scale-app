import { Button } from "@/components/ui/button";

interface UserAuthSubmitButtonProps {
	loading: boolean;
	isSignUp: boolean;
}

export const UserAuthSubmitButton: React.FC<UserAuthSubmitButtonProps> = ({
	loading,
	isSignUp,
}) => (
	<Button type="submit" disabled={loading} className="w-full">
		{loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
	</Button>
);
