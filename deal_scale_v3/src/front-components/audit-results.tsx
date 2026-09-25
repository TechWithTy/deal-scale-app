import { useState } from "react";
import { defineFrontComponent } from "twenty-sdk/define";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";
import {
  createAuditResultsModel,
  type AuditResultsModel,
} from "src/assurance-surfaces/models";
import {
  CheckIcon,
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

export const DEFAULT_AUDIT_RESULTS_MODEL = createAuditResultsModel({});

export const AuditResults = ({
  model = DEFAULT_AUDIT_RESULTS_MODEL,
}: {
  model?: AuditResultsModel;
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const isReady = model.state === "ready";
  const presentation = isReady
    ? { label: model.status, tone: "warn" as const }
    : getSurfaceStatePresentation(model.state, model.message);

  return (
    <SurfaceShell
      eyebrow="Assurance / audit"
      title="Audit results"
      description={
        isReady
          ? `${model.runLabel} Â· ${model.runTime} Â· ${model.scopeLabel}`
          : "Read-only audit status for the current workspace scope."
      }
      status={{ label: presentation.label, tone: presentation.tone }}
    >
      {!isReady ? (
        <SurfaceStateNotice state={model.state} message={model.message} />
      ) : (
        <AuditResultsContent model={model} selectedAction={selectedAction} onSelect={setSelectedAction} />
      )}
    </SurfaceShell>
  );
};

const AuditResultsContent = ({
  model,
  selectedAction,
  onSelect,
}: {
  model: Extract<AuditResultsModel, { state: "ready" }>;
  selectedAction: string | null;
  onSelect: (id: string) => void;
}) => {
  const { statusBreakdown: summary } = model;
  const passPercent = summary.total > 0 ? Math.round((summary.pass / summary.total) * 100) : 0;

  return (
    <>
      <div style={{ ...RESPONSIVE_SURFACE_GRID, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", marginBottom: "12px" }}>
        <MetricCard label="Checks evaluated" value={summary.total} detail="Across current scope" />
        <MetricCard label="Passed" value={summary.pass} detail={`${passPercent}% of checks`} tone="good" />
        <MetricCard label="Failed" value={summary.fail} detail="Needs remediation" tone="bad" />
        <MetricCard label="Needs review" value={summary.needsReview} detail="Manager disposition" tone="warn" />
      </div>
      <div style={{ ...RESPONSIVE_SURFACE_GRID, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", marginBottom: "12px" }}>
        <SurfaceCard title="Run summary" detail={model.runTime}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <CheckIcon />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 650 }}>Evidence-backed checks are mostly passing</div>
              <div style={{ color: "#7A8491", fontSize: "11px", marginTop: "3px" }}>The remaining findings are traceability or disposition gaps.</div>
            </div>
            <StatusChip label={`${summary.total} checks`} tone="neutral" />
          </div>
          <ProgressBar value={passPercent} tone="good" />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#7A8491", fontSize: "11px", marginTop: "8px" }}>
            <span>{summary.pass} passing</span>
            <span>{summary.fail + summary.needsReview} to resolve</span>
          </div>
        </SurfaceCard>
        <SurfaceCard title="Provenance gaps" detail="Traceability">
          {model.provenanceGaps.map((gap) => <GapRow key={gap.label} {...gap} />)}
        </SurfaceCard>
      </div>
      <SurfaceCard title="Remediation actions" detail="Local-only guidance">
        {model.remediationActions.length === 0 ? (
          <div style={{ color: "#7A8491", fontSize: "12px" }}>No permitted local remediation actions are available for this role.</div>
        ) : (
          model.remediationActions.map((action) => (
            <RemediationRow
              key={action.id}
              action={action}
              selected={selectedAction === action.id}
              disabled={!model.canSelectRemediation}
              onSelect={() => {
                if (model.canSelectRemediation) onSelect(action.id);
              }}
            />
          ))
        )}
        {selectedAction ? <div style={{ color: "#21623E", background: "#EAF7EF", borderRadius: "8px", padding: "9px 11px", fontSize: "11px" }}>Next step selected locally. A manager or evidence integration owner can carry this into the existing Twenty workflow.</div> : null}
      </SurfaceCard>
    </>
  );
};

export default defineFrontComponent({
  universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.auditResultsFrontComponent,
  name: "audit-results",
  description: "Read-only audit run summary with evidence and provenance remediation guidance.",
  component: AuditResults,
});
