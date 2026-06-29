"use client";

import {
	type ApiErrorKind,
	PublicApiError,
	type PublicApiProfileSetup,
	type PublicApiUser,
	getCurrentUserProfile,
	getProfileSetup,
	getPublicApiSupportLabel,
	isProviderUnavailable,
} from "@/lib/api/public-api-client";
import { useEffect, useMemo, useState } from "react";

type ProfileState = {
	error: string | null;
	errorKind: ApiErrorKind | null;
	errorStatus: number | null;
	isProviderUnavailable: boolean;
	isLoading: boolean;
	profileSetup: PublicApiProfileSetup | null;
	user: PublicApiUser | null;
};

const INITIAL_STATE: ProfileState = {
	error: null,
	errorKind: null,
	errorStatus: null,
	isLoading: true,
	isProviderUnavailable: false,
	profileSetup: null,
	user: null,
};

export function usePublicApiProfile(token?: string) {
	const [state, setState] = useState<ProfileState>(INITIAL_STATE);
	const authToken = useMemo(() => token?.trim() || undefined, [token]);

	useEffect(() => {
		let isMounted = true;

		async function loadProfile() {
			setState((current) => ({
				...current,
				error: null,
				errorKind: null,
				errorStatus: null,
				isLoading: true,
				isProviderUnavailable: false,
			}));

			try {
				const [user, profileSetup] = await Promise.all([
					getCurrentUserProfile(authToken),
					getProfileSetup(authToken),
				]);

				if (isMounted) {
					setState({
						error: null,
						errorKind: null,
						errorStatus: null,
						isLoading: false,
						isProviderUnavailable: false,
						profileSetup,
						user,
					});
				}
			} catch (error) {
				if (isMounted) {
					const publicApiError = error instanceof PublicApiError ? error : null;

					setState({
						error: getPublicApiSupportLabel(error),
						errorKind: publicApiError?.kind ?? null,
						errorStatus: publicApiError?.status ?? null,
						isLoading: false,
						isProviderUnavailable: isProviderUnavailable(error),
						profileSetup: null,
						user: null,
					});
				}
			}
		}

		loadProfile();

		return () => {
			isMounted = false;
		};
	}, [authToken]);

	return state;
}
