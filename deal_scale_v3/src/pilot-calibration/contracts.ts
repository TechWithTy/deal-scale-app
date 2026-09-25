export type CalibrationLabel =
  | "true_positive"
  | "false_positive"
  | "insufficient_evidence"
  | "native_system_obvious";

export type CalibrationRecord = {
  tenantId: string;
  caseId: string;
  label: CalibrationLabel;
  predictedFinding: boolean;
  readiness: "ready" | "degraded" | "insufficient_evidence";
  nativeSystemObvious: boolean;
  evidenceIds: readonly string[];
};

export type CalibrationMetrics = {
  sampleSize: number;
  precision: number | null;
  falsePositiveRate: number | null;
  insufficientEvidenceRate: number | null;
  nativeSystemObviousRate: number | null;
};

export type GoldenScenario = CalibrationRecord;

export type GoldenPackResult = {
  acceptedCaseIds: readonly string[];
  rejectedCaseIds: readonly string[];
  rejectionReasons: readonly {
    caseId: string;
    code: "tenant_mismatch" | "insufficient_evidence" | "missing_evidence";
  }[];
  records: readonly CalibrationRecord[];
};

export type FalsificationThresholds = {
  minimumPrecision: number;
  maximumFalsePositiveRate: number;
  maximumInsufficientEvidenceRate: number;
  maximumNativeSystemObviousRate: number;
};

export type GateDecision = "proceed" | "iterate" | "pivot";

export type FalsificationResult = {
  decision: GateDecision;
  failures: readonly {
    metric: keyof CalibrationMetrics;
    observed: number | null;
    threshold: number;
  }[];
};
