import { Breadcrumbs } from "@/components/breadcrumbs";
import { MainProductForm } from "@/components/forms/steppers/product-form/MainProductForm";
import PageContainer from "@/components/layout/page-container";
import React from "react";
// Not used
const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "User", link: "/dashboard/user" },
	{ title: "Create", link: "/dashboard/user/create" },
];
export default function Page() {
	return (
		<PageContainer scrollable={true}>
			<div className="space-y-4">
				<Breadcrumbs items={breadcrumbItems} />
				<MainProductForm
					categories={[
						{ value: "shirts", label: "shirts" },
						{ value: "pants", label: "pants" },
					]}
					initialData={null}
					key={null}
				/>
			</div>
		</PageContainer>
	);
}
