import type { CSSProperties, ReactNode } from "react";
import { IconAlertTriangle, IconCheck, IconChevronRight, IconShield } from "twenty-ui/icon";

import type { RemediationAction, SurfaceState } from "src/assurance-surfaces/models";

export type Tone = "good" | "warn" | "bad" | "neutral";

const tones: Record<Tone, { accent: string; background: string; text: string }> = {
  good: { accent: "#3B9B68", background: "#EAF7EF", text: "#21623E" },
  warn: { accent: "#C78A22", background: "#FFF6DE", text: "#805A10" },
  bad: { accent: "#C55454", background: "#FDEDED", text: "#873333" },
  neutral: { accent: "#76808F", background: "#F2F4F7", text: "#4A5360" },
};

const cardStyle: CSSProperties = {
  border: "1px solid #E5E8EC",
  borderRadius: "14px",
  background: "#FFFFFF",
  padding: "18px",
};

export const RESPONSIVE_SURFACE_GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "12px",
};

export const getSurfaceStatePresentation = (
  state: Exclude<SurfaceState, "ready">,
  message?: string,
) => {
  const presentation = {
    disabled: {
      label: "Unavailable",
      tone: "neutral" as Tone,
      message: "This assurance surface is not enabled for the current workspace.",
    },
    forbidden: {
      label: "Restricted",
      tone: "bad" as Tone,
      message: "Your role does not have read access to this assurance surface.",
    },
    "missing-scope": {
      label: "Scope required",
      tone: "warn" as Tone,
      message: "A workspace scope is required before assurance data can be shown.",
    },
    loading: {
      label: "Loading",
      tone: "neutral" as Tone,
      message: "Loading the latest read-only assurance snapshot.",
    },
    error: {
      label: "Unavailable",
      tone: "bad" as Tone,
      message: "The assurance snapshot could not be loaded.",
    },
    empty: {
      label: "No data",
      tone: "neutral" as Tone,
      message: "No assurance snapshot is available for the current scope.",
    },
  } satisfies Record<Exclude<SurfaceState, "ready">, { label: string; tone: Tone; message: string }>;

  return { ...presentation[state], ...(message ? { message } : {}) };
};

export const SurfaceStateNotice = ({
  state,
  message,
}: {
  state: Exclude<SurfaceState, "ready">;
  message?: string;
}) => {
  const presentation = getSurfaceStatePresentation(state, message);
  return (
    <section
      aria-live="polite"
      style={{
        ...cardStyle,
        borderColor: `${tones[presentation.tone].accent}55`,
        background: tones[presentation.tone].background,
        color: tones[presentation.tone].text,
      }}
    >
      <strong style={{ display: "block", fontSize: "13px" }}>{presentation.label}</strong>
      <span style={{ display: "block", fontSize: "12px", lineHeight: 1.5, marginTop: "5px" }}>
        {presentation.message}
      </span>
    </section>
  );
};

export const SurfaceShell = ({
  eyebrow,
  title,
  description,
  status,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  status: { label: string; tone: Tone };
  children: ReactNode;
}) => (
  <main
    style={{
      boxSizing: "border-box",
      minHeight: "100%",
      padding: "clamp(12px, 4vw, 24px)",
      background: "#FAFBFC",
      color: "#20242A",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}
  >
    <div style={{ maxWidth: "1180px", minWidth: 0, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "22px" }}>
        <div>
          <div style={{ color: "#7A8491", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{eyebrow}</div>
          <h1 style={{ fontSize: "28px", lineHeight: 1.15, margin: "8px 0 7px", letterSpacing: "-0.03em" }}>{title}</h1>
          <p style={{ color: "#68727E", fontSize: "13px", lineHeight: 1.5, margin: 0, maxWidth: "650px" }}>{description}</p>
        </div>
        <StatusChip label={status.label} tone={status.tone} />
      </div>
      {children}
      <p style={{ color: "#8B949E", fontSize: "11px", margin: "18px 0 0", textAlign: "right" }}>Read-only preview · actions do not write records</p>
    </div>
  </main>
);

export const SurfaceCard = ({ title, detail, children }: { title: string; detail?: string; children: ReactNode }) => (
  <section style={{ ...cardStyle, minWidth: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "baseline", marginBottom: "15px" }}>
      <h2 style={{ fontSize: "14px", margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      {detail ? <span style={{ color: "#8B949E", fontSize: "11px" }}>{detail}</span> : null}
    </div>
    {children}
  </section>
);

export const StatusChip = ({ label, tone }: { label: string; tone: Tone }) => {
  const color = tones[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "6px 10px", color: color.text, background: color.background, fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color.accent }} />{label}</span>;
};

export const MetricCard = ({ label, value, detail, tone = "neutral" }: { label: string; value: string | number; detail: string; tone?: Tone }) => (
  <div style={{ ...cardStyle, padding: "15px" }}>
    <div style={{ color: "#7A8491", fontSize: "11px", fontWeight: 600 }}>{label}</div>
    <div style={{ color: tones[tone].text, fontSize: "26px", fontWeight: 700, margin: "8px 0 3px", letterSpacing: "-0.04em" }}>{value}</div>
    <div style={{ color: "#8B949E", fontSize: "11px" }}>{detail}</div>
  </div>
);

export const ProgressBar = ({ value, tone = "good" }: { value: number; tone?: Tone }) => (
  <div aria-label={`${value}% complete`} role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={value} style={{ height: "8px", borderRadius: "999px", background: "#EDF0F2", overflow: "hidden" }}>
    <div style={{ width: `${value}%`, height: "100%", borderRadius: "inherit", background: tones[tone].accent }} />
  </div>
);

export const GapRow = ({ label, count, detail }: { label: string; count: number; detail: string }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "11px 0", borderBottom: "1px solid #EEF0F2" }}>
    <IconAlertTriangle color="#C78A22" size={17} />
    <div style={{ flex: 1 }}><div style={{ fontSize: "12px", fontWeight: 650 }}>{label}</div><div style={{ color: "#7A8491", fontSize: "11px", lineHeight: 1.4, marginTop: "3px" }}>{detail}</div></div>
    <span style={{ color: "#805A10", background: "#FFF6DE", borderRadius: "8px", fontSize: "11px", fontWeight: 700, padding: "4px 7px" }}>{count}</span>
  </div>
);

export const RemediationRow = ({ action, selected, onSelect, disabled = false }: { action: RemediationAction; selected: boolean; onSelect: () => void; disabled?: boolean }) => (
  <button type="button" disabled={disabled} aria-disabled={disabled} onClick={onSelect} style={{ display: "flex", width: "100%", alignItems: "center", gap: "10px", textAlign: "left", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, border: selected ? "1px solid #A8C7B4" : "1px solid #EEF0F2", borderRadius: "10px", background: selected ? "#F4FBF6" : "#FFFFFF", padding: "11px", marginBottom: "8px" }}>
    <IconChevronRight color={selected ? "#3B9B68" : "#A5ADB6"} size={16} />
    <span style={{ flex: 1 }}><span style={{ display: "block", fontSize: "12px", fontWeight: 650 }}>{action.label}</span><span style={{ display: "block", color: "#7A8491", fontSize: "11px", lineHeight: 1.4, marginTop: "3px" }}>{action.detail}</span></span>
    <StatusChip label={action.priority} tone={action.priority === "High" ? "bad" : "warn"} />
  </button>
);

export const CheckIcon = ({ tone = "good" }: { tone?: Tone }) => tone === "good" ? <IconCheck color={tones[tone].accent} size={16} /> : <IconShield color={tones[tone].accent} size={16} />;
