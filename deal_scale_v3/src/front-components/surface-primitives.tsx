import type { ReactNode } from "react";

import type { EvidenceLink } from "../promise-ledger/surface-model";

const colors = {
  ink: "#17212b",
  muted: "#647181",
  line: "#dce3ea",
  panel: "#f7f9fb",
  accent: "#315c8c",
  risk: "#a3472f",
  success: "#28734e",
  warning: "#94631d",
};

export const SurfaceShell = ({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <main
    style={{
      boxSizing: "border-box",
      color: colors.ink,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      maxWidth: "1120px",
      padding: "28px",
      width: "100%",
    }}
  >
    <div style={{ marginBottom: "24px" }}>
      <div style={{ color: colors.accent, fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {eyebrow}
      </div>
      <h1 style={{ fontSize: "28px", lineHeight: 1.15, margin: "8px 0" }}>{title}</h1>
      <p style={{ color: colors.muted, fontSize: "14px", lineHeight: 1.5, margin: 0, maxWidth: "720px" }}>
        {description}
      </p>
    </div>
    {children}
  </main>
);

export const StatusPill = ({ status, label }: { status: string; label?: string }) => {
  const color = status === "fulfilled" ? colors.success : status === "at-risk" ? colors.risk : status === "due-soon" ? colors.warning : colors.accent;
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}55`, borderRadius: "999px", color, display: "inline-flex", fontSize: "11px", fontWeight: 700, padding: "4px 8px" }}>
      {label ?? status.replace("-", " ")}
    </span>
  );
};

export const MetricCard = ({ label, value, accent }: { label: string; value: string | number; accent?: string }) => (
  <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "12px", padding: "16px" }}>
    <div style={{ color: colors.muted, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ color: accent ?? colors.ink, fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>{value}</div>
  </div>
);

export const EvidenceList = ({ links }: { links: ReadonlyArray<EvidenceLink> }) => (
  <div style={{ display: "grid", gap: "8px" }}>
    {links.length === 0 ? (
      <span style={{ color: colors.muted, fontSize: "13px" }}>No evidence links in this snapshot.</span>
    ) : (
      links.map((link) => (
        <a key={`${link.evidenceId}-${link.href}`} href={link.href} rel="noreferrer" style={{ color: colors.accent, fontSize: "13px", overflowWrap: "anywhere" }} target="_blank">
          {link.label} · {link.evidenceId}
        </a>
      ))
    )}
  </div>
);

export const EmptySurface = ({ message }: { message: string }) => (
  <div style={{ background: colors.panel, border: `1px dashed ${colors.line}`, borderRadius: "12px", color: colors.muted, fontSize: "13px", padding: "20px" }}>
    {message}
  </div>
);

export { colors };
