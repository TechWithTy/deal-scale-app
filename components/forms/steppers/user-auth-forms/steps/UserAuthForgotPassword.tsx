import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const UserAuthForgotPassword: React.FC<{
	onRequestReset: (email: string) => void;
	loading: boolean;
}> = ({ onRequestReset, loading }) => {
	const [email, setEmail] = useState("");
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onRequestReset(email);
			}}
			className="space-y-4"
		>
			<Input
				type="email"
				placeholder="Enter your email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				disabled={loading}
			/>
			<Button type="submit" disabled={loading || !email} className="w-full">
				{loading ? "Sending..." : "Send Reset Link"}
			</Button>
		</form>
	);
};
