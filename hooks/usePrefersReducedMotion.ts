"use client";

import { useEffect, useState } from "react";

export const usePrefersReducedMotion = (): boolean => {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setPrefersReducedMotion(query.matches);

		update();
		query.addEventListener("change", update);

		return () => {
			query.removeEventListener("change", update);
		};
	}, []);

	return prefersReducedMotion;
};

export default usePrefersReducedMotion;
