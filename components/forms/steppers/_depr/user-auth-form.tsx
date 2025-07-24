// "use client";

// import { signIn, signInWithOAuth, signUp } from "@/actions/auth";
// import { Button } from "@/components/ui/button";
// import {
// 	Form,
// 	FormControl,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState, useTransition } from "react";
// import { useForm } from "react-hook-form";
// import { LinkedInLoginButton } from "react-social-login-buttons";
// import * as z from "zod";

// const formSchema = z.object({
// 	email: z.string().email({ message: "Enter a valid email address" }),
// 	password: z
// 		.string()
// 		.min(6, { message: "Password must be at least 6 characters" }),
// });

// type UserFormValue = z.infer<typeof formSchema>;

// export default function UserAuthForm() {
// 	const router = useRouter(); // ✅ Initialize Next.js router
// 	const [isPending, startTransition] = useTransition();
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState<string | null>(null);
// 	const [isSignUp, setIsSignUp] = useState(false);
// 	const supabase = createClientComponentClient(); // Supabase client
// 	const form = useForm<UserFormValue>({
// 		resolver: zodResolver(formSchema),
// 		defaultValues: {
// 			email: "",
// 			password: "",
// 		},
// 	});

// 	// const onSubmit = async (data: UserFormValue) => {
// 	//   setLoading(true);
// 	//   setError(null);

// 	//   try {
// 	//     const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${
// 	//       isSignUp ? 'signup' : 'login'
// 	//     }`;

// 	//     const response = await fetch(endpoint, {
// 	//       method: 'POST',
// 	//       headers: {
// 	//         'Content-Type': 'application/json',
// 	//         Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
// 	//       },
// 	//       body: JSON.stringify({ email: data.email, password: data.password })
// 	//     });

// 	//     const result = await response.json();
// 	//     if (!response.ok)
// 	//       throw new Error(result.error || 'Authentication failed');

// 	//     alert(
// 	//       isSignUp ? 'Signup successful! Check your email.' : 'Login successful!'
// 	//     );

// 	//     // ✅ Ensure redirect happens only after success
// 	//     router.replace('/dashboard');
// 	//   } catch (err) {
// 	//     setError(
// 	//       err instanceof Error ? err.message : 'An unknown error occurred'
// 	//     );
// 	//     console.error('Authentication Error:', err);
// 	//   } finally {
// 	//     setLoading(false);
// 	//   }
// 	// };
// 	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
// 		event.preventDefault();
// 		setLoading(true);
// 		setError(null);

// 		const formData = new FormData(event.currentTarget);

// 		try {
// 			const result = isSignUp ? await signUp(formData) : await signIn(formData); // ✅ Calls signUp function

// 			if (result.status === "success") {
// 				isSignUp ? setIsSignUp(false) : router.push("/dashboard");
// 			} else {
// 				setError(result.status); // ✅ Handle authentication errors
// 			}
// 		} catch (err) {
// 			setError(
// 				err instanceof Error ? err.message : "An unknown error occurred",
// 			);
// 			console.error("Authentication Error:", err);
// 		}

// 		setLoading(false);
// 	};

// 	const handleLinkedInLogin = () => {
// 		startTransition(async () => {
// 			try {
// 				console.log("📢 Initiating LinkedIn Login");
// 				await signInWithOAuth();
// 				console.log("✅ LinkedIn Login Successful");
// 			} catch (error) {
// 				console.error("❌ LinkedIn Login Error:", error);
// 			}
// 		});
// 	};

// 	return (
// 		<div className="w-full space-y-4">
// 			<h2 className="text-center font-semibold text-xl">
// 				{isSignUp ? "Sign Up" : "Log In"}
// 			</h2>

// 			<Form {...form}>
// 				<form onSubmit={handleSubmit} className="w-full space-y-2">
// 					<FormField
// 						control={form.control}
// 						name="email"
// 						render={({ field }) => (
// 							<FormItem>
// 								<FormLabel>Email</FormLabel>
// 								<FormControl>
// 									<Input
// 										type="email"
// 										placeholder="Enter your email..."
// 										disabled={loading}
// 										{...field}
// 									/>
// 								</FormControl>
// 								<FormMessage />
// 							</FormItem>
// 						)}
// 					/>
// 					<FormField
// 						control={form.control}
// 						name="password"
// 						render={({ field }) => (
// 							<FormItem>
// 								<FormLabel>Password</FormLabel>
// 								<FormControl>
// 									<Input
// 										type="password"
// 										placeholder="Enter your password..."
// 										disabled={loading}
// 										{...field}
// 									/>
// 								</FormControl>
// 								<FormMessage />
// 							</FormItem>
// 						)}
// 					/>

// 					{error && <p className="text-red-500 text-sm">{error}</p>}

// 					<Button disabled={loading} className="ml-auto w-full" type="submit">
// 						{loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
// 					</Button>
// 				</form>
// 			</Form>

// 			{/* LinkedIn Login Button */}
// 			<LinkedInLoginButton onClick={handleLinkedInLogin} disabled={loading}>
// 				<span>{isPending ? "Redirecting..." : "Log In with LinkedIn"}</span>
// 			</LinkedInLoginButton>

// 			<div className="text-center">
// 				<p className="text-sm">
// 					{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
// 					<button
// 						className="mx-2 text-primary underline"
// 						onClick={() => setIsSignUp(!isSignUp)}
// 					>
// 						{isSignUp ? "Log In" : "Sign Up"}
// 					</button>
// 				</p>
// 			</div>
// 			{!isSignUp && (
// 				<div className="text-center">
// 					<p className="text-sm">
// 						Forgot Password?
// 						<Link
// 							className="mx-2 text-primary underline"
// 							href={"/forgot-password"}
// 						>
// 							Reset password
// 						</Link>
// 					</p>
// 				</div>
// 			)}
// 		</div>
// 	);
// }
