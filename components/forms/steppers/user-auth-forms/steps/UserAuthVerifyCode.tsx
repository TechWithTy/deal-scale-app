import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const UserAuthVerifyCode: React.FC<{
	onVerify: (code: string) => void;
	loading: boolean;
}> = ({ onVerify, loading }) => {
	const [code, setCode] = useState("");
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onVerify(code);
			}}
			className="space-y-4"
		>
			<Input
				type="text"
				placeholder="Enter verification code"
				value={code}
				onChange={(e) => setCode(e.target.value)}
				disabled={loading}
			/>
			<Button type="submit" disabled={loading || !code} className="w-full">
				{loading ? "Verifying..." : "Verify Code"}
			</Button>
		</form>
	);
};
