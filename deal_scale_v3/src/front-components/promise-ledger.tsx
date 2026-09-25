import { defineFrontComponent } from "twenty-sdk/define";

import type { PromiseLedgerModel } from "../promise-ledger/surface-model";
import { PROMISE_LEDGER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from "../seller-journeys/identifiers";
import {
  EmptySurface,
  EvidenceList,
  MetricCard,
  StatusPill,
  SurfaceShell,
  colors,
} from "./surface-primitives";

export const EMPTY_PROMISE_LEDGER_MODEL: PromiseLedgerModel = {
  items: [],
  counts: { total: 0, fulfilled: 0, unresolved: 0, atRisk: 0, dueSoon: 0 },
};

export const PromiseLedgerSurface = ({ model = EMPTY_PROMISE_LEDGER_MODEL }: { model?: PromiseLedgerModel }) => (
  <SurfaceShell
    eyebrow="Commitment assurance"
    title="Promise Ledger"
    description="Review seller commitments with explicit due windows, source evidence, fulfillment signals, and detector impact."
  >
    <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: "18px" }}>
      <MetricCard label="Promises" value={model.counts.total} />
      <MetricCard label="Fulfilled" value={model.counts.fulfilled} accent={colors.success} />
      <MetricCard label="Due soon" value={model.counts.dueSoon} accent={colors.warning} />
      <MetricCard label="At risk" value={model.counts.atRisk} accent={colors.risk} />
    </div>
    {model.items.length === 0 ? (
      <EmptySurface message="No contract snapshot available. Connect a read-only Promise Ledger snapshot to populate commitments and evidence." />
    ) : (
      <div style={{ display: "grid", gap: "12px" }}>
        {model.items.map((item) => (
          <article key={item.externalId} style={{ border: `1px solid ${item.status === "at-risk" ? `${colors.risk}66` : colors.line}`, borderRadius: "14px", padding: "18px" }}>
            <div style={{ alignItems: "flex-start", display: "flex", gap: "12px", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: colors.muted, fontSize: "12px" }}>{item.maker}</div>
                <h2 style={{ fontSize: "17px", margin: "4px 0" }}>{item.title}</h2>
              </div>
              <StatusPill status={item.status} />
            </div>
            <div style={{ color: colors.muted, display: "grid", fontSize: "13px", gap: "5px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginTop: "14px" }}>
              <span>Promise owner: <strong style={{ color: colors.ink }}>{item.owner}</strong></span>
              <span>Due: <strong style={{ color: colors.ink }}>{item.dueLabel}</strong></span>
              <span>SLA: <strong style={{ color: colors.ink }}>{item.sla.state}</strong></span>
              <span>State: <strong style={{ color: colors.ink }}>{item.extractionStatus}</strong></span>
              <span>Confidence: <strong style={{ color: colors.ink }}>{Math.round(item.confidence * 100)}%</strong></span>
              <span>Assurance cases: <strong style={{ color: colors.ink }}>{item.assuranceImpact.caseCount}</strong></span>
            </div>
            <div style={{ borderTop: `1px solid ${colors.line}`, display: "grid", gap: "5px", marginTop: "14px", paddingTop: "12px" }}>
              <div style={{ color: colors.muted, fontSize: "11px", textTransform: "uppercase" }}>Expected vs actual outcome</div>
              <div style={{ fontSize: "13px" }}>
                Expected: <strong>{item.outcome.expected}</strong> ({item.outcome.acceptableVariants.join(", ")})
              </div>
              <div style={{ color: item.outcome.state === "fulfilled" ? colors.success : colors.risk, fontSize: "13px" }}>
                Actual: <strong>{item.outcome.actual ?? "Missing - no observed fulfillment event"}</strong>
                {item.outcome.actualOccurredAt ? ` - ${item.outcome.actualOccurredAt.toISOString()}` : ""}
              </div>
              {item.outcome.state === "review-required" ? (
                <div style={{ color: colors.risk, fontSize: "12px" }}>Unresolved: extraction requires review before fulfillment can be confirmed.</div>
              ) : null}
              <div style={{ color: colors.muted, fontSize: "11px" }}>Source snapshot: {item.sourceTimestamp.toISOString()}</div>
            </div>
            <div style={{ borderTop: `1px solid ${colors.line}`, marginTop: "14px", paddingTop: "12px" }}>
              <div style={{ color: colors.muted, fontSize: "11px", marginBottom: "7px", textTransform: "uppercase" }}>Evidence links</div>
              <EvidenceList links={item.evidenceLinks} />
            </div>
          </article>
        ))}
      </div>
    )}
  </SurfaceShell>
);

export default defineFrontComponent({
  universalIdentifier: PROMISE_LEDGER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: "Promise Ledger",
  description: "Seller promise status, due windows, evidence, and assurance impact surface",
  component: PromiseLedgerSurface,
});
