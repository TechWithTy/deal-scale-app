// import { Form } from "@/components/ui/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import * as z from "zod";
// import { UserAuthEmailField } from "./steps/UserAuthEmailField";
// import { UserAuthErrorMessage } from "./steps/UserAuthErrorMessage";
// import { UserAuthPasswordField } from "./steps/UserAuthPasswordField";
// import { UserAuthSubmitButton } from "./steps/UserAuthSubmitButton";

// const formSchema = z.object({
// 	email: z.string().email({ message: "Enter a valid email address" }),
// 	password: z.string().min(1, { message: "Password is required" }),
// });

// type UserFormValue = z.infer<typeof formSchema>;

// export default function MainUserAuthForm() {
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState<string | null>(null);
// 	const router = useRouter();

// 	const form = useForm<UserFormValue>({
// 		resolver: zodResolver(formSchema),
// 		defaultValues: { email: "", password: "" },
// 	});

// 	const onSubmit = async (data: UserFormValue) => {
// 		setLoading(true);
// 		setError(null);

// 		try {
// 			const result = await signIn("credentials", {
// 				redirect: false,
// 				email: data.email,
// 				password: data.password,
// 			});

// 			if (result?.error) {
// 				setError("Invalid email or password");
// 			} else {
// 				router.push("/dashboard");
// 			}
// 		} catch (err) {
// 			setError(err instanceof Error ? err.message : "An error occurred");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="mx-auto w-full max-w-md space-y-6">
// 			<FormProvider {...form}>
// 				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
// 					<UserAuthErrorMessage error={error} />
// 					<UserAuthEmailField loading={loading} />
// 					<UserAuthPasswordField loading={loading} />
// 					<UserAuthSubmitButton loading={loading} isSignUp={false} />
// 				</form>
// 			</FormProvider>
// 		</div>
// 	);
// }

