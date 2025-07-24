interface UserAuthErrorMessageProps {
	error: string | null;
}

export const UserAuthErrorMessage: React.FC<UserAuthErrorMessageProps> = ({
	error,
}) => {
	if (!error) return null;
	return (
		<div className="mb-2 text-red-600 text-sm" role="alert">
			{error}
		</div>
	);
};
