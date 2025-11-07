/// <reference types="vite/client" />

declare module "virtual:pwa-register/react" {
	interface RegisterSWOptions {
		immediate?: boolean;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: Error) => void;
	}

interface RegisterSWResult {
	needRefresh: boolean;
	offlineReady: boolean;
		updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	export function useRegisterSW(options?: RegisterSWOptions): RegisterSWResult;
}