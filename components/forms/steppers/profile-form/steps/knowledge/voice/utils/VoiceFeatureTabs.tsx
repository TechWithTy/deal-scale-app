import type React from "react";
import { useState, useRef, type ReactNode } from "react";
import { PlayButtonTimeLine } from "@/components/reusables/audio/timeline/useAudioPlayer";
import type { PlayButtonTimeLineHandle } from "@/components/reusables/audio/timeline/types";

interface Tab {
	label: string;
	content?: ReactNode;
	audioSrc?: string; // If present, will render PlayButtonTimeLine
	startTime?: number;
	endTime?: number;
	timelineRef?: React.RefObject<PlayButtonTimeLineHandle>; // Optional ref for imperative play
}

interface VoiceFeatureTabsProps {
	tabs: Tab[];
	initialTab?: number;
	className?: string;
	button?: React.ReactNode; // Single button for the whole tab component
}

/**
 * VoiceFeatureTabs
 * A dynamic tab component for switching between different voice features.
 * Each tab can have its own content.
 * Example usage:
 * <VoiceFeatureTabs
 *    tabs=[
 *      { label: 'Timeline', content: <PlayButtonTimeLine ... /> },
 *      { label: 'Settings', content: <VoiceSettings ... /> }
 *    ]
 *    button={<Button>Add Voice</Button>}
 * />
 */
export const VoiceFeatureTabs: React.FC<VoiceFeatureTabsProps> = ({
	tabs,
	initialTab = 0,
	className = "",
	button,
}) => {
	const [activeTab, setActiveTab] = useState(initialTab);

	return (
		<div className={`mx-auto w-full max-w-xl ${className}`}>
			<div className="mb-4 flex justify-center">
				<div className="flex gap-4 rounded-lg border border-muted bg-muted/60 px-2 py-1">
					{tabs.map((tab, idx) => (
						<button
							key={tab.label}
							type="button"
							className={`rounded px-4 py-2 font-medium text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
								activeTab === idx
									? "border-primary border-b-2 bg-background text-primary"
									: "text-muted-foreground hover:text-primary"
							}`}
							onClick={() => setActiveTab(idx)}
							aria-selected={activeTab === idx}
							aria-controls={`tab-panel-${idx}`}
							role="tab"
							tabIndex={0}
							onKeyDown={(e) => {
								if ((e.key === "Enter" || e.key === " ") && activeTab !== idx) {
									setActiveTab(idx);
								}
							}}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>
			<div className="mb-2 flex w-full flex-col items-center justify-center">
				<div
					role="tabpanel"
					id={`tab-panel-${activeTab}`}
					className="flex w-full flex-col items-center justify-center"
				>
					{tabs[activeTab].audioSrc && (
						<div className="mb-4 flex w-full justify-center">
							<PlayButtonTimeLine
								audioSrc={tabs[activeTab].audioSrc}
								startTime={tabs[activeTab].startTime ?? 0}
								endTime={tabs[activeTab].endTime}
								ref={tabs[activeTab].timelineRef}
							/>
						</div>
					)}
					{tabs[activeTab].content && (
						<div className="flex w-full justify-center">
							{tabs[activeTab].content}
						</div>
					)}
				</div>
				{button && <div className="ml-4">{button}</div>}
			</div>
		</div>
	);
};

export default VoiceFeatureTabs;
