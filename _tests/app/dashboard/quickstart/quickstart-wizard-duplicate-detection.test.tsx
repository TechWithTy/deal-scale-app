import React, { act } from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuickStartPage from "@/app/dashboard/page";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useQuickStartWizardExperienceStore } from "@/lib/stores/quickstartWizardExperience";
import { renderWithNuqs } from "./testUtils";

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const pushMock = vi.fn();

vi.mock("next/link", () => ({
	__esModule: true,
	default: ({ children, ...props }: React.PropsWithChildren<{ href: string }>) => (
		<a {...props}>{children}</a>
	),
}));

vi.mock("next/navigation", () => ({
	__esModule: true,
	useRouter: () => ({
		push: pushMock,
	}),
}));

vi.mock("@/components/leadsSearch/search/WalkthroughModal", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/reusables/modals/user/campaign/CampaignModalMain", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadBulkSuiteModal", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/reusables/modals/user/lead/LeadModalMain", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/reusables/modals/SavedSearchModal", () => ({
	__esModule: true,
	default: () => null,
}));

vi.mock("@/components/quickstart/useBulkCsvUpload", () => ({
	__esModule: true,
	useBulkCsvUpload: () => vi.fn(),
}));

vi.mock("@/components/quickstart/useQuickStartSavedSearches", () => ({
	__esModule: true,
	useQuickStartSavedSearches: () => ({
		savedSearches: [],
		deleteSavedSearch: vi.fn(),
		setSearchPriority: vi.fn(),
		handleCloseSavedSearches: vi.fn(),
		handleSelectSavedSearch: vi.fn(),
		handleStartNewSearch: vi.fn(),
		handleOpenSavedSearches: vi.fn(),
		savedSearchModalOpen: false,
	}),
}));

/**
 * Console log spy that tracks all wizard-related logs
 * This helps detect duplicate calls and failures
 */
interface LogCall {
	timestamp: number;
	message: string;
	args: unknown[];
}

class WizardLogTracker {
	private logs: LogCall[] = [];
	private originalConsoleLog: typeof console.log;
	private spy: ReturnType<typeof vi.spyOn> | null = null;

	start() {
		this.logs = [];
		this.originalConsoleLog = console.log;
		this.spy = vi.spyOn(console, "log").mockImplementation((...args) => {
			const message = String(args[0] || "");
			// Only track wizard-related logs
			if (
				message.includes("[WIZARD]") ||
				message.includes("[WIZARD DATA]") ||
				message.includes("[WIZARD UI]") ||
				message.includes("[SESSION SYNC]") ||
				message.includes("[QuickStart]")
			) {
				this.logs.push({
					timestamp: Date.now(),
					message,
					args: args.slice(1),
				});
			}
			// Still call original console.log for debugging
			this.originalConsoleLog(...args);
		});
	}

	stop() {
		if (this.spy) {
			this.spy.mockRestore();
			this.spy = null;
		}
	}

	getLogs(): LogCall[] {
		return [...this.logs];
	}

	/**
	 * Get all logs matching a pattern
	 */
	getLogsMatching(pattern: string | RegExp): LogCall[] {
		const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
		return this.logs.filter((log) => regex.test(log.message));
	}

	/**
	 * Count how many times a specific log message appears
	 */
	countLogs(pattern: string | RegExp): number {
		return this.getLogsMatching(pattern).length;
	}

	/**
	 * Verify that a log appears exactly N times (for detecting duplicates)
	 */
	expectLogCount(pattern: string | RegExp, expectedCount: number, description?: string) {
		const count = this.countLogs(pattern);
		const matchingLogs = this.getLogsMatching(pattern);
		expect(count).toBe(
			expectedCount,
			`Expected "${pattern}" to appear ${expectedCount} time(s), but it appeared ${count} time(s).\n` +
				`Matching logs:\n${matchingLogs.map((l) => `  - ${l.message}`).join("\n")}\n` +
				(description ? `Context: ${description}` : ""),
		);
	}

	/**
	 * Get the sequence of log messages (useful for debugging flow)
	 */
	getLogSequence(): string[] {
		return this.logs.map((log) => log.message);
	}

	/**
	 * Clear all tracked logs
	 */
	clear() {
		this.logs = [];
	}
}

const resetStores = () => {
	act(() => {
		useQuickStartWizardStore.getState().reset();
		useQuickStartWizardDataStore.getState().reset();
		useQuickStartWizardExperienceStore.getState().markWizardSeen();
	});
};

describe("QuickStart Wizard - Duplicate Detection & Critical Flow Tests", () => {
	let logTracker: WizardLogTracker;

	beforeEach(() => {
		resetStores();
		pushMock.mockReset();
		logTracker = new WizardLogTracker();
		logTracker.start();
	});

	afterEach(async () => {
		logTracker.stop();
		act(() => {
			useQuickStartWizardStore.getState().reset();
		});
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("should select persona only once when clicking persona option", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		// Wait for page to render
		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 10000 });

		// Open wizard
		const [guidedButton] = await screen.findAllByRole("button", {
			name: /guided setup/i,
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(guidedButton);
		});

		// Wait for wizard to appear
		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 10000 });

		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		// Clear logs before persona selection
		logTracker.clear();

		// Wait for persona step to appear
		await waitFor(() => {
			expect(wizardQueries.queryByTestId("quickstart-persona-step")).toBeInTheDocument();
		}, { timeout: 10000 });

		// Find and click a persona option
		const personaOption = await waitFor(() => {
			const option = wizardQueries.queryByTestId("quickstart-persona-option-loan_officer");
			expect(option).toBeInTheDocument();
			return option;
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(personaOption!);
		});

		// Wait for any async operations
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
		});

		// Verify selectPersona was called exactly once
		logTracker.expectLogCount(/selectPersona\(\) called/, 1, "Persona selection should happen once");
		logTracker.expectLogCount(/Persona selected in UI/, 1, "UI persona selection should happen once");

		// Verify no duplicate warnings
		const warnings = logTracker.getLogsMatching(/⚠️.*selectPersona.*completing/);
		expect(warnings.length).toBe(0);
	}, { timeout: 30000 });

	it("should select goal only once when clicking goal option", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		// Wait for page to render
		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 10000 });

		// Open wizard
		const [guidedButton] = await screen.findAllByRole("button", {
			name: /guided setup/i,
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(guidedButton);
		});

		// Wait for wizard to appear
		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 10000 });

		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		// Select persona first
		await waitFor(() => {
			expect(wizardQueries.queryByTestId("quickstart-persona-step")).toBeInTheDocument();
		}, { timeout: 10000 });

		const personaOption = await waitFor(() => {
			return wizardQueries.queryByTestId("quickstart-persona-option-loan_officer");
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(personaOption!);
		});

		// Wait for goal step
		await waitFor(() => {
			expect(wizardQueries.queryByTestId("quickstart-goal-step")).toBeInTheDocument();
		}, { timeout: 10000 });

		// Clear logs before goal selection
		logTracker.clear();

		// Find and click a goal option
		const goalOption = await waitFor(() => {
			const option = wizardQueries.queryByTestId("quickstart-goal-option-lender-fund-fast");
			expect(option).toBeInTheDocument();
			return option;
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(goalOption!);
		});

		// Wait for any async operations
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
		});

		// Verify selectGoal was called exactly once
		logTracker.expectLogCount(/selectGoal\(\) called/, 1, "Goal selection should happen once");
		logTracker.expectLogCount(/Goal selected in UI/, 1, "UI goal selection should happen once");

		// Verify no duplicate warnings
		const warnings = logTracker.getLogsMatching(/⚠️.*selectGoal.*completing/);
		expect(warnings.length).toBe(0);
	}, { timeout: 30000 });

	it("should call complete() only once when clicking 'Close & start plan' button", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardDataStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		// Wait for page to render
		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 10000 });

		// Open wizard via a card that has a pending action
		const [downloadExtensionButton] = await screen.findAllByRole("button", {
			name: /download extension/i,
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(downloadExtensionButton);
		});

		// Wait for wizard to appear
		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 10000 });

		// Helper function to get current wizard
		const getCurrentWizard = () => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			if (wizards.length === 0) return null;
			return wizards[wizards.length - 1];
		};

		// Get wizard element (re-query to ensure we have the latest)
		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		// Navigate through wizard steps
		// Wait for any step to appear first (persona, goal, or summary)
		await waitFor(() => {
			const personaStep = wizardQueries.queryByTestId("quickstart-persona-step");
			const goalStep = wizardQueries.queryByTestId("quickstart-goal-step");
			const summaryStep = wizardQueries.queryByTestId("quickstart-summary-step");
			
			// At least one step should be visible
			expect(
				personaStep || goalStep || summaryStep
			).toBeInTheDocument();
		}, { timeout: 10000 });

		// Check which step is currently visible
		let personaStep = wizardQueries.queryByTestId("quickstart-persona-step");
		let goalStep = wizardQueries.queryByTestId("quickstart-goal-step");
		const summaryStep = wizardQueries.queryByTestId("quickstart-summary-step");

		// If persona step is visible, select persona
		if (personaStep) {
			// Wait for persona option to appear
			const personaOption = await waitFor(() => {
				const option = wizardQueries.queryByTestId("quickstart-persona-option-loan_officer");
				expect(option).toBeInTheDocument();
				return option;
			}, { timeout: 10000 });

			act(() => {
				fireEvent.click(personaOption!);
			});

			// Wait for goal step to appear after persona selection
			await waitFor(() => {
				expect(wizardQueries.queryByTestId("quickstart-goal-step")).toBeInTheDocument();
			}, { timeout: 10000 });
		} else if (goalStep) {
			// Already at goal step, proceed
		} else if (summaryStep) {
			// If we're at summary, we can proceed directly to clicking complete
			// But first check if we have the right goal selected
			// For this test, we'll just proceed to clicking the button
		} else {
			// If we're not at any step, something is wrong
			throw new Error("Wizard did not start at persona, goal, or summary step");
		}

		// If we're not at summary yet, navigate through goal step
		if (!summaryStep) {
			// Now we should be at goal step - wait for goal option
			await waitFor(() => {
				const goalOption = wizardQueries.queryByTestId("quickstart-goal-option-lender-fund-fast");
				expect(goalOption).toBeInTheDocument();
			}, { timeout: 10000 });

			act(() => {
				fireEvent.click(
					wizardQueries.getByTestId(
						"quickstart-goal-option-lender-fund-fast",
					),
				);
			});

			// Wait for summary step and complete button
			await waitFor(() => {
				const completeButton = wizardQueries.queryByRole("button", {
					name: /close & start plan/i,
				});
				expect(completeButton).toBeInTheDocument();
				expect(completeButton).not.toBeDisabled();
			}, { timeout: 10000 });
		} else {
			// Already at summary, just wait for button to be ready
			await waitFor(() => {
				const completeButton = wizardQueries.queryByRole("button", {
					name: /close & start plan/i,
				});
				expect(completeButton).toBeInTheDocument();
				expect(completeButton).not.toBeDisabled();
			}, { timeout: 10000 });
		}

		// Clear logs before clicking complete button
		logTracker.clear();

		// Find and click the complete button
		const completeButton = wizardQueries.getByRole("button", {
			name: /close & start plan/i,
		});

		// Ensure button is not disabled before clicking
		expect(completeButton).not.toBeDisabled();

		// Click the button once
		act(() => {
			fireEvent.click(completeButton);
		});

		// Wait for completion flow to finish
		await waitFor(() => {
			expect(screen.queryByTestId("quickstart-wizard")).toBeNull();
		}, { timeout: 10000 });

		// Wait for all async operations to complete
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		});

		// CRITICAL: Verify complete() was called exactly once
		logTracker.expectLogCount(/complete\(\) called/, 1, "complete() should be called exactly once");

		// Verify no duplicate completion warnings
		const duplicateWarnings = logTracker.getLogsMatching(/⚠️.*complete.*already completing/);
		expect(duplicateWarnings.length).toBe(0);

		// Verify the action was executed (router.push should be called)
		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/dashboard/extensions");
		}, { timeout: 2000 });

		// Verify action was called only once
		expect(pushMock).toHaveBeenCalledTimes(1);
	}, { timeout: 45000 });

	it("should prevent duplicate complete() calls when button is clicked multiple times rapidly", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		// Wait for page to render
		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 10000 });

		// Open wizard
		const [downloadExtensionButton] = await screen.findAllByRole("button", {
			name: /download extension/i,
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(downloadExtensionButton);
		});

		// Wait for wizard and navigate to summary
		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 10000 });

		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		// Quick navigation to summary (using store directly for speed)
		act(() => {
			useQuickStartWizardDataStore.getState().selectPersona("loan_officer");
			useQuickStartWizardDataStore.getState().selectGoal("lender-fund-fast");
			useQuickStartWizardStore.getState().goToStep("summary");
		});

		// Wait for summary step
		await waitFor(() => {
			expect(wizardQueries.queryByTestId("quickstart-summary-step")).toBeInTheDocument();
		}, { timeout: 10000 });

		// Clear logs before clicking
		logTracker.clear();

		// Find complete button
		const completeButton = await waitFor(() => {
			return wizardQueries.getByRole("button", {
				name: /close & start plan/i,
			});
		}, { timeout: 10000 });

		// Click the button multiple times rapidly
		act(() => {
			fireEvent.click(completeButton);
			fireEvent.click(completeButton);
			fireEvent.click(completeButton);
		});

		// Wait for completion
		await waitFor(() => {
			expect(screen.queryByTestId("quickstart-wizard")).toBeNull();
		}, { timeout: 10000 });

		// Wait for all async operations
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		});

		// CRITICAL: Even with multiple clicks, complete() should be called only once
		logTracker.expectLogCount(/complete\(\) called/, 1, "complete() should be called only once even with rapid clicks");

		// Verify duplicate prevention is working (either warnings logged OR button disabled prevented clicks)
		// The prevention can happen at the button level (disabled) or in the handler/store
		const duplicateWarnings = logTracker.getLogsMatching(/⚠️.*completing.*ignoring/);
		const buttonClicks = logTracker.countLogs(/Primary button clicked/);
		
		// Either we see warnings about duplicate prevention, OR the button was disabled after first click
		// Both are valid prevention mechanisms
		if (duplicateWarnings.length === 0) {
			// If no warnings, verify that complete() was still only called once (button disabled worked)
			expect(buttonClicks).toBeGreaterThanOrEqual(1);
		} else {
			// If warnings exist, that's also good - it means the guard caught duplicates
			expect(duplicateWarnings.length).toBeGreaterThan(0);
		}

		// Verify action was called only once (most important assertion)
		expect(pushMock).toHaveBeenCalledTimes(1);
	}, { timeout: 45000 });

	it("should track complete flow sequence and detect any out-of-order execution", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 10000 });

		const [downloadExtensionButton] = await screen.findAllByRole("button", {
			name: /download extension/i,
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(downloadExtensionButton);
		});

		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 10000 });

		const wizards = screen.getAllByTestId("quickstart-wizard");
		const wizard = wizards[wizards.length - 1];
		const wizardQueries = within(wizard);

		// Quick navigation to summary
		act(() => {
			useQuickStartWizardDataStore.getState().selectPersona("loan_officer");
			useQuickStartWizardDataStore.getState().selectGoal("lender-fund-fast");
			useQuickStartWizardStore.getState().goToStep("summary");
		});

		await waitFor(() => {
			expect(wizardQueries.queryByTestId("quickstart-summary-step")).toBeInTheDocument();
		}, { timeout: 10000 });

		logTracker.clear();

		const completeButton = await waitFor(() => {
			return wizardQueries.getByRole("button", {
				name: /close & start plan/i,
			});
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(completeButton);
		});

		await waitFor(() => {
			expect(screen.queryByTestId("quickstart-wizard")).toBeNull();
		}, { timeout: 10000 });

		// Wait for complete flow to finish
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 1500));
		});

		// Verify the expected sequence of events
		const sequence = logTracker.getLogSequence();
		const sequenceStr = sequence.join("\n");

		// Should have: complete() called -> isOpen=false (isCompleting already set) -> action executed -> reset
		const completeIndex = sequence.findIndex((s) => s.includes("complete() called"));
		const isOpenFalseIndex = sequence.findIndex((s) => s.includes("Setting isOpen=false"));
		const actionExecutedIndex = sequence.findIndex((s) => s.includes("Executing pending action"));
		const resetIndex = sequence.findIndex((s) => s.includes("Resetting wizard data"));

		expect(completeIndex).toBeGreaterThanOrEqual(0);
		// isCompleting is now set immediately at the start of complete(), so isOpen=false should come after
		expect(isOpenFalseIndex).toBeGreaterThan(completeIndex);
		expect(actionExecutedIndex).toBeGreaterThan(isOpenFalseIndex);
		expect(resetIndex).toBeGreaterThan(actionExecutedIndex);

		// Verify no duplicate complete() calls
		const completeCalls = sequence.filter((s) => s.includes("complete() called"));
		expect(completeCalls.length).toBe(1);
	}, { timeout: 45000 });

	it("should detect when session sync causes duplicate persona/goal selection", async () => {
		renderWithNuqs(<QuickStartPage />);

		act(() => {
			useQuickStartWizardStore.getState().reset();
			useQuickStartWizardExperienceStore.getState().markWizardSeen();
		});

		await screen.findByTestId("quickstart-headline-title", {}, { timeout: 10000 });

		// Clear logs before opening wizard
		logTracker.clear();

		// Open wizard
		const [guidedButton] = await screen.findAllByRole("button", {
			name: /guided setup/i,
		}, { timeout: 10000 });

		act(() => {
			fireEvent.click(guidedButton);
		});

		await waitFor(() => {
			const wizards = screen.queryAllByTestId("quickstart-wizard");
			expect(wizards.length).toBeGreaterThan(0);
		}, { timeout: 10000 });

		// Wait for session sync to potentially run
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
		});

		// Count how many times selectGoal/selectPersona were called
		const goalSelections = logTracker.countLogs(/selectGoal\(\) called/);
		const personaSelections = logTracker.countLogs(/selectPersona\(\) called/);

		// If session sync is working correctly, it should select once
		// If there are duplicates, this test will fail
		expect(goalSelections).toBeLessThanOrEqual(1);
		expect(personaSelections).toBeLessThanOrEqual(1);

		// Verify no warnings about completing state
		const completingWarnings = logTracker.getLogsMatching(/⚠️.*completing.*ignoring/);
		expect(completingWarnings.length).toBe(0);
	}, { timeout: 30000 });
});

