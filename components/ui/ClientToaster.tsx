"use client";

import React from "react";
import { Toaster } from "./sonner";

const ClientToaster: React.FC = () => {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	if (!mounted) return null;
	return <Toaster />;
};

export default ClientToaster;
