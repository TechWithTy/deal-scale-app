import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UserAuthEmailField } from "./steps/UserAuthEmailField";
import { UserAuthErrorMessage } from "./steps/UserAuthErrorMessage";
import { UserAuthForgotPassword } from "./steps/UserAuthForgotPassword";
import { UserAuthOAuthButtons } from "./steps/UserAuthOAuthButtons";
import { UserAuthPasswordField } from "./steps/UserAuthPasswordField";
import { UserAuthSubmitButton } from "./steps/UserAuthSubmitButton";
import { UserAuthToggle } from "./steps/UserAuthToggle";
import { UserAuthTwoFactorSetup } from "./steps/UserAuthTwoFactorSetup";
import { UserAuthVerifyCode } from "./steps/UserAuthVerifyCode"; // ! Added test user sign-in dependencies

const formSchema = z.object({
	email: z.string().email({ message: "Enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

type UserFormValue = z.infer<typeof formSchema>;

type AuthState = "login" | "signup" | "forgot" | "verify" | "2fa";

// * Test user credentials (for dev/demo)
const TEST_USER = {
	email: process.env.NEXT_PUBLIC_TEST_USER_EMAIL,
	password: process.env.NEXT_PUBLIC_TEST_USER_PASSWORD,
};

export default function MainUserAuthForm() {
	const router = useRouter();
	const [authState, setAuthState] = useState<AuthState>("login");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(undefined);

	// ! Test user login handler with tooltip on success
	const [showTooltip, setShowTooltip] = useState(false);
	const handleTestUserLogin = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await signIn("credentials", {
				redirect: false,
				email: TEST_USER.email,
				password: TEST_USER.password,
				callbackUrl: "/dashboard",
			});
			if (result?.error) {
				setError(`Test user login failed: ${result.error}`);
			} else {
				setShowTooltip(true);
				setTimeout(() => setShowTooltip(false), 2000);
				// Redirect after short delay so tooltip is visible
				setTimeout(() => router.push("/dashboard"), 1200);
			}
		} catch (err) {
			setError("Test user login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

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

	const onSubmit = async (data: UserFormValue) => {
		setLoading(true);
		setError(null);
		try {
			// TODO: API call for login/signup
			console.log("Form submitted:", data);
			if (isSignUp) setAuthState("verify");
			// else redirect to dashboard
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	// Render based on authState
	return (
		<div className="relative mx-auto w-full max-w-md space-y-6">
			{/* Login success tooltip */}
			{showTooltip && (
				<div className="-translate-x-1/2 absolute top-2 left-1/2 z-40 animate-fade-in-out rounded bg-green-600 px-4 py-2 text-white shadow-lg">
					Login successful!
				</div>
			)}
			{authState === "login" && (
				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<UserAuthErrorMessage error={error} />
						<UserAuthEmailField loading={loading} />
						<UserAuthPasswordField loading={loading} />
						<UserAuthOAuthButtons />

						{/* ! Test User Sign-In Button */}
						<Button
							type="button"
							onClick={handleTestUserLogin}
							disabled={loading}
							variant="outline"
							className="mt-2 w-full"
						>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Sign in as Test User
						</Button>
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
				</FormProvider>
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
