import { LinkedInLoginButton } from "react-social-login-buttons";

export const UserAuthOAuthButtons: React.FC = () => (
	<div className="my-4 flex flex-col gap-2">
		<LinkedInLoginButton
			onClick={() => {
				/* todo: implement OAuth logic */
			}}
		/>
		{/* Add other OAuth providers here */}
	</div>
);
