import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserAuthEmailField } from "./steps/UserAuthEmailField";
import { UserAuthErrorMessage } from "./steps/UserAuthErrorMessage";
import { UserAuthForgotPassword } from "./steps/UserAuthForgotPassword";
import { UserAuthOAuthButtons } from "./steps/UserAuthOAuthButtons";
import { UserAuthPasswordField } from "./steps/UserAuthPasswordField";
import { UserAuthSubmitButton } from "./steps/UserAuthSubmitButton";
import { UserAuthToggle } from "./steps/UserAuthToggle";
import { UserAuthTwoFactorSetup } from "./steps/UserAuthTwoFactorSetup";
import { UserAuthVerifyCode } from "./steps/UserAuthVerifyCode";

const formSchema = z.object({
	email: z.string().email({ message: "Enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

type UserFormValue = z.infer<typeof formSchema>;

type AuthState = "login" | "signup" | "forgot" | "verify" | "2fa";

export default function MainUserAuthForm() {
	const [authState, setAuthState] = useState<AuthState>("login");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(undefined);

	const form = useForm<UserFormValue>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "", password: "" },
	});

	// Handlers for each step
	const handleForgotPassword = async (email: string) => {
		setLoading(true);
		setError(null);
		// TODO: API call for forgot password
		setTimeout(() => {
			setLoading(false);
			setAuthState("verify");
		}, 1200);
	};

	const handleVerifyCode = async (code: string) => {
		setLoading(true);
		setError(null);
		// TODO: API call for code verification
		setTimeout(() => {
			setLoading(false);
			setAuthState("2fa");
			setQrCodeUrl(
				"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/demo",
			);
		}, 1200);
	};

	const handleTwoFactorSetup = async (code: string) => {
		setLoading(true);
		setError(null);
		// TODO: API call for 2FA setup
		setTimeout(() => {
			setLoading(false);
			setAuthState("login"); // After 2FA setup, return to login
		}, 1200);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		setError(null);
		// TODO: API call for login/signup
		setTimeout(() => {
			setLoading(false);
			if (isSignUp) setAuthState("verify");
			// else redirect to dashboard
		}, 1200);
	};

	// Render based on authState
	return (
		<div className="mx-auto w-full max-w-md space-y-6">
			{authState === "login" && (
				<Form {...form}>
					<form onSubmit={handleSubmit} className="space-y-4">
						<UserAuthErrorMessage error={error} />
						<UserAuthEmailField form={form} loading={loading} />
						<UserAuthPasswordField form={form} loading={loading} />
						<UserAuthOAuthButtons />
						<UserAuthSubmitButton loading={loading} isSignUp={isSignUp} />
						<UserAuthToggle
							isSignUp={isSignUp}
							setIsSignUp={setIsSignUp}
							loading={loading}
						/>
						<button
							type="button"
							className="mt-2 text-blue-700 text-xs underline"
							onClick={() => setAuthState("forgot")}
							disabled={loading}
						>
							Forgot password?
						</button>
					</form>
				</Form>
			)}
			{authState === "forgot" && (
				<UserAuthForgotPassword
					onRequestReset={handleForgotPassword}
					loading={loading}
				/>
			)}
			{authState === "verify" && (
				<UserAuthVerifyCode onVerify={handleVerifyCode} loading={loading} />
			)}
			{authState === "2fa" && (
				<UserAuthTwoFactorSetup
					onSetup={handleTwoFactorSetup}
					loading={loading}
					qrCodeUrl={qrCodeUrl}
				/>
			)}
		</div>
	);
}
