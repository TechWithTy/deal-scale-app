import { redirect } from "next/navigation";

export default async function PrivatePage() {
	redirect("/login");

	return <p>Hello</p>;
}
