import { type z } from "zod";

import {
  detectorCandidateSchema,
  opportunityReferenceSchema,
  sellerIdentitySchema,
} from "../assurance/schema";
import {
  buildPromiseLedgerModel,
  type AssuranceCase,
  type AssuranceEvent,
  type EvidenceLink,
  type PromiseLedgerModel,
} from "../promise-ledger/surface-model";
import type { PromiseLedgerRecord } from "../promise-ledger/contract";

export type SellerIdentity = z.infer<typeof sellerIdentitySchema>;
export type OpportunityReference = z.infer<typeof opportunityReferenceSchema>;
export type DetectorCandidate = z.infer<typeof detectorCandidateSchema>;

export type SellerJourneyInput = {
  seller: SellerIdentity;
  opportunity: OpportunityReference;
  events: ReadonlyArray<AssuranceEvent>;
  promises: ReadonlyArray<PromiseLedgerRecord>;
  assuranceCases: ReadonlyArray<AssuranceCase>;
  detectorCandidates: ReadonlyArray<DetectorCandidate>;
};

export type JourneyMilestone = {
  id: string;
  label: string;
  eventType: string;
  occurredAt: Date;
  sourceRef: string;
};

export type SellerJourneyModel = {
  sellerName: string;
  opportunityName: string;
  stage: string;
  milestones: JourneyMilestone[];
  promises: PromiseLedgerModel;
  evidenceLinks: EvidenceLink[];
  risk: {
    openCaseCount: number;
    unresolvedPromiseCount: number;
    atRiskPromiseCount: number;
    highestDetectorConfidence: number;
    isAtRisk: boolean;
  };
};

export function buildSellerJourneyModel(
  input: SellerJourneyInput,
  asOf: Date,
): SellerJourneyModel {
  const events = [...input.events].sort(
    (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime(),
  );
  const promises = buildPromiseLedgerModel(
    input.promises,
    events,
    input.assuranceCases,
    asOf,
  );
  const opportunityCases = input.assuranceCases.filter(
    (assuranceCase) => assuranceCase.opportunityReferenceId === input.opportunity.externalId,
  );
  const linkedDetectorIds = new Set(
    opportunityCases.map((assuranceCase) => assuranceCase.detectorCandidateId),
  );
  const detectorConfidence = input.detectorCandidates
    .filter(
      (candidate) =>
        linkedDetectorIds.has(candidate.externalId) || linkedDetectorIds.has(candidate.name),
    )
    .map((candidate) => candidate.confidence);
  const evidenceLinks = uniqueEvidenceLinks(promises.items.flatMap((item) => item.evidenceLinks));

  return {
    sellerName: input.seller.displayName,
    opportunityName: input.opportunity.name,
    stage: input.opportunity.stage,
    milestones: events.map((event) => ({
      id: event.externalId,
      label: event.name,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      sourceRef: event.provenanceRef,
    })),
    promises,
    evidenceLinks,
    risk: {
      openCaseCount: opportunityCases.filter((item) => item.caseStatus === "open").length,
      unresolvedPromiseCount: promises.counts.unresolved,
      atRiskPromiseCount: promises.counts.atRisk,
      highestDetectorConfidence: detectorConfidence.length ? Math.max(...detectorConfidence) : 0,
      isAtRisk:
        opportunityCases.some((item) => item.caseStatus === "open") || promises.counts.atRisk > 0,
    },
  };
}

function uniqueEvidenceLinks(links: ReadonlyArray<EvidenceLink>): EvidenceLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
