import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, renderHook } from "@testing-library/react";
import { act } from "react";
import { LoginRevealScreen, useDemoRevealSeen, isDemoUser } from "@/components/demo/LoginRevealScreen";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
	useSession: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		motion: {
			div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
			img: ({ ...props }: any) => <img {...props} />,
			h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
		},
		AnimatePresence: ({ children }: any) => <>{children}</>,
	};
});

// Mock usePrefersReducedMotion
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
	__esModule: true,
	default: vi.fn(() => false),
}));

// Mock analytics
vi.mock("@/lib/analytics/demo", () => ({
	captureDemoEvent: vi.fn(),
}));

describe("LoginRevealScreen", () => {
	const mockOnContinue = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock localStorage
		Object.defineProperty(window, "localStorage", {
			value: {
				getItem: vi.fn(() => null),
				setItem: vi.fn(),
				removeItem: vi.fn(),
				clear: vi.fn(),
			},
			writable: true,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders company name and logo when provided", () => {
		render(
			<LoginRevealScreen
				companyName="Acme Realty"
				logoUrl="https://example.com/logo.png"
				demoConfig={{ companyName: "Acme Realty" }}
				onContinue={mockOnContinue}
				autoRedirectDelay={0}
			/>,
		);

		expect(screen.getByText(/We've styled your workspace for/i)).toBeInTheDocument();
		expect(screen.getByText("Acme Realty")).toBeInTheDocument();
		expect(screen.getByAltText("Acme Realty logo")).toBeInTheDocument();
	});

	it("renders theme preview card", () => {
		render(
			<LoginRevealScreen
				companyName="Test Company"
				demoConfig={{}}
				onContinue={mockOnContinue}
				autoRedirectDelay={0}
			/>,
		);

		const elements = screen.getAllByText(/Your AI Assistant is ready to help you scale/i);
		expect(elements.length).toBeGreaterThan(0);
	});

	it("calls onContinue when button is clicked", async () => {
		render(
			<LoginRevealScreen
				companyName="Test Company"
				demoConfig={{}}
				onContinue={mockOnContinue}
				autoRedirectDelay={0}
			/>,
		);

		// Wait for button to appear
		await waitFor(
			() => {
				const buttons = screen.getAllByRole("button", { name: /Enter Workspace/i });
				expect(buttons.length).toBeGreaterThan(0);
			},
			{ timeout: 3000 },
		);

		const buttons = screen.getAllByRole("button", { name: /Enter Workspace/i });
		buttons[0]?.click();

		await waitFor(() => {
			expect(mockOnContinue).toHaveBeenCalled();
		});
	});

	it("auto-redirects after delay", () => {
		vi.useFakeTimers();

		render(
			<LoginRevealScreen
				companyName="Test Company"
				demoConfig={{}}
				onContinue={mockOnContinue}
				autoRedirectDelay={1000}
			/>,
		);

		// Advance timers to trigger auto-redirect
		act(() => {
			vi.advanceTimersByTime(1500); // 1000ms delay + 400ms fade-out
		});

		// Verify the callback was called after the delay
		expect(mockOnContinue).toHaveBeenCalled();

		vi.useRealTimers();
	});

	it("does not auto-redirect when delay is 0", async () => {
		vi.useFakeTimers();

		render(
			<LoginRevealScreen
				companyName="Test Company"
				demoConfig={{}}
				onContinue={mockOnContinue}
				autoRedirectDelay={0}
			/>,
		);

		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(mockOnContinue).not.toHaveBeenCalled();

		vi.useRealTimers();
	});
});

describe("useDemoRevealSeen", () => {
	beforeEach(() => {
		Object.defineProperty(window, "localStorage", {
			value: {
				getItem: vi.fn(() => null),
				setItem: vi.fn(),
				removeItem: vi.fn(),
				clear: vi.fn(),
			},
			writable: true,
		});
	});

	it("returns false initially when localStorage has no value", () => {
		const { result } = renderHook(() => useDemoRevealSeen());
		// Initial state is false before effect runs
		expect(result.current[0]).toBe(false);
	});

	it("marks reveal as seen and updates localStorage", () => {
		const setItem = vi.fn();
		Object.defineProperty(window, "localStorage", {
			value: {
				getItem: vi.fn(() => null),
				setItem,
				removeItem: vi.fn(),
				clear: vi.fn(),
			},
			writable: true,
		});

		const { result } = renderHook(() => useDemoRevealSeen());
		const [, markAsSeen] = result.current;

		act(() => {
			markAsSeen();
		});

		expect(setItem).toHaveBeenCalledWith("demoRevealSeen", "true");
		expect(result.current[0]).toBe(true);
	});
});

describe("isDemoUser", () => {
	it("returns true when session has demoConfig", () => {
		const session = {
			user: {
				demoConfig: {
					companyName: "Test Company",
				},
			},
		};

		expect(isDemoUser(session as any)).toBe(true);
	});

	it("returns false when session has no demoConfig", () => {
		const session = {
			user: {},
		};

		expect(isDemoUser(session as any)).toBe(false);
	});

	it("returns false when session is null", () => {
		expect(isDemoUser(null)).toBe(false);
	});
});

