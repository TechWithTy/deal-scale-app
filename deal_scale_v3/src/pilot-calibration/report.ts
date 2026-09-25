import type {
  CalibrationMetrics,
  FalsificationResult,
  GoldenPackResult,
} from "./contracts";

const UNSUPPORTED_REVENUE_CLAIM = "recovered revenue requires supported outcome evidence";

export const buildCalibrationReport = (input: {
  tenantId: string;
  generatedAt: string;
  metrics: CalibrationMetrics;
  falsification: FalsificationResult;
  goldenPack: GoldenPackResult;
}) => ({
  tenantId: input.tenantId,
  generatedAt: input.generatedAt,
  metrics: input.metrics,
  falsification: input.falsification,
  goldenPack: input.goldenPack,
  unsupportedClaims: [UNSUPPORTED_REVENUE_CLAIM] as const,
});
