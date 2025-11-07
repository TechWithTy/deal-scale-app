/**
 * Zustand Store Optimization Utilities
 *
 * Provides helpers and patterns for optimal Zustand store performance:
 * - Selector patterns to prevent unnecessary re-renders
 * - Shallow comparison utilities
 * - Persistence middleware
 * - DevTools integration
 *
 * @see https://github.com/pmndrs/zustand
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

/**
 * Re-export shallow for convenient imports
 * Use this for selecting multiple values from store
 *
 * @example
 * ```tsx
 * import { shallow } from '@/lib/stores/utils/createOptimizedStore';
 *
 * const { name, email } = useUserStore(
 *   state => ({ name: state.name, email: state.email }),
 *   shallow
 * );
 * ```
 */
export { shallow };

/**
 * Creates an optimized Zustand store with DevTools in development
 *
 * @example
 * ```tsx
 * interface UserState {
 *   name: string;
 *   email: string;
 *   setName: (name: string) => void;
 * }
 *
 * export const useUserStore = createOptimizedStore<UserState>(
 *   'UserStore',
 *   (set) => ({
 *     name: '',
 *     email: '',
 *     setName: (name) => set({ name }),
 *   })
 * );
 * ```
 */
export function createOptimizedStore<T>(
	name: string,
	initializer: (
		set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
		get: () => T,
	) => T,
) {
	const store = create<T>()(
		devtools(initializer, {
			name,
			enabled: process.env.NODE_ENV === "development",
		}),
	);

	return store;
}

/**
 * Creates a persisted Zustand store (saved to localStorage)
 * Useful for user preferences, UI state, etc.
 *
 * @example
 * ```tsx
 * export const usePreferencesStore = createPersistedStore<PreferencesState>(
 *   'PreferencesStore',
 *   'user-preferences', // localStorage key
 *   (set) => ({
 *     theme: 'system',
 *     sidebarCollapsed: false,
 *     setTheme: (theme) => set({ theme }),
 *   })
 * );
 * ```
 */
export function createPersistedStore<T>(
	name: string,
	storageKey: string,
	initializer: (
		set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
		get: () => T,
	) => T,
) {
	const store = create<T>()(
		devtools(
			persist(initializer, {
				name: storageKey,
			}),
			{
				name,
				enabled: process.env.NODE_ENV === "development",
			},
		),
	);

	return store;
}

/**
 * Selector helpers for optimal performance
 */
export const selectors = {
	/**
	 * Select a single value from store
	 * Prevents re-renders when other values change
	 *
	 * @example
	 * ```tsx
	 * const userName = useUserStore(selectors.one('name'));
	 * // Only re-renders when name changes
	 * ```
	 */
	one:
		<T, K extends keyof T>(key: K) =>
		(state: T) =>
			state[key],

	/**
	 * Select multiple values using shallow comparison
	 * Prevents re-renders when other values change
	 *
	 * @example
	 * ```tsx
	 * const { name, email } = useUserStore(
	 *   selectors.many(['name', 'email']),
	 *   shallow
	 * );
	 * ```
	 */
	many:
		<T, K extends keyof T>(keys: K[]) =>
		(state: T) => {
			return keys.reduce(
				(acc, key) => {
					acc[key] = state[key];
					return acc;
				},
				{} as Pick<T, K>,
			);
		},

	/**
	 * Select all values (use sparingly, can cause many re-renders)
	 *
	 * @example
	 * ```tsx
	 * const userState = useUserStore(selectors.all);
	 * ```
	 */
	all: <T>(state: T) => state,
};

/**
 * Performance monitoring utilities
 */
export const storeUtils = {
	/**
	 * Logs store updates for debugging
	 * Only active in development
	 */
	logUpdates: <T>(storeName: string, prev: T, next: T) => {
		if (process.env.NODE_ENV === "development") {
			console.group(`🔄 ${storeName} Update`);
			console.log("Previous:", prev);
			console.log("Next:", next);
			console.groupEnd();
		}
	},

	/**
	 * Measures selector performance
	 * Useful for identifying slow selectors
	 */
	measureSelector: <T, R>(name: string, selector: (state: T) => R) => {
		return (state: T): R => {
			if (process.env.NODE_ENV === "development") {
				const start = performance.now();
				const result = selector(state);
				const end = performance.now();
				if (end - start > 1) {
					// Log if selector takes > 1ms
					console.warn(
						`⚠️ Slow selector "${name}": ${(end - start).toFixed(2)}ms`,
					);
				}
				return result;
			}
			return selector(state);
		};
	},
};

/**
 * Best Practices Documentation
 *
 * ✅ DO:
 * - Use specific selectors to prevent unnecessary re-renders
 * - Use shallow comparison when selecting multiple values
 * - Split large stores into smaller, focused stores
 * - Use persist middleware for user preferences
 * - Use DevTools to debug store updates
 *
 * ❌ DON'T:
 * - Select the entire store unless necessary
 * - Create deeply nested state (keep it flat)
 * - Put derived state in the store (use selectors instead)
 * - Use stores for frequently changing values (use local state)
 *
 * @example Good Selector Usage:
 * ```tsx
 * // ❌ BAD: Re-renders on ANY store change
 * const user = useUserStore();
 *
 * // ✅ GOOD: Only re-renders when name changes
 * const userName = useUserStore(state => state.name);
 *
 * // ✅ GOOD: Only re-renders when name or email changes
 * const { name, email } = useUserStore(
 *   state => ({ name: state.name, email: state.email }),
 *   shallow
 * );
 * ```
 *
 * @example Derived State:
 * ```tsx
 * // ❌ BAD: Storing derived state
 * interface UserState {
 *   firstName: string;
 *   lastName: string;
 *   fullName: string; // DON'T store this
 * }
 *
 * // ✅ GOOD: Computing derived state
 * const fullName = useUserStore(
 *   state => `${state.firstName} ${state.lastName}`
 * );
 * ```
 */
