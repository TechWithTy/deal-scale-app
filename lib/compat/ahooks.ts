import { useCallback, useEffect, useRef } from "react";

export function useMemoizedFn<T extends (...args: never[]) => unknown>(fn: T) {
	const fnRef = useRef(fn);

	fnRef.current = fn;

	return useCallback(
		((...args: Parameters<T>) => fnRef.current(...args)) as T,
		[],
	);
}

export function useUnmount(fn: () => void) {
	useEffect(() => fn, [fn]);
}

export function useKeyPress(key: string, handler: () => void) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === key.toLowerCase()) {
				handler();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [handler, key]);
}
