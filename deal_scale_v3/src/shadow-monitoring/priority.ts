export type ShadowPriorityBand = "low" | "medium" | "high" | "critical";

export type ShadowPriority = {
  score: number;
  band: ShadowPriorityBand;
  severity: number;
  urgency: number;
  evidenceCompleteness: number;
};

export type ShadowPriorityInput = Pick<ShadowPriority, "severity" | "urgency" | "evidenceCompleteness">;

const scoreFor = (value: number, name: string) => {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError(`${name} must be between 0 and 1`);
  return value;
};

export const calculateShadowPriority = ({ severity, urgency, evidenceCompleteness }: ShadowPriorityInput): ShadowPriority => {
  const normalizedSeverity = scoreFor(severity, "severity");
  const normalizedUrgency = scoreFor(urgency, "urgency");
  const normalizedCompleteness = scoreFor(evidenceCompleteness, "evidenceCompleteness");
  const score = Math.round(((normalizedSeverity + normalizedUrgency + normalizedCompleteness) / 3) * 100);
  return {
    score,
    band: score >= 80 ? "critical" : score >= 60 ? "high" : score >= 35 ? "medium" : "low",
    severity: normalizedSeverity,
    urgency: normalizedUrgency,
    evidenceCompleteness: normalizedCompleteness,
  };
};
