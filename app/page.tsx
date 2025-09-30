import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
	const session = await auth();

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<h1
					style={{
						fontSize: "2.5rem",
						fontWeight: "bold",
						marginBottom: "1rem",
					}}
				>
					Deal Scale
				</h1>
				<p
					style={{
						fontSize: "1.125rem",
						color: "#6b7280",
						marginBottom: "2rem",
					}}
				>
					Real Estate Lead Generation Platform
				</p>
				<a
					href="/dashboard"
					style={{
						backgroundColor: "#3b82f6",
						color: "white",
						padding: "0.75rem 1.5rem",
						borderRadius: "0.375rem",
						textDecoration: "none",
					}}
				>
					Enter Dashboard
				</a>
			</div>
		</div>
	);
}
