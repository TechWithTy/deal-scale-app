import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

if (typeof global.ResizeObserver === "undefined") {
	type ObserverCallback = (
		entries: Array<ResizeObserverEntry>,
		observer: ResizeObserver,
	) => void;

	class MockResizeObserver {
		private readonly callback: ObserverCallback;

		constructor(callback: ObserverCallback) {
			this.callback = callback;
		}

		public observe(target?: Element) {
			const element = target as HTMLElement | undefined;
			const width =
				element?.clientWidth ??
				(Number.parseFloat(element?.style.width ?? "") || 800);
			const height =
				element?.clientHeight ??
				(Number.parseFloat(element?.style.height ?? "") || 400);

			this.callback(
				[
					{
						target: element as Element,
						contentRect: {
							x: 0,
							y: 0,
							width,
							height,
							top: 0,
							left: 0,
							right: width,
							bottom: height,
							toJSON() {
								return this;
							},
						} as DOMRectReadOnly,
					} as ResizeObserverEntry,
				],
				this as unknown as ResizeObserver,
			);
		}

		public unobserve() {}

		public disconnect() {}
	}

	// @ts-expect-error - assigning to global for test environment
	global.ResizeObserver = MockResizeObserver;
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener() {},
			removeListener() {},
			addEventListener() {},
			removeEventListener() {},
			dispatchEvent() {
				return false;
			},
		}),
	});
}

if (
	typeof window !== "undefined" &&
	typeof window.HTMLCanvasElement !== "undefined"
) {
	const canvasPrototype = window.HTMLCanvasElement.prototype;
	Object.defineProperty(canvasPrototype, "getContext", {
		configurable: true,
		writable: true,
		// Provide harmless stubs for both 2d and webgl contexts to keep canvas libs happy.
		value: function getContext(
			type: string,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			_options?: Record<string, any>,
		) {
			const noop = () => undefined;

			if (typeof type === "string" && type.toLowerCase().includes("webgl")) {
				const webglStub = {
					canvas: this,
					getParameter: () => 0,
					getExtension: () => null,
					enable: noop,
					disable: noop,
					clear: noop,
					clearColor: noop,
					viewport: noop,
					createShader: () => ({}),
					shaderSource: noop,
					compileShader: noop,
					getShaderParameter: () => true,
					getShaderInfoLog: () => "",
					createProgram: () => ({}),
					attachShader: noop,
					linkProgram: noop,
					getProgramParameter: () => true,
					getProgramInfoLog: () => "",
					useProgram: noop,
					getAttribLocation: () => 0,
					getUniformLocation: () => ({}),
					createBuffer: () => ({}),
					bindBuffer: noop,
					bufferData: noop,
					bufferSubData: noop,
					vertexAttribPointer: noop,
					enableVertexAttribArray: noop,
					disableVertexAttribArray: noop,
					drawArrays: noop,
					uniformMatrix4fv: noop,
					uniform1f: noop,
					uniform2f: noop,
					uniform3f: noop,
					uniform4f: noop,
					getContextAttributes: () => ({}),
				};

				return new Proxy(webglStub, {
					get(target, prop: keyof typeof webglStub) {
						if (prop in target) {
							return target[prop];
						}
						return noop;
					},
				});
			}

			return {
				canvas: this,
				fillRect: noop,
				clearRect: noop,
				getImageData: () => ({ data: [] }),
				putImageData: noop,
				createImageData: () => [],
				setTransform: noop,
				drawImage: noop,
				setLineDash: noop,
				getLineDash: () => [],
				lineTo: noop,
				beginPath: noop,
				moveTo: noop,
				closePath: noop,
				stroke: noop,
				strokeRect: noop,
				strokeText: noop,
				translate: noop,
				scale: noop,
				rotate: noop,
				arc: noop,
				fill: noop,
				fillText: noop,
				measureText: () => ({
					width: 0,
					actualBoundingBoxLeft: 0,
					actualBoundingBoxRight: 0,
				}),
				save: noop,
				restore: noop,
				transform: noop,
				resetTransform: noop,
				setLineDashOffset: noop,
				createLinearGradient: () => ({
					addColorStop: noop,
				}),
				createPattern: () => null,
			} as CanvasRenderingContext2D;
		},
	});
}

// Reset browser-like storage and timers between tests
beforeEach(() => {
	try {
		localStorage.clear();
	} catch {}
	try {
		sessionStorage.clear();
	} catch {}
	vi.clearAllMocks();
});

afterEach(() => {
	vi.useRealTimers();
});
