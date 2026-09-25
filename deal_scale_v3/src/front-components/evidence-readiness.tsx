import { useState } from "react";
import { defineFrontComponent } from "twenty-sdk/define";
import { IconClock, IconPlug } from "twenty-ui/icon";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";
import {
  createEvidenceReadinessModel,
  type EvidenceReadinessModel,
} from "src/assurance-surfaces/models";
import {
  GapRow,
  MetricCard,
  ProgressBar,
  RemediationRow,
  RESPONSIVE_SURFACE_GRID,
  StatusChip,
  SurfaceCard,
  SurfaceShell,
  SurfaceStateNotice,
  getSurfaceStatePresentation,
} from "src/assurance-surfaces/ui";

export const DEFAULT_EVIDENCE_READINESS_MODEL = createEvidenceReadinessModel({});

export const EvidenceReadiness = ({
  model = DEFAULT_EVIDENCE_READINESS_MODEL,
}: {
  model?: EvidenceReadinessModel;
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const isReady = model.state === "ready";
  const presentation = isReady
    ? {
        label: `${model.readinessPercent}% ready`,
        tone: model.readinessPercent >= 80 ? ("good" as const) : ("warn" as const),
      }
    : getSurfaceStatePresentation(model.state, model.message);

  return (
    <SurfaceShell
      eyebrow="Assurance / integrations"
      title="Evidence readiness"
      description={
        isReady
          ? "Completeness and connection health for the evidence that supports the next assurance run."
          : "Read-only evidence status for the current workspace scope."
      }
      status={{ label: presentation.label, tone: presentation.tone }}
    >
      {!isReady ? (
        <SurfaceStateNotice state={model.state} message={model.message} />
      ) : (
        <EvidenceReadinessContent model={model} selectedAction={selectedAction} onSelect={setSelectedAction} />
      )}
    </SurfaceShell>
  );
};

const EvidenceReadinessContent = ({
  model,
  selectedAction,
  onSelect,
}: {
  model: Extract<EvidenceReadinessModel, { state: "ready" }>;
  selectedAction: string | null;
  onSelect: (id: string) => void;
}) => (
  <>
    <div style={{ ...RESPONSIVE_SURFACE_GRID, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", marginBottom: "12px" }}>
      <MetricCard label="Readiness" value={`${model.readinessPercent}%`} detail="Evidence available to review" tone={model.readinessPercent >= 80 ? "good" : "warn"} />
      <MetricCard label="Evidence covered" value={`${model.coveredEvidence}/${model.totalEvidence}`} detail="Current expected scope" />
      <MetricCard label="Connections" value={model.sourceConnections.length} detail="Source health checked" />
      <MetricCard label="Provenance gaps" value={model.provenanceGaps.reduce((sum, gap) => sum + gap.count, 0)} detail="Fields to complete" tone="warn" />
    </div>
    <div style={{ ...RESPONSIVE_SURFACE_GRID, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", marginBottom: "12px" }}>
      <SurfaceCard title="Evidence completeness" detail="Source and case coverage">
        {model.coverage.map((item) => {
          const percent = item.total > 0 ? Math.round((item.covered / item.total) * 100) : 0;
          return <div key={item.label} style={{ padding: "9px 0", borderBottom: "1px solid #EEF0F2" }}><div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12px", marginBottom: "7px" }}><span style={{ fontWeight: 650 }}>{item.label}</span><span style={{ color: "#68727E" }}>{item.covered}/{item.total}</span></div><ProgressBar value={percent} tone={percent >= 90 ? "good" : percent >= 70 ? "warn" : "bad"} /><div style={{ color: "#8B949E", fontSize: "11px", marginTop: "5px" }}>{item.detail}</div></div>;
        })}
      </SurfaceCard>
      <SurfaceCard title="Source connection health" detail="Read-only status">
        {model.sourceConnections.map((connection) => {
          const tone = connection.status === "active" && connection.lag === "Low lag" ? "good" : connection.status === "paused" ? "bad" : "warn";
          return <div key={connection.provider} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "11px 0", borderBottom: "1px solid #EEF0F2" }}><IconPlug color={tone === "good" ? "#3B9B68" : tone === "bad" ? "#C55454" : "#C78A22"} size={17} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", fontWeight: 650 }}><span>{connection.provider}</span><StatusChip label={connection.status} tone={tone} /></div><div style={{ color: "#7A8491", fontSize: "11px", lineHeight: 1.4, marginTop: "4px" }}>{connection.detail}</div><div style={{ color: "#8B949E", display: "flex", gap: "5px", alignItems: "center", fontSize: "10px", marginTop: "4px" }}><IconClock size={13} />{connection.lastSync} Â· {connection.lag}</div></div></div>;
        })}
      </SurfaceCard>
    </div>
    <div style={{ ...RESPONSIVE_SURFACE_GRID, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}>
      <SurfaceCard title="Provenance gaps" detail="Evidence references">
        {model.provenanceGaps.map((gap) => <GapRow key={gap.label} {...gap} />)}
      </SurfaceCard>
      <SurfaceCard title="Remediation actions" detail="Local-only guidance">
        {model.remediationActions.length === 0 ? <div style={{ color: "#7A8491", fontSize: "12px" }}>No permitted local remediation actions are available for this role.</div> : model.remediationActions.map((action) => <RemediationRow key={action.id} action={action} selected={selectedAction === action.id} disabled={!model.canSelectRemediation} onSelect={() => { if (model.canSelectRemediation) onSelect(action.id); }} />)}
        {selectedAction ? <div style={{ color: "#21623E", background: "#EAF7EF", borderRadius: "8px", padding: "9px 11px", fontSize: "11px" }}>Next step selected locally. No connector or record was changed.</div> : null}
      </SurfaceCard>
    </div>
  </>
);

export default defineFrontComponent({
  universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessFrontComponent,
  name: "evidence-readiness",
  description: "Read-only evidence completeness, source health, provenance gaps, and remediation guidance.",
  component: EvidenceReadiness,
});
