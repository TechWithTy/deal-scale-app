import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeMarkdownContent } from "../../../external/interactive-avatar-nextjs-demo/components/ui/markdown-normalize";

const root = process.cwd();
const shellPath = path.join(
	root,
	"components",
	"home",
	"submodule-chat-shell.tsx",
);
const rootProvidersPath = path.join(
	root,
	"components",
	"layout",
	"providers.tsx",
);
const authenticatedShellPath = path.join(
	root,
	"components",
	"layout",
	"AuthenticatedAppShell.tsx",
);
const themeBridgePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ThemeBridge.tsx",
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
const mermaidActionsMenuPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"mermaid-actions-menu.tsx",
);
const mermaidPreviewModalPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"mermaid-preview-modal.tsx",
);
const mermaidSourcePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"mermaid-source.ts",
);
const markdownPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"markdown.tsx",
);
const markdownNormalizePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"markdown-normalize.ts",
);
const codeBlockPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"code-block.tsx",
);
const hoverCardPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"hover-card.tsx",
);
const sourcePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"source.tsx",
);
const jsxPreviewPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"jsx-preview.tsx",
);
const messagePrimitivePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"message.tsx",
);
const reasoningPrimitivePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"reasoning.tsx",
);
const messageListPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"chat",
	"MessageList.tsx",
);
const exampleReasoningPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"chat",
	"_mock_data",
	"example-reasoning.ts",
);
const exampleMarkdownCodePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"chat",
	"_mock_data",
	"example-markdown-code.tsx",
);
const messageItemPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"MessageItem.tsx",
);
const avatarControlsPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"AvatarControls.tsx",
);
const chatSettingsModalPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"BasicChatSettingsModal.tsx",
);
const themeEmotionSelectPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"ui",
	"theme-emotion-select.tsx",
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
	it("mounts the app tour provider around the authenticated app shell", () => {
		const source = readFileSync(shellPath, "utf8");
		const authenticatedShellSource = readFileSync(authenticatedShellPath, "utf8");

		expect(authenticatedShellSource).toContain(
			'import { AppTourProvider } from "@/components/tour/AppTourProvider";',
		);
		expect(authenticatedShellSource).toMatch(
			/<AppTourProvider>\s*<OfflineBanner \/>/,
		);
		expect(source).not.toContain("<AppTourProvider>");
		expect(source).toMatch(
			/<StreamingAvatarProvider>\s*<SubmoduleChatPanel \/>/,
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

	it("applies chat emotion color settings through the host theme bridge", () => {
		const providers = readFileSync(rootProvidersPath, "utf8");
		const themeBridge = readFileSync(themeBridgePath, "utf8");
		const chatSettingsModal = readFileSync(chatSettingsModalPath, "utf8");
		const themeEmotionSelect = readFileSync(themeEmotionSelectPath, "utf8");

		expect(providers).toContain(
			'import ThemeBridge from "@/external/interactive-avatar-nextjs-demo/components/ThemeBridge";',
		);
		expect(providers).toContain("<ThemeBridge />");
		expect(themeBridge).toContain("computeHostMoodClass");
		expect(themeBridge).toContain('"variant-mood-calm"');
		expect(themeBridge).toContain('"variant-mood-energetic"');
		expect(themeBridge).toContain('"variant-mood-focused"');
		expect(themeBridge).toContain("root.classList.add(hostMoodClass)");
		expect(chatSettingsModal).toContain("ThemeEmotionSelect");
		expect(chatSettingsModal).toContain("Emotion colors");
		expect(chatSettingsModal).toContain("Update chat accent colors");
		expect(themeEmotionSelect).toContain("useThemeStore");
		expect(themeEmotionSelect).toContain('className="h-8 w-full min-w-[140px]"');
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

	it("keeps a single rectangular bottom chat restore trigger in the chat shell", () => {
		const source = readFileSync(shellPath, "utf8");

		expect(source.match(/data-tour="bottom-chat-panel-toggle"/g)).toHaveLength(
			1,
		);
		expect(source).toContain("fixed bottom-4 left-1/2");
		expect(source).toContain("z-[230]");
		expect(source).toContain("rounded-md border border-primary");
		expect(source).not.toContain("absolute bottom-2 left-1/2");
		expect(source).not.toContain("shadow-2xl shadow-black/60");
	});

	it("minimizes workspace controls when switching top workspace tabs", () => {
		const source = readFileSync(shellPath, "utf8");
		const avatarControls = readFileSync(avatarControlsPath, "utf8");

		expect(source).toContain("const selectViewTab = (tab: WorkspaceTab) =>");
		expect(source).toMatch(
			/selectViewTab[\s\S]*setViewTab\(tab\)[\s\S]*setControlsMinimized\(true\)/,
		);
		expect(source).toContain('onClick={() => selectViewTab("brain")}');
		expect(source).toContain('onClick={() => selectViewTab("data")}');
		expect(source).toContain('onClick={() => selectViewTab("actions")}');
		expect(source).toMatch(
			/nextTab !== previousTabRef\.current[\s\S]*setChatMinimized\(true\)[\s\S]*setControlsMinimized\(true\)/,
		);
		expect(avatarControls).toContain("const showVideoView = () =>");
		expect(avatarControls).toMatch(
			/showVideoView[\s\S]*setViewTab\("video"\)[\s\S]*setControlsMinimized\(true\)/,
		);
		expect(avatarControls).toContain("switchWorkspaceView(tab)");
	});

	it("opens the left sidebar Chats step against the rendered chats section", () => {
		const source = readFileSync(tourHelpersPath, "utf8");

		expect(source).toContain('section === "chats"');
		expect(source).toContain('[data-tour="chats-section"]');
		expect(source).toContain("getSidebarSectionTarget(section)");
	});

	it("renders Mermaid action targets used by chat and data grid tours", () => {
		const source = readFileSync(mermaidPath, "utf8");
		const menuSource = readFileSync(mermaidActionsMenuPath, "utf8");
		const modalSource = readFileSync(mermaidPreviewModalPath, "utf8");
		const sourceHelper = readFileSync(mermaidSourcePath, "utf8");

		expect(menuSource).toContain('data-tour="mermaid-actions"');
		expect(menuSource).toContain('data-tour="mermaid-add-to-grid"');
		expect(menuSource).toContain("MoreHorizontal");
		expect(menuSource).toContain('aria-label="Mermaid actions"');
		expect(menuSource).toContain("bg-slate-800");
		expect(menuSource).toContain("absolute right-3 top-3");
		expect(menuSource).toContain("bg-slate-950");
		expect(menuSource).toContain("View diagram");
		expect(menuSource).toContain("onReload");
		expect(menuSource).toContain("onCopy");
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
		expect(source).toContain("normalizeMermaidSource");
		expect(sourceHelper).toContain("getNodeText");
		expect(sourceHelper).toContain("decodeHtmlEntities");
		expect(sourceHelper).toContain("MERMAID_PREAMBLE_PATTERN");
		expect(sourceHelper).toContain("MERMAID_FENCE_PATTERN");
		expect(source).toContain("viewOpen");
		expect(source).toContain("MermaidPreviewModal");
		expect(modalSource).toContain('role="dialog"');
		expect(source).toContain("reloadDiagram");
		expect(source).not.toContain('String(chart ?? children ?? "").trim()');
	});

	it("routes Mermaid markdown aliases and JSX children into the live renderer", () => {
		const mermaidSource = readFileSync(mermaidSourcePath, "utf8");
		const markdownSource = readFileSync(markdownPath, "utf8");

		expect(mermaidSource).toContain(".replace(/&gt;/g");
		expect(mermaidSource).toContain(".replace(/&#123;/g");
		expect(mermaidSource).toContain("React.isValidElement");
		expect(markdownSource).toContain("isMermaidLanguage");
		expect(markdownSource).toContain('"textmermaid"');
		expect(markdownSource).toContain('"mmd"');
		expect(markdownSource).toContain("<Mermaid chart={codeStr} />");
	});

	it("normalizes PromptKit docs markdown before rendering", () => {
		const markdownSource = readFileSync(markdownPath, "utf8");
		const normalizeSource = readFileSync(markdownNormalizePath, "utf8");
		const exampleMarkdownCode = readFileSync(exampleMarkdownCodePath, "utf8");
		const codeBlockSource = readFileSync(codeBlockPath, "utf8");
		const normalizedCodeBlocks = normalizeMarkdownContent(`~~~bash
pnpm install
pnpm dev
~~~

~~~js
export function sum(a, b) {
  return a + b;
}
~~~

~~~ts
type User = { id: "1"; name: "Ada" };
const u: User = { id: "1", name: "Ada" };
~~~

~~~tsx
import { useState } from "react";

export default function Counter() {
  const [c, setC] = useState(0);
  return <button>Count</button>;
}
~~~`);

		expect(markdownSource).toContain("normalizeMarkdownContent");
		expect(markdownSource).toContain("normalizedChildren");
		expect(markdownSource).toContain("const language = extractLanguage(className)");
		expect(markdownSource).toContain("!className &&");
		expect(markdownSource).toContain("table: function TableComponent");
		expect(markdownSource).toContain("blockquote: function BlockquoteComponent");
		expect(normalizeSource).toContain("ComponentCodePreview");
		expect(normalizeSource).toContain("CODE_BLOCK_TAG");
		expect(normalizeSource).toContain("collectTag");
		expect(normalizeSource).toContain("looksLikeCodeStart");
		expect(normalizeSource).toContain("shouldCloseCodeBlock");
		expect(normalizeSource).toContain("normalizeFenceLine");
		expect(normalizeSource).toContain("inExplicitCodeFence");
		expect(normalizeSource).toContain(".replace(/<kbd>(.*?)<\\/kbd>/g");
		expect(normalizedCodeBlocks).not.toContain("~~~");
		expect(normalizedCodeBlocks).toContain("```bash");
		expect(normalizedCodeBlocks).toContain("```js");
		expect(normalizedCodeBlocks).toContain("```ts");
		expect(normalizedCodeBlocks).toContain("```tsx");
		expect(normalizedCodeBlocks).toContain('import { useState } from "react";');
		expect(normalizedCodeBlocks).toContain(
			'type User = { id: "1"; name: "Ada" };\nconst u: User',
		);
		expect(normalizedCodeBlocks).not.toContain("```tsx\nconst u: User");
		expect(exampleMarkdownCode).toContain(
			"/demos/svgs/JZP1_tcJNyZaQHtc8ZL9p.webp",
		);
		expect(exampleMarkdownCode).not.toContain("/demo.png");
		expect(codeBlockSource).toContain('import("shiki")');
		expect(codeBlockSource).toContain("codeToHtml(code");
		expect(codeBlockSource).toContain("normalizeShikiLanguage");
		expect(codeBlockSource).toContain('js: "javascript"');
		expect(codeBlockSource).toContain('ts: "typescript"');
		expect(codeBlockSource).toContain("dangerouslySetInnerHTML");
		expect(codeBlockSource).toContain("data-language={language}");
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
		expect(source).toContain("normalizePreviewJsx");
		expect(source).toContain(".replace(/\\{\\/\\*[\\s\\S]*?\\*\\/\\}/g");
		expect(source).toContain('.replace(/\\sclass=/g, " className=")');
		expect(source).toContain("setParseError(null)");
		expect(source).toContain("onError");
	});

	it("keeps source details in a hover card instead of inline message text", () => {
		const hoverCardSource = readFileSync(hoverCardPath, "utf8");
		const sourceSource = readFileSync(sourcePath, "utf8");

		expect(hoverCardSource).toContain("@radix-ui/react-hover-card");
		expect(hoverCardSource).toContain("HoverCardPrimitive.Portal");
		expect(hoverCardSource).toContain("HoverCardPrimitive.Content");
		expect(hoverCardSource).not.toContain("return <div>{children}</div>");
		expect(sourceSource).toContain('alt=""');
		expect(sourceSource).toContain('aria-hidden="true"');
		expect(sourceSource).toContain("event.currentTarget.style.display = \"none\"");
		expect(sourceSource).toContain("<HoverCardContent");
	});

	it("renders markdown and reasoning markdown through the Markdown renderer", () => {
		const messagePrimitive = readFileSync(messagePrimitivePath, "utf8");
		const reasoningPrimitive = readFileSync(reasoningPrimitivePath, "utf8");
		const markdownSource = readFileSync(markdownPath, "utf8");

		expect(messagePrimitive).toContain('import { Markdown } from "./markdown"');
		expect(messagePrimitive).toContain(
			'if (markdown && typeof children === "string")',
		);
		expect(messagePrimitive).toContain("showHeader={showHeader}");
		expect(messagePrimitive).toContain("headerLabel={headerLabel}");
		expect(markdownSource).toContain("ul: function UlComponent");
		expect(markdownSource).toContain("list-disc");
		expect(markdownSource).toContain("ol: function OlComponent");
		expect(reasoningPrimitive).toContain(
			'import { Markdown } from "./markdown"',
		);
		expect(reasoningPrimitive).toContain(
			'markdown && typeof children === "string"',
		);
		expect(reasoningPrimitive).toContain("<Markdown showHeader={false}>");
	});

	it("keeps the reasoning demo hidden until the Reasoning panel is opened", () => {
		const messageList = readFileSync(messageListPath, "utf8");
		const exampleReasoning = readFileSync(exampleReasoningPath, "utf8");
		const messageItem = readFileSync(messageItemPath, "utf8");

		expect(messageList.match(/message\.reasoningOpen \?\? false/g)).toHaveLength(
			2,
		);
		expect(messageList).not.toContain(
			"reasoningOpen={message.id === exampleReasoning.message.id}",
		);
		expect(exampleReasoning).not.toContain("sources:");
		expect(exampleReasoning).not.toContain("Reasoning Demo");
		expect(exampleReasoning).not.toContain("hidden chain-of-thought");
		expect(exampleReasoning).toContain("collapsible reasoning summary");
		expect(exampleReasoning).not.toContain('href: "#"');
		expect(messageItem).toContain("isReasoningOpen");
		expect(messageItem).toContain("setIsReasoningOpen");
		expect(messageItem).toContain("onOpenChange={setIsReasoningOpen}");
		expect(messageItem).toContain("isReasoningCopied");
		expect(messageItem).toContain("handleCopyReasoning");
		expect(messageItem).toContain('aria-label="Copy reasoning"');
		expect(messageItem).toContain("rounded-md border border-border bg-background");
		expect(messageItem).toContain('"Hide reasoning" : "Show reasoning"');
		expect(messageItem).toContain("navigator.clipboard.writeText(reasoning)");
		expect(messageItem).toMatch(
			/message\.content[\s\S]*<MessageContent[\s\S]*reasoning &&/,
		);
		expect(messageItem).not.toContain(
			"<Reasoning isStreaming={isStreaming} open={reasoningOpen}>",
		);
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
