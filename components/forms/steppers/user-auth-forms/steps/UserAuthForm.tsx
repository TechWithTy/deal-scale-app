// import { signIn, signUp } from "@/actions/auth";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserAuthEmailField } from "./UserAuthEmailField";
import { UserAuthErrorMessage } from "./UserAuthErrorMessage";
import { UserAuthOAuthButtons } from "./UserAuthOAuthButtons";
import { UserAuthPasswordField } from "./UserAuthPasswordField";
import { UserAuthSubmitButton } from "./UserAuthSubmitButton";
import { UserAuthToggle } from "./UserAuthToggle";

const formSchema = z.object({
	email: z.string().email({ message: "Enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);
	const form = useForm<UserFormValue>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "", password: "" },
	});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		setError(null);
		const formData = new FormData(event.currentTarget);
		// try {
		// 	const result = isSignUp ? await signUp(formData) : await signIn(formData);
		// 	if (result.status === "success") {
		// 		isSignUp ? setIsSignUp(false) : router.push("/dashboard");
		// 	} else {
		// 		setError(result.status);
		// 	}
		// } catch (err) {
		// 	setError(
		// 		err instanceof Error ? err.message : "An unknown error occurred",
		// 	);
		// } finally {
		// 	setLoading(false);
		// }
	};

	return (
		<Form form={form}>
			<form onSubmit={handleSubmit} className="w-full space-y-4">
				<UserAuthErrorMessage error={error} />
				<UserAuthEmailField loading={loading} />
				<UserAuthPasswordField loading={loading} />
				<UserAuthOAuthButtons />
				<UserAuthSubmitButton loading={loading} isSignUp={isSignUp} />
				<UserAuthToggle
					isSignUp={isSignUp}
					setIsSignUp={setIsSignUp}
					loading={loading}
				/>
			</form>
		</Form>
	);
}
