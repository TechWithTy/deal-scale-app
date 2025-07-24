"use client";

import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
// ! useUsageData: Custom hook for fetching usage/subscription data
import { useEffect, useState } from "react";

export const useUsageData = () => {
	const [data, setData] = useState<UserProfileSubscription | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// todo: Replace with real API call
		setTimeout(() => {
			setData(mockUserProfile.subscription);
			setLoading(false);
		}, 1000);
	}, []);

	return { data, loading };
};
