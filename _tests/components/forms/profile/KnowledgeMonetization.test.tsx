import type React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { SalesScriptManager } from "@/components/forms/steppers/profile-form/steps/knowledge/SalesScriptManager";
import { VoiceManager } from "@/components/forms/steppers/profile-form/steps/knowledge/VoiceManager";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

vi.mock("@/components/ui/switch", () => ({
	Switch: ({
		checked,
		onCheckedChange,
		id,
		...rest
	}: {
		checked: boolean;
		onCheckedChange: (value: boolean) => void;
		id?: string;
	}) => (
		<input
			type="checkbox"
			role="switch"
			id={id}
			checked={checked}
			onChange={(event) => onCheckedChange(event.target.checked)}
			{...rest}
		/>
	),
}));

vi.mock("@/components/ui/select", () => {
	const Select = ({
		children,
		onValueChange,
		value,
	}: {
		children: React.ReactNode;
		onValueChange?: (value: string) => void;
		value?: string;
	}) => (
		<select
			value={value}
			onChange={(event) => onValueChange?.(event.target.value)}
			data-testid="monetization-select"
		>
			{children}
		</select>
	);

	const SelectContent = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	const SelectItem = ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: string;
	}) => <option value={value}>{children}</option>;
	const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	);
	const SelectValue = ({ placeholder }: { placeholder?: string }) => (
		<>{placeholder}</>
	);

	return {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue,
	};
});

vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	),
}));

vi.mock("@/components/ui/tooltip", () => ({
	TooltipProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	TooltipContent: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock("@/components/ui/input", () => ({
	Input: ({ ...props }) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
	Textarea: ({ ...props }) => <textarea {...props} />,
}));

vi.mock("@/components/access/FeatureGuard", () => ({
	FeatureGuard: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock("@/external/teleprompter-modal", () => ({
	CloneModal: ({
		onSave,
		open,
		onClose,
	}: {
		onSave: (blob: Blob) => void;
		onClose: () => void;
		open: boolean;
	}) =>
		open ? (
			<button
				type="button"
				onClick={() => {
					onSave(new Blob());
					onClose();
				}}
			>
				Save Clone
			</button>
		) : null,
}));

vi.mock(
	"@/components/forms/steppers/profile-form/steps/knowledge/voice/VoicemailModal",
	() => ({
		__esModule: true,
		default: ({
			onSave,
			onClose,
			open,
		}: {
			onSave: (blob: Blob) => void;
			onClose: () => void;
			open: boolean;
		}) =>
			open ? (
				<button
					type="button"
					onClick={() => {
						onSave(new Blob());
						onClose();
					}}
				>
					Save Voice
				</button>
			) : null,
	}),
);

vi.mock(
	"@/components/forms/steppers/profile-form/steps/knowledge/voice/CreateVoiceModal",
	() => ({
		__esModule: true,
		default: () => null,
	}),
);

vi.mock(
	"@/components/forms/steppers/profile-form/steps/knowledge/voice/utils/VoiceFeatureTabs",
	() => ({
		__esModule: true,
		default: () => null,
	}),
);

beforeAll(() => {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	if (!global.URL.createObjectURL) {
		global.URL.createObjectURL = vi.fn(() => "blob:voice");
	}
});

afterEach(() => {
	vi.clearAllMocks();
});

describe("Knowledge base monetization", () => {
	it("prefills upload modal with AI-optimized sales script template", () => {
		render(<SalesScriptManager />);

		fireEvent.click(
			screen.getByRole("button", {
				name: /upload new script/i,
			}),
		);

		const contentField = screen.getByLabelText(
			/script content/i,
		) as HTMLTextAreaElement;
		expect(contentField.value).toBe("");
		expect(contentField.placeholder).toContain("Objective:");

		const notesField = screen.getByLabelText(/notes/i) as HTMLTextAreaElement;
		const today = new Date().toISOString().slice(0, 10);
		expect(notesField.value).toBe("");
		expect(notesField.placeholder).toContain(today);
		expect(notesField.placeholder).toContain("AI Training Signal");

		const callDirection = screen.getByLabelText(
			/call direction/i,
		) as HTMLSelectElement;
		expect(callDirection.value).toBe("outbound");
		const funnelStage = screen.getByLabelText(
			/funnel stage/i,
		) as HTMLSelectElement;
		expect(funnelStage.value).toBe("top");
	});

	it("enables monetization for a recorded voice", async () => {
		render(<VoiceManager />);

		fireEvent.click(
			screen.getByRole("button", {
				name: /record/i,
			}),
		);

		fireEvent.click(
			screen.getByRole("button", {
				name: /save voice/i,
			}),
		);

		const editButton = await screen.findByTitle(/edit voice/i);
		fireEvent.click(editButton);

		const monetizeSwitch = await screen.findByLabelText(/monetize voice/i);
		fireEvent.click(monetizeSwitch);

		const termsSwitch = screen.getByLabelText(/i accept the terms/i);
		fireEvent.click(termsSwitch);

		fireEvent.click(
			screen.getByRole("button", {
				name: /save changes/i,
			}),
		);

		const marketplaceBadge = await screen.findByText("$1x Marketplace");
		expect(marketplaceBadge).toBeInTheDocument();
	});

	it("records monetization details for a sales script upload", async () => {
		render(<SalesScriptManager />);

		fireEvent.click(
			screen.getByRole("button", {
				name: /upload new script/i,
			}),
		);

		fireEvent.change(screen.getByLabelText(/script name/i), {
			target: { value: "Cold Call Pitch" },
		});

		fireEvent.change(screen.getByLabelText(/script content/i), {
			target: { value: "Intro + value + close" },
		});

		fireEvent.click(screen.getByLabelText(/monetize sales script/i));
		fireEvent.click(screen.getByLabelText(/i accept the terms/i));

		fireEvent.click(
			screen.getByRole("button", {
				name: /save script/i,
			}),
		);

		const row = await screen.findByText("Cold Call Pitch");
		const tableRow = row.closest("tr");
		expect(tableRow).not.toBeNull();
		const badge = within(tableRow as HTMLTableRowElement).getByText(
			"$1x Marketplace",
		);
		expect(badge).toBeInTheDocument();
	});
});
