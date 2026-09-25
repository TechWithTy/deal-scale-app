import { useMemo, useState } from "react";
import { defineFrontComponent } from "twenty-sdk/define";
import { Button } from "twenty-ui/primitives/input";
import { Tag, Status } from "twenty-ui/primitives/data-display";
import { Card } from "twenty-ui/primitives/surfaces";

import {
  ASSURANCE_CASE_DETAIL_IDENTIFIERS,
  DISPOSITION_OPTIONS,
  getEvidenceDrawerState,
  getDispositionControlState,
  selectEvidenceId,
  sortEvidenceTimeline,
} from "src/assurance-case-detail/contract";
import { ASSURANCE_CASE_DETAIL_PREVIEW } from "src/assurance-case-detail/fixture";
import { FEATURE_FLAGS, type FeatureFlag } from "src/config/feature-flags";
import type { AssuranceRole } from "src/security/rbac";

export type AssuranceCaseDetailProps = {
  role?: AssuranceRole;
  flags?: Partial<Record<FeatureFlag, boolean>>;
};

const DEFAULT_FLAGS = {
  [FEATURE_FLAGS.managerDisposition]: true,
} satisfies Partial<Record<FeatureFlag, boolean>>;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const DetailValue = ({ label, value }: { label: string; value: string }) => (
  <div className="assurance-case-detail__value">
    <span className="assurance-case-detail__label">{label}</span>
    <span>{value}</span>
  </div>
);

export const AssuranceCaseDetail = ({
  role = "manager",
  flags = DEFAULT_FLAGS,
}: AssuranceCaseDetailProps) => {
  const detail = ASSURANCE_CASE_DETAIL_PREVIEW;
  const evidence = useMemo(() => sortEvidenceTimeline(detail.evidence), [detail.evidence]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [pendingDisposition, setPendingDisposition] = useState<string | null>(null);
  const selectedEvidence = evidence.find((item) => item.evidenceId === selectedEvidenceId);
  const dispositionState = getDispositionControlState({ role, flags });

  return (
    <div className="assurance-case-detail">
      <style>{`
        .assurance-case-detail { background: #f8f9fb; color: #202124; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; min-height: 100%; padding: 28px; }
        .assurance-case-detail__shell { margin: 0 auto; max-width: 1180px; }
        .assurance-case-detail__eyebrow { color: #6f7480; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
        .assurance-case-detail__header { align-items: flex-start; display: flex; gap: 18px; justify-content: space-between; margin-bottom: 24px; }
        .assurance-case-detail__title { font-size: 28px; font-weight: 650; letter-spacing: -.03em; margin: 5px 0 10px; }
        .assurance-case-detail__summary { color: #6f7480; font-size: 14px; margin: 0; }
        .assurance-case-detail__status { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; }
        .assurance-case-detail__content { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr) 350px; }
        .assurance-case-detail__main, .assurance-case-detail__aside { display: grid; gap: 18px; align-content: start; }
        .assurance-case-detail__card { border: 1px solid #e1e4e8; border-radius: 14px; padding: 20px; }
        .assurance-case-detail__card h2 { font-size: 15px; margin: 0 0 16px; }
        .assurance-case-detail__finding { background: #fffaf0; border-color: #f3dfae; }
        .assurance-case-detail__finding-title { font-size: 19px; font-weight: 620; margin: 10px 0 8px; }
        .assurance-case-detail__muted { color: #6f7480; font-size: 13px; line-height: 1.55; }
        .assurance-case-detail__values { display: grid; gap: 13px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .assurance-case-detail__value { display: grid; gap: 4px; font-size: 13px; min-width: 0; overflow-wrap: anywhere; }
        .assurance-case-detail__label { color: #858b96; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }
        .assurance-case-detail__evidence-list { display: grid; gap: 10px; }
        .assurance-case-detail__evidence-item { background: #fff; border: 1px solid #e1e4e8; border-radius: 10px; cursor: pointer; padding: 14px; text-align: left; transition: border-color .15s, box-shadow .15s; }
        .assurance-case-detail__evidence-item:hover, .assurance-case-detail__evidence-item[data-selected="true"] { border-color: #8b7cf6; box-shadow: 0 4px 16px #4d40a914; }
        .assurance-case-detail__evidence-meta { color: #858b96; display: flex; font-size: 12px; gap: 8px; justify-content: space-between; }
        .assurance-case-detail__evidence-title { font-size: 14px; font-weight: 600; margin: 7px 0; }
        .assurance-case-detail__evidence-excerpt { color: #626875; font-size: 13px; line-height: 1.45; margin: 0; }
        .assurance-case-detail__actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .assurance-case-detail__notice { background: #f3f1ff; border-radius: 8px; color: #5f52ba; font-size: 12px; line-height: 1.45; margin-top: 14px; padding: 10px 12px; }
        .assurance-case-detail__drawer { min-width: 0; }
        .assurance-case-detail__drawer-header { align-items: flex-start; display: flex; gap: 12px; justify-content: space-between; }
        .assurance-case-detail__drawer-title { font-size: 18px; font-weight: 650; margin: 6px 0 0; }
        .assurance-case-detail__hash { color: #858b96; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; overflow-wrap: anywhere; }
        @media (max-width: 860px) {
          .assurance-case-detail { padding: 18px; }
          .assurance-case-detail__header { display: grid; }
          .assurance-case-detail__content { display: block; }
          .assurance-case-detail__aside { margin-top: 18px; }
          .assurance-case-detail__drawer[data-state="open"] { background: #fff; box-shadow: -10px 0 28px #1f293726; inset: 0 0 0 auto; max-width: 390px; overflow-y: auto; padding: 18px; position: fixed; width: 88vw; z-index: 20; }
        }
      `}</style>
      <div className="assurance-case-detail__shell">
        <header className="assurance-case-detail__header">
          <div>
            <div className="assurance-case-detail__eyebrow">Assurance case</div>
            <h1 className="assurance-case-detail__title">{detail.assuranceCase.name}</h1>
            <p className="assurance-case-detail__summary">
              Review the detector reasoning and source-backed evidence before deciding.
            </p>
          </div>
          <div className="assurance-case-detail__status" aria-label="Case status and decision">
            <Status color="amber">{detail.assuranceCase.caseStatus}</Status>
            <Tag color="violet" variant="soft">{detail.detector.detectorType}</Tag>
            <Tag color="gray" variant="outline">{detail.disposition.disposition}</Tag>
          </div>
        </header>

        <div className="assurance-case-detail__content">
          <main className="assurance-case-detail__main">
            <Card className="assurance-case-detail__card assurance-case-detail__finding">
              <h2>Detector finding</h2>
              <Tag color="amber" variant="soft">{Math.round(detail.detector.confidence * 100)}% confidence</Tag>
              <div className="assurance-case-detail__finding-title">{detail.detector.findingTitle}</div>
              <p className="assurance-case-detail__muted">{detail.detector.findingSummary}</p>
              <div className="assurance-case-detail__values">
                <DetailValue label="Recommended action" value={detail.detector.recommendedAction} />
                <DetailValue label="Policy version" value={detail.detector.sourceVersion} />
              </div>
            </Card>

            <Card className="assurance-case-detail__card">
              <h2>Evidence timeline</h2>
              {evidence.length === 0 ? (
                <p className="assurance-case-detail__muted">No evidence is attached to this case yet.</p>
              ) : (
                <div className="assurance-case-detail__evidence-list">
                  {evidence.map((item) => (
                    <button
                      className="assurance-case-detail__evidence-item"
                      data-selected={item.evidenceId === selectedEvidenceId}
                      key={item.evidenceId}
                      onClick={() => setSelectedEvidenceId(selectEvidenceId(selectedEvidenceId, item.evidenceId, evidence))}
                      type="button"
                    >
                      <div className="assurance-case-detail__evidence-meta">
                        <span>{item.sourceLabel}</span>
                        <span>{formatDate(item.observedAt)}</span>
                      </div>
                      <div className="assurance-case-detail__evidence-title">{item.eventLabel}</div>
                      <p className="assurance-case-detail__evidence-excerpt">{item.excerpt}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </main>

          <aside className="assurance-case-detail__aside">
            <Card className="assurance-case-detail__card">
              <h2>Provenance</h2>
              <div className="assurance-case-detail__values">
                <DetailValue label="Source version" value={detail.assuranceCase.sourceVersion} />
                <DetailValue label="Record version" value={String(detail.assuranceCase.recordVersion)} />
                <DetailValue label="Observed at" value={formatDate(detail.assuranceCase.observedAt)} />
                <DetailValue label="State" value={detail.assuranceCase.provenanceState} />
              </div>
              <p className="assurance-case-detail__hash">{detail.assuranceCase.provenanceRef}</p>
            </Card>

            <Card className="assurance-case-detail__card">
              <h2>Disposition</h2>
              {dispositionState.canEdit ? (
                <>
                  <div className="assurance-case-detail__actions">
                    {DISPOSITION_OPTIONS.map((option) => (
                      <Button
                        color={option.value === "dismiss" ? "danger" : "accent"}
                        key={option.value}
                        onClick={() => setPendingDisposition(option.value)}
                        size="sm"
                        variant={pendingDisposition === option.value ? "solid" : "outline"}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <div className="assurance-case-detail__notice">
                    Unsaved preview: this selection stays local because no persistence adapter is configured.
                  </div>
                </>
              ) : (
                <p className="assurance-case-detail__muted">
                  Disposition controls are read-only for this role or feature configuration.
                </p>
              )}
            </Card>

            <aside
              aria-label="Evidence detail drawer"
              className="assurance-case-detail__drawer"
              data-state={getEvidenceDrawerState(selectedEvidenceId)}
            >
              <Card className="assurance-case-detail__card">
                {selectedEvidence ? (
                  <>
                    <div className="assurance-case-detail__drawer-header">
                      <div>
                        <div className="assurance-case-detail__eyebrow">Selected evidence</div>
                        <div className="assurance-case-detail__drawer-title">{selectedEvidence.eventLabel}</div>
                      </div>
                      <Button onClick={() => setSelectedEvidenceId(null)} size="sm" variant="ghost">Close</Button>
                    </div>
                    <p className="assurance-case-detail__muted">{selectedEvidence.excerpt}</p>
                    <div className="assurance-case-detail__values">
                      <DetailValue label="Evidence type" value={selectedEvidence.evidenceType} />
                      <DetailValue label="Observed at" value={formatDate(selectedEvidence.observedAt)} />
                    </div>
                    <p className="assurance-case-detail__hash">{selectedEvidence.contentHash}</p>
                  </>
                ) : (
                  <p className="assurance-case-detail__muted">Select an evidence item to inspect its traceability details.</p>
                )}
              </Card>
            </aside>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: ASSURANCE_CASE_DETAIL_IDENTIFIERS.frontComponent,
  name: "Assurance Case Detail",
  description: "Reviewer-facing assurance case evidence and disposition surface",
  component: AssuranceCaseDetail,
});
