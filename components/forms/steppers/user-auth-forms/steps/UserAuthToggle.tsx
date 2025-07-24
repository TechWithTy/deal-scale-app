interface UserAuthToggleProps {
	isSignUp: boolean;
	setIsSignUp: (val: boolean) => void;
	loading: boolean;
}

export const UserAuthToggle: React.FC<UserAuthToggleProps> = ({
	isSignUp,
	setIsSignUp,
	loading,
}) => (
	<button
		type="button"
		className="mb-4 text-blue-600 text-sm underline"
		disabled={loading}
		onClick={() => setIsSignUp(!isSignUp)}
	>
		{isSignUp
			? "Already have an account? Sign In"
			: "Don't have an account? Sign Up"}
	</button>
);
