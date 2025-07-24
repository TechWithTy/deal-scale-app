import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { MailIcon, CheckCircle2 } from "lucide-react";

interface ResetPasswordSectionProps {
	userId: string;
	userEmail: string;
}

export const ResetPasswordSection: React.FC<ResetPasswordSectionProps> = ({
	userId,
	userEmail,
}) => {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleReset = async () => {
		setLoading(true);
		setSuccess(false);
		try {
			// TODO: Replace with your API call
			await new Promise((res) => setTimeout(res, 1000));
			setSuccess(true);
			toast({
				title: "Reset email sent!",
				description: `A password reset email was sent to ${userEmail}.`,
				variant: "default",
			});
		} catch (e) {
			toast({
				title: "Error",
				description: "Failed to send reset email. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
			setTimeout(() => setSuccess(false), 2000); // Hide check after a moment
		}
	};

	return (
		<Card className="mt-8 border bg-card p-8 shadow-sm">
			<div className="flex items-center justify-between gap-6">
				<div className="flex items-center gap-3">
					<MailIcon className="h-6 w-6 text-primary" aria-hidden />
					<div>
						<h3 className="font-semibold text-lg">Reset Password</h3>
						<p className="text-muted-foreground text-sm">
							Send a password reset email to this team member.
							<br />
							They will receive a link to set a new password.
						</p>
					</div>
				</div>
				<Button
					onClick={handleReset}
					disabled={loading || success}
					variant="default"
					aria-label="Send password reset email"
				>
					{loading ? (
						<span className="flex items-center gap-2">
							<span className="animate-spin">⏳</span> Sending...
						</span>
					) : success ? (
						<span className="flex items-center gap-2 text-green-600">
							<CheckCircle2 className="h-4 w-4" /> Sent!
						</span>
					) : (
						"Send Reset Email"
					)}
				</Button>
			</div>
			<Separator className="my-4" />
			<p className="text-muted-foreground text-xs leading-relaxed">
				This will not reveal the current password or set a new one directly.
				<br />
				<span className="font-medium">
					Use only if the team member cannot log in.
				</span>
			</p>
		</Card>
	);
};
