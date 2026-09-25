import { defineFrontComponent } from "twenty-sdk/define";

import {
  EmptySurface,
  EvidenceList,
  MetricCard,
  StatusPill,
  SurfaceShell,
  colors,
} from "./surface-primitives";
import {
  SELLER_JOURNEYS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from "../seller-journeys/identifiers";
import type { SellerJourneyModel } from "../seller-journeys/surface-model";

export const EMPTY_SELLER_JOURNEY_MODEL: SellerJourneyModel = {
  sellerName: "No seller selected",
  opportunityName: "No opportunity selected",
  stage: "Awaiting snapshot",
  sellerContext: {
    name: "No seller selected",
    externalId: "missing",
    sourceRef: "missing",
    observedAt: new Date(0),
    provenanceState: "inferred",
  },
  opportunityContext: {
    name: "No opportunity selected",
    externalId: "missing",
    stage: "Awaiting snapshot",
    sourceRef: "missing",
    observedAt: new Date(0),
    provenanceState: "inferred",
  },
  milestones: [],
  promises: { items: [], counts: { total: 0, fulfilled: 0, unresolved: 0, atRisk: 0, dueSoon: 0 } },
  evidenceLinks: [],
  risk: { openCaseCount: 0, unresolvedPromiseCount: 0, atRiskPromiseCount: 0, highestDetectorConfidence: 0, isAtRisk: false },
};

export const SellerJourneysSurface = ({ model = EMPTY_SELLER_JOURNEY_MODEL }: { model?: SellerJourneyModel }) => (
  <SurfaceShell
    eyebrow="Seller assurance"
    title="Seller Journeys"
    description="Follow progression, promises, and assurance impact in one seller-facing view. CRM record mechanics stay behind the contract boundary."
  >
    <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: "18px" }}>
      <MetricCard label="Seller" value={model.sellerName} />
      <MetricCard label="Current stage" value={model.stage} accent={colors.accent} />
      <MetricCard label="Milestones" value={model.milestones.length} />
      <MetricCard label="Risk signals" value={model.risk.isAtRisk ? "Review" : "Clear"} accent={model.risk.isAtRisk ? colors.risk : colors.success} />
    </div>
    <section style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "14px", display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "16px", padding: "16px" }}>
      <div>
        <div style={{ color: colors.muted, fontSize: "11px", textTransform: "uppercase" }}>Seller context</div>
        <strong>{model.sellerContext.name}</strong>
        <div style={{ color: colors.muted, fontSize: "11px", marginTop: "4px" }}>Source: {model.sellerContext.sourceRef} - Observed: {model.sellerContext.observedAt.toISOString()}</div>
      </div>
      <div>
        <div style={{ color: colors.muted, fontSize: "11px", textTransform: "uppercase" }}>Opportunity context</div>
        <strong>{model.opportunityContext.name} - {model.opportunityContext.stage}</strong>
        <div style={{ color: colors.muted, fontSize: "11px", marginTop: "4px" }}>Source: {model.opportunityContext.sourceRef} - Observed: {model.opportunityContext.observedAt.toISOString()}</div>
      </div>
    </section>
    {model.milestones.length === 0 && model.promises.items.length === 0 ? (
      <EmptySurface message="No contract snapshot available. Connect a read-only seller journey snapshot to populate milestones, promises, and assurance impact." />
    ) : (
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, 1fr)" }}>
        <section style={{ border: `1px solid ${colors.line}`, borderRadius: "14px", padding: "20px" }}>
          <h2 style={{ fontSize: "17px", margin: "0 0 16px" }}>Journey progression</h2>
          <div style={{ display: "grid", gap: "14px" }}>
            {model.milestones.length === 0 ? <EmptySurface message="No observed journey milestones in this snapshot." /> : model.milestones.map((milestone) => (
              <div key={milestone.id} style={{ borderLeft: `3px solid ${colors.accent}`, paddingLeft: "14px" }}>
                <div style={{ alignItems: "center", display: "flex", gap: "8px", justifyContent: "space-between" }}>
                  <strong>{milestone.label}</strong>
                  <StatusPill
                    label={milestone.provenanceState === "observed" ? "Observed" : "Inferred"}
                    status={milestone.provenanceState}
                  />
                </div>
                <div style={{ color: colors.muted, fontSize: "12px", marginTop: "4px" }}>{milestone.eventType} - Occurred: {milestone.occurredAt.toISOString()}</div>
                <div style={{ color: colors.muted, fontSize: "11px", marginTop: "3px" }}>Source: {milestone.sourceRef} - Observed: {milestone.observedAt.toISOString()}</div>
              </div>
            ))}
          </div>
        </section>
        <aside style={{ background: model.risk.isAtRisk ? "#fff8f5" : colors.panel, border: `1px solid ${model.risk.isAtRisk ? `${colors.risk}55` : colors.line}`, borderRadius: "14px", padding: "20px" }}>
          <h2 style={{ fontSize: "17px", margin: "0 0 16px" }}>Assurance impact</h2>
          <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
            <div>Open assurance cases: <strong>{model.risk.openCaseCount}</strong></div>
            <div>Unresolved promises: <strong>{model.risk.unresolvedPromiseCount}</strong></div>
            <div>At-risk promises: <strong>{model.risk.atRiskPromiseCount}</strong></div>
            <div>Highest detector confidence: <strong>{Math.round(model.risk.highestDetectorConfidence * 100)}%</strong></div>
          </div>
          <h3 style={{ fontSize: "13px", margin: "20px 0 10px" }}>Evidence</h3>
          <EvidenceList links={model.evidenceLinks} />
        </aside>
      </div>
    )}
  </SurfaceShell>
);

export default defineFrontComponent({
  universalIdentifier: SELLER_JOURNEYS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: "Seller Journeys",
  description: "Seller-facing journey progression and assurance impact surface",
  component: SellerJourneysSurface,
});
