import type {
  GoldenPackResult,
  GoldenScenario,
} from "./contracts";

export const runGoldenCalibrationPack = (
  scenarios: readonly GoldenScenario[],
  scope: { tenantId: string },
): GoldenPackResult => {
  const accepted: GoldenScenario[] = [];
  const rejectedCaseIds: string[] = [];
  const rejectionReasons: Array<GoldenPackResult["rejectionReasons"][number]> = [];

  for (const scenario of scenarios) {
    const reason = scenario.tenantId !== scope.tenantId
      ? "tenant_mismatch"
      : scenario.readiness !== "ready"
        ? "insufficient_evidence"
        : scenario.evidenceIds.length === 0
          ? "missing_evidence"
          : null;

    if (reason) {
      rejectedCaseIds.push(scenario.caseId);
      rejectionReasons.push({ caseId: scenario.caseId, code: reason });
    } else {
      accepted.push(scenario);
    }
  }

  const records = [...accepted].sort((left, right) => left.caseId.localeCompare(right.caseId));
  return {
    acceptedCaseIds: records.map(({ caseId }) => caseId),
    rejectedCaseIds,
    rejectionReasons,
    records,
  };
};
