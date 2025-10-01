"use client";

import { useEffect } from "react";

const SUPADEMO_KEY =
	process.env.NEXT_PUBLIC_SUPADEMO_API_KEY ??
	"a33cc3cbcdf3550211416bbfcb0d9bccd45a3d07729246719b53b8e498a4a35c";

export function SupademoClient() {
	useEffect(() => {
		let cancelled = false;
		const variables = {
			email: "",
			name: "",
		};

		const initialise = () => {
			if (cancelled) return true;
			const supademo = window.Supademo;
			if (typeof supademo !== "function" || !SUPADEMO_KEY) return false;
			supademo(SUPADEMO_KEY, { variables });
			return true;
		};

		if (!initialise()) {
			const timer = window.setInterval(() => {
				if (initialise()) {
					window.clearInterval(timer);
				}
			}, 500);
			return () => {
				cancelled = true;
				window.clearInterval(timer);
			};
		}

		return () => {
			cancelled = true;
		};
	}, []);

	return null;
}

export default SupademoClient;
