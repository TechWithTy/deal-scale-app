import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const shellPath = path.join(
	root,
	"components",
	"home",
	"submodule-chat-shell.tsx",
);
const tourHelpersPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"tourHelpers.ts",
);
const mermaidPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"mermaid.tsx",
);
const jsxPreviewPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"jsx-preview.tsx",
);
const liveMermaidPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"live-mermaid-chart.tsx",
);
const dataViewerPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"data-viewer",
	"DataViewer.tsx",
);
const rootGlobalsPath = path.join(root, "app", "globals.css");
const externalGlobalsPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"styles",
	"globals.css",
);
const slashCommandPalettePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"chat",
	"SlashCommandPalette.tsx",
);
const promptSuggestionsPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"PromptSuggestions.tsx",
);
const rootTooltipPath = path.join(root, "components", "ui", "tooltip.tsx");
const externalTooltipPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"tooltip.tsx",
);

describe("SubmoduleChatShell tours", () => {
	it("mounts the embedded chat inside the app tour provider", () => {
		const source = readFileSync(shellPath, "utf8");

		expect(source).toContain(
			'import { AppTourProvider } from "@/external/interactive-avatar-nextjs-demo/components/tour/AppTourProvider";',
		);
		expect(source).toMatch(
			/<AppTourProvider>\s*<StreamingAvatarProvider>\s*<SubmoduleChatPanel \/>/,
		);
	});

	it("exposes the root chat and workspace targets used by in-app tours", () => {
		const source = readFileSync(shellPath, "utf8");

		for (const target of [
			'data-tour="top-panel-tabs"',
			'data-tour="brain-tab"',
			'data-tour="data-tab"',
			'data-tour="actions-tab"',
			'data-tour="bottom-chat-panel"',
			'data-tour="bottom-chat-panel-toggle"',
			'data-tour="brain-graph"',
			'data-tour="live-avatar-start-card"',
			'data-tour="live-avatar-tour-anchor"',
			'data-tour="basic-chat-card"',
			'data-tour="basic-chat-tour-anchor"',
		]) {
			expect(source).toContain(target);
		}

		expect(source).toContain("showControls");
	});

	it("renders App Overview steps 5 and 6 from the embedded video workspace", () => {
		const source = readFileSync(shellPath, "utf8");

		expect(source).toContain('chatExperience === "basic"');
		expect(source).toContain("Basic Chat");
		expect(source).toContain("Use chat without starting an avatar session.");
		expect(source).toContain("SessionQuickStartCard");
	});

	it("mounts chat settings for the App Overview settings step", () => {
		const source = readFileSync(shellPath, "utf8");

		expect(source).toContain(
			'import { BasicChatSettingsModal } from "@/external/interactive-avatar-nextjs-demo/components/AvatarSession/BasicChatSettingsModal";',
		);
		expect(source).toContain("<BasicChatSettingsModal");
		expect(source).toContain("isChatSettingsOpen");
		expect(source).toContain("handleChatExperienceChange");
	});

	it("bridges tour chat events into the embedded shell state", () => {
		const source = readFileSync(shellPath, "utf8");

		expect(source).toContain('"tour-show-chat-reopen", restoreChat');
		expect(source).toContain('"tour-hide-chat-reopen", minimizeChat');
		expect(source).toContain('"tour-minimize-chat", minimizeChat');
	});

	it("prepares the root chat restore target without reopening the chat panel", () => {
		const source = readFileSync(tourHelpersPath, "utf8");

		expect(source).toContain("tour-minimize-chat");
		expect(source).toMatch(
			/showBottomChatPanelToggle\(\)[\s\S]*tour-show-chat-reopen[\s\S]*tour-minimize-chat[\s\S]*bottom-chat-panel-toggle/,
		);
	});

	it("opens the left sidebar Chats step against the rendered chats section", () => {
		const source = readFileSync(tourHelpersPath, "utf8");

		expect(source).toContain('section === "chats"');
		expect(source).toContain('[data-tour="chats-section"]');
		expect(source).toContain("getSidebarSectionTarget(section)");
	});

	it("renders Mermaid action targets used by chat and data grid tours", () => {
		const source = readFileSync(mermaidPath, "utf8");

		expect(source).toContain('data-tour="mermaid-actions"');
		expect(source).toContain('data-tour="mermaid-add-to-grid"');
		expect(source).toContain("MoreHorizontal");
		expect(source).toContain('aria-label="Mermaid actions"');
		expect(source).toContain("bg-slate-800");
		expect(source).toContain("absolute right-3 top-3");
		expect(source).toContain("bg-slate-950");
		expect(source).toContain("useDataGridStore");
		expect(source).toContain("addMermaidChart");
		expect(source).toContain("addLiveMermaidChart");
		expect(source).toContain("showControls ? (");
		expect(source).toContain("tour-open-mermaid-actions");
		expect(source).toContain("tourPinnedMenuRef");
		expect(source).toContain('import("mermaid")');
		expect(source).toContain("mermaid.render");
		expect(source).toContain("renderedSvgCache");
		expect(source).toContain("getCachedSvg(cacheKey)");
		expect(source).toContain("cacheRenderedSvg(cacheKey, svg)");
		expect(source).toContain("dangerouslySetInnerHTML");
	});

	it("passes live Mermaid metadata through Add to Grid", () => {
		const source = readFileSync(liveMermaidPath, "utf8");

		expect(source).toContain("liveData={{");
		expect(source).toContain('kind: "mockPipeline"');
		expect(source).toContain("intervalMs");
		expect(source).toContain("seed: seedRef.current");
		expect(source).toContain("showControls,");
		expect(source).toContain("showControls={showControls}");
	});

	it("lets Mermaid grid cards fill height without cutting off titles", () => {
		const mermaidSource = readFileSync(mermaidPath, "utf8");
		const dataViewerSource = readFileSync(dataViewerPath, "utf8");

		expect(mermaidSource).toContain("flex min-h-52 flex-col");
		expect(mermaidSource).toContain("flex min-h-0 flex-1");
		expect(mermaidSource).toContain("[&_svg]:h-full");
		expect(mermaidSource).toContain("[&_svg]:max-h-full");
		expect(dataViewerSource).toContain("relative h-full min-h-0 min-w-0 overflow-hidden");
		expect(dataViewerSource).toContain("renderBuiltinRemoveButton");
		expect(dataViewerSource).toContain("headerAction={headerAction}");
		expect(dataViewerSource).toContain('data-tour="data-grid-remove-builtin"');
		expect(dataViewerSource).toContain("const activeLayouts = useMemo");
		expect(dataViewerSource).toContain("layouts={activeLayouts}");
		expect(dataViewerSource).toContain("setHiddenBuiltinIds((current) =>");
		expect(dataViewerSource).toContain("chart-grid-drag-handle flex min-h-12");
		expect(dataViewerSource).toContain(
			"min-w-0 flex-1 break-words leading-snug",
		);
		expect(dataViewerSource).toContain("pb-4 pt-3");
		expect(dataViewerSource).toContain("mb-2 flex min-h-9 flex-wrap");
		expect(dataViewerSource).toContain("inline-flex h-7 items-center gap-1");
	});

	it("parses rich JSX chat payloads instead of showing component source text", () => {
		const source = readFileSync(jsxPreviewPath, "utf8");

		expect(source).toContain('import JsxParser from "react-jsx-parser"');
		expect(source).toContain("<JsxParser");
		expect(source).toContain("components={parserComponents}");
		expect(source).toContain("onError");
	});

	it("forces custom overlay surfaces to render with opaque backgrounds", () => {
		const rootGlobals = readFileSync(rootGlobalsPath, "utf8");
		const externalGlobals = readFileSync(externalGlobalsPath, "utf8");
		const slashCommandPalette = readFileSync(slashCommandPalettePath, "utf8");
		const promptSuggestions = readFileSync(promptSuggestionsPath, "utf8");

		for (const source of [rootGlobals, externalGlobals]) {
			expect(source).toContain('[data-overlay-surface="opaque"]');
			expect(source).toContain('[data-video-select-surface="true"]');
			expect(source).toContain("background-color: #020617 !important");
			expect(source).toContain("backdrop-filter: none !important");
		}

		expect(slashCommandPalette).toContain('data-overlay-surface="opaque"');
		expect(slashCommandPalette).toContain("bg-slate-950");
		expect(promptSuggestions).toContain('data-overlay-surface="opaque"');
		expect(promptSuggestions).toContain("bg-slate-950");
	});

	it("keeps direct Tooltip usage inside a TooltipProvider", () => {
		for (const tooltipPath of [rootTooltipPath, externalTooltipPath]) {
			const source = readFileSync(tooltipPath, "utf8");

			expect(source).toContain("TooltipPrimitive.Provider");
			expect(source).toContain("<TooltipProvider delayDuration={delayDuration}>");
			expect(source).toContain("<TooltipPrimitive.Root");
		}
	});
});
