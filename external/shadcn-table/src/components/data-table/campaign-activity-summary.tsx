"use client";

import { ActivityLineGraphContainer } from "../../../../activity-graph/components";
import type { ChannelActivityData } from "./activity";

interface CampaignActivitySummaryProps {
        activity: ChannelActivityData;
}

export function CampaignActivitySummary({ activity }: CampaignActivitySummaryProps) {
        const { heading, description, cards, metadata, chart } = activity;

        return (
                <div className="space-y-4">
                        <div className="text-center">
                                <h3 className="font-semibold text-lg">{heading}</h3>
                                <p className="text-muted-foreground text-sm">{description}</p>
                        </div>

                        {cards.length ? (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        {cards.map((card) => (
                                                <div key={card.label} className="rounded-lg border bg-card p-4">
                                                        <div className="font-bold text-2xl text-primary">{card.value}</div>
                                                        <div className="text-muted-foreground text-sm">{card.label}</div>
                                                        {card.helperText ? (
                                                                <div className="text-muted-foreground text-xs">
                                                                        {card.helperText}
                                                                </div>
                                                        ) : null}
                                                </div>
                                        ))}
                                </div>
                        ) : null}

                        {chart ? (
                                <div className="rounded-lg border bg-card p-6">
                                        <h3 className="mb-4 font-semibold text-lg">{chart.title ?? "Activity Trends"}</h3>
                                        <ActivityLineGraphContainer
                                                data={chart.data}
                                                config={chart.config}
                                                defaultLines={chart.defaultLines}
                                                defaultRange="7d"
                                                title=""
                                                description=""
                                        />
                                </div>
                        ) : null}

                        {metadata && metadata.length ? (
                                <div className="rounded-lg border bg-card p-4">
                                        <h4 className="mb-2 font-medium">Campaign Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                {metadata.map((item) => (
                                                        <div key={item.label}>
                                                                <span className="text-muted-foreground">{item.label}:</span>
                                                                <span className="ml-2 font-medium">{item.value}</span>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        ) : null}
                </div>
        );
}
