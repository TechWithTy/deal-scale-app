"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const AutoFormExternal = dynamic(
	() =>
		import(
			"@/external/interactive-avatar-nextjs-demo/components/forms/AutoForm"
		).then((mod) => mod.AutoForm as ComponentType<any>),
	{ ssr: false },
);

export const AutoForm = AutoFormExternal as ComponentType<any>;

export default AutoForm;
