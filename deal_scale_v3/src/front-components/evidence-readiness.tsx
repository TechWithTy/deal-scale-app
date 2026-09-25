import { useState } from "react";
import { defineFrontComponent } from "twenty-sdk/define";
import { IconClock, IconPlug } from "twenty-ui/icon";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";
import { EVIDENCE_READINESS_PREVIEW } from "src/assurance-surfaces/models";
import { GapRow, MetricCard, ProgressBar, RemediationRow, StatusChip, SurfaceCard, SurfaceShell } from "src/assurance-surfaces/ui";

const EvidenceReadiness = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const model = EVIDENCE_READINESS_PREVIEW;

  return (
    <SurfaceShell eyebrow="Assurance / integrations" title="Evidence readiness" description="Completeness and connection health for the evidence that supports the next assurance run." status={{ label: `${model.readinessPercent}% ready`, tone: model.readinessPercent >= 80 ? "good" : "warn" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", marginBottom: "12px" }}>
        <MetricCard label="Readiness" value={`${model.readinessPercent}%`} detail="Evidence available to review" tone={model.readinessPercent >= 80 ? "good" : "warn"} />
        <MetricCard label="Evidence covered" value={`${model.coveredEvidence}/${model.totalEvidence}`} detail="Current expected scope" />
        <MetricCard label="Connections" value={model.sourceConnections.length} detail="Source health checked" />
        <MetricCard label="Provenance gaps" value={model.provenanceGaps.reduce((sum, gap) => sum + gap.count, 0)} detail="Fields to complete" tone="warn" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 0.9fr)", gap: "12px", marginBottom: "12px" }}>
        <SurfaceCard title="Evidence completeness" detail="Source and case coverage">
          {model.coverage.map((item) => { const percent = Math.round((item.covered / item.total) * 100); return <div key={item.label} style={{ padding: "9px 0", borderBottom: "1px solid #EEF0F2" }}><div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12px", marginBottom: "7px" }}><span style={{ fontWeight: 650 }}>{item.label}</span><span style={{ color: "#68727E" }}>{item.covered}/{item.total}</span></div><ProgressBar value={percent} tone={percent >= 90 ? "good" : percent >= 70 ? "warn" : "bad"} /><div style={{ color: "#8B949E", fontSize: "11px", marginTop: "5px" }}>{item.detail}</div></div>; })}
        </SurfaceCard>
        <SurfaceCard title="Source connection health" detail="Read-only status">
          {model.sourceConnections.map((connection) => { const tone = connection.status === "active" && connection.lag === "Low lag" ? "good" : connection.status === "paused" ? "bad" : "warn"; return <div key={connection.provider} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "11px 0", borderBottom: "1px solid #EEF0F2" }}><IconPlug color={tone === "good" ? "#3B9B68" : tone === "bad" ? "#C55454" : "#C78A22"} size={17} /><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", fontWeight: 650 }}><span>{connection.provider}</span><StatusChip label={connection.status} tone={tone} /></div><div style={{ color: "#7A8491", fontSize: "11px", lineHeight: 1.4, marginTop: "4px" }}>{connection.detail}</div><div style={{ color: "#8B949E", display: "flex", gap: "5px", alignItems: "center", fontSize: "10px", marginTop: "4px" }}><IconClock size={13} />{connection.lastSync} · {connection.lag}</div></div></div>; })}
        </SurfaceCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 1fr)", gap: "12px" }}>
        <SurfaceCard title="Provenance gaps" detail="Evidence references">
          {model.provenanceGaps.map((gap) => <GapRow key={gap.label} {...gap} />)}
        </SurfaceCard>
        <SurfaceCard title="Remediation actions" detail="Local-only guidance">
          {model.remediationActions.map((action) => <RemediationRow key={action.id} action={action} selected={selectedAction === action.id} onSelect={() => setSelectedAction(action.id)} />)}
          {selectedAction ? <div style={{ color: "#21623E", background: "#EAF7EF", borderRadius: "8px", padding: "9px 11px", fontSize: "11px" }}>Next step selected locally. No connector or record was changed.</div> : null}
        </SurfaceCard>
      </div>
    </SurfaceShell>
  );
};

export default defineFrontComponent({
  universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessFrontComponent,
  name: "evidence-readiness",
  description: "Read-only evidence completeness, source health, provenance gaps, and remediation guidance.",
  component: EvidenceReadiness,
});
