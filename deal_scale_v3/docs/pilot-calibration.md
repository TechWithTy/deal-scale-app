# Pilot calibration and falsification gates

The calibration pack evaluates labeled historical audit and shadow outputs
without changing CRM data or claiming business outcomes that are not evidenced.

## Labels and denominators

Records are labeled `true_positive`, `false_positive`,
`insufficient_evidence`, or `native_system_obvious`. Precision and false-positive
rate use the predicted-positive denominator (`true_positive + false_positive`).
Insufficient-evidence and native-system-obvious rates use the complete accepted
sample. Undefined denominators are represented as `null`, never as zero.

## Golden scenarios

The pack accepts only records for the requested tenant that are readiness
`ready` and carry at least one evidence reference. Foreign tenants, degraded or
insufficient readiness, and empty evidence are rejected with a reason that is
preserved in the report. Accepted records are sorted by case ID for reproducible
reports.

## Falsification decisions

`proceed` means every measured threshold passes. `iterate` means a measured
precision, false-positive, or insufficient-evidence threshold fails while the
sample is otherwise usable. `pivot` means a required metric has no denominator
or native-system-obvious coverage exceeds its threshold. Threshold owners must
review the failures before a pilot launch.

## Manual QA and outcome claims

QA owns scenario labeling, sample review, native-system comparison, and launch
checklist sign-off. The report does not calculate recovered revenue or
attribution. Recovered revenue requires supported outcome evidence.
