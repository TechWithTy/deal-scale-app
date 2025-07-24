import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface UserAuthTwoFactorSetupProps {
	onSetup: (code: string) => void;
	loading: boolean;
	qrCodeUrl?: string;
}

export const UserAuthTwoFactorSetup: React.FC<UserAuthTwoFactorSetupProps> = ({
	onSetup,
	loading,
	qrCodeUrl,
}) => {
	const [code, setCode] = useState("");
	return (
		<div className="space-y-4">
			{qrCodeUrl && (
				<div className="flex flex-col items-center">
					<img src={qrCodeUrl} alt="2FA QR Code" className="mb-2 h-40 w-40" />
					<span className="text-muted-foreground text-xs">
						Scan this QR code with your authenticator app.
					</span>
				</div>
			)}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSetup(code);
				}}
				className="space-y-4"
			>
				<Input
					type="text"
					placeholder="Enter code from your app"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					disabled={loading}
				/>
				<Button type="submit" disabled={loading || !code} className="w-full">
					{loading ? "Enabling..." : "Enable 2FA"}
				</Button>
			</form>
		</div>
	);
};
