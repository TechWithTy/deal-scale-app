import { type z } from "zod";

import { assuranceCaseSchema, eventSchema } from "../assurance/schema";
import type { PromiseLedgerRecord } from "./contract";

export type AssuranceEvent = z.infer<typeof eventSchema>;
export type AssuranceCase = z.infer<typeof assuranceCaseSchema>;
export type PromiseStatus = "fulfilled" | "at-risk" | "due-soon" | "open";

export type EvidenceLink = {
  href: string;
  label: string;
  evidenceId: string;
};

export type PromiseLedgerItem = {
  externalId: string;
  title: string;
  maker: string;
  status: PromiseStatus;
  fulfillmentObserved: boolean;
  dueWindow: PromiseLedgerRecord["dueWindow"];
  dueLabel: string;
  extractionStatus: PromiseLedgerRecord["extractionStatus"];
  confidence: number;
  expectedFulfillmentEvent: PromiseLedgerRecord["expectedFulfillmentEvent"];
  evidenceLinks: EvidenceLink[];
  assuranceImpact: {
    caseCount: number;
    openCaseCount: number;
  };
};

export type PromiseLedgerModel = {
  items: PromiseLedgerItem[];
  counts: {
    total: number;
    fulfilled: number;
    unresolved: number;
    atRisk: number;
    dueSoon: number;
  };
};

const REVIEW_HORIZON_MS = 72 * 60 * 60 * 1000;

export function buildPromiseLedgerItem(
  record: PromiseLedgerRecord,
  events: ReadonlyArray<AssuranceEvent>,
  assuranceCases: ReadonlyArray<AssuranceCase>,
  asOf: Date,
): PromiseLedgerItem {
  const fulfillmentObserved = events.some(
    (event) =>
      event.occurredAt.getTime() <= asOf.getTime() &&
      record.expectedFulfillmentEvent.acceptableVariants.includes(event.eventType),
  );
  const startsAt = dueStart(record);
  const endsAt = dueEnd(record);
  const dueSoon =
    startsAt >= asOf.getTime() && startsAt - asOf.getTime() <= REVIEW_HORIZON_MS;
  const needsReview = record.extractionStatus !== "accepted";
  const overdue = endsAt < asOf.getTime();
  const status: PromiseStatus = fulfillmentObserved
    ? "fulfilled"
    : needsReview || overdue
      ? "at-risk"
      : dueSoon
        ? "due-soon"
        : "open";
  const matchingCases = assuranceCases.filter(
    (assuranceCase) => assuranceCase.opportunityReferenceId === record.opportunityReferenceId,
  );

  return {
    externalId: record.externalId,
    title: record.action.description,
    maker: record.maker.identityRef,
    status,
    fulfillmentObserved,
    dueWindow: record.dueWindow,
    dueLabel: formatDueLabel(record.dueWindow),
    extractionStatus: record.extractionStatus,
    confidence: record.confidence,
    expectedFulfillmentEvent: record.expectedFulfillmentEvent,
    evidenceLinks: record.evidenceReferences.map((reference) => ({
      href: reference.locator,
      label: `${reference.sourceType} evidence`,
      evidenceId: reference.evidenceId,
    })),
    assuranceImpact: {
      caseCount: matchingCases.length,
      openCaseCount: matchingCases.filter((item) => item.caseStatus === "open").length,
    },
  };
}

export function buildPromiseLedgerModel(
  records: ReadonlyArray<PromiseLedgerRecord>,
  events: ReadonlyArray<AssuranceEvent>,
  assuranceCases: ReadonlyArray<AssuranceCase>,
  asOf: Date,
): PromiseLedgerModel {
  const items = records.map((record) =>
    buildPromiseLedgerItem(record, events, assuranceCases, asOf),
  );

  return {
    items,
    counts: {
      total: items.length,
      fulfilled: items.filter((item) => item.status === "fulfilled").length,
      unresolved: items.filter((item) => item.status !== "fulfilled").length,
      atRisk: items.filter((item) => item.status === "at-risk").length,
      dueSoon: items.filter((item) => item.status === "due-soon").length,
    },
  };
}

function dueStart(record: PromiseLedgerRecord): number {
  return Date.parse(record.dueWindow.kind === "point" ? record.dueWindow.dueAt : record.dueWindow.startsAt);
}

function dueEnd(record: PromiseLedgerRecord): number {
  return Date.parse(record.dueWindow.kind === "point" ? record.dueWindow.dueAt : record.dueWindow.endsAt);
}

function formatDueLabel(window: PromiseLedgerRecord["dueWindow"]): string {
  if (window.kind === "point") return `Due ${formatDate(window.dueAt)}`;
  return `${formatDate(window.startsAt)} – ${formatDate(window.endsAt)}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(value),
  );
}
