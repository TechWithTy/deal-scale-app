import { useMemo, useState, type CSSProperties } from "react";
import { defineFrontComponent } from "twenty-sdk/define";
import { IconArrowUpRight, IconClock, IconFilter, IconInbox, IconSearch, IconShield } from "twenty-ui/icon";
import { Avatar } from "twenty-ui/primitives/data-display";
import { Button, Input } from "twenty-ui/primitives/input";
import { Card, CardContent } from "twenty-ui/primitives/surfaces";

import {
  ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS,
  createAssuranceInboxModel,
  type AssuranceInboxCase,
} from "src/assurance/assurance-inbox";
import { FEATURE_FLAGS } from "src/config/feature-flags";

const MODEL = createAssuranceInboxModel({
  role: "reviewer",
  featureFlags: { [FEATURE_FLAGS.assuranceInbox]: true },
});

const styles: Record<string, CSSProperties> = {
  page: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minHeight: "100%",
    padding: "32px clamp(20px, 4vw, 64px) 48px",
    background: "#f7f8fa",
    color: "#1f2937",
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: { display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" },
  eyebrow: { display: "flex", alignItems: "center", gap: "8px", color: "#5b6472", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: "8px 0 6px", color: "#18212f", fontSize: "30px", lineHeight: 1.1, letterSpacing: "-0.04em" },
  subtitle: { maxWidth: "600px", margin: 0, color: "#687385", fontSize: "14px", lineHeight: 1.5 },
  headerActions: { display: "flex", alignItems: "center", gap: "10px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" },
  summaryCard: { minHeight: "92px", border: "1px solid #e5e8ee", borderRadius: "14px", background: "#ffffff", boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)" },
  summaryLabel: { color: "#788293", fontSize: "12px", fontWeight: 600 },
  summaryValue: { marginTop: "10px", color: "#18212f", fontSize: "26px", fontWeight: 700 },
  toolbar: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px", border: "1px solid #e5e8ee", borderRadius: "14px", background: "#ffffff" },
  filterGroup: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" },
  filterButton: { border: "1px solid #e3e7ed", borderRadius: "999px", padding: "7px 12px", background: "#ffffff", color: "#5b6472", cursor: "pointer", fontSize: "12px", fontWeight: 600 },
  activeFilter: { borderColor: "#6c5ce7", background: "#f0edff", color: "#5746c8" },
  caseList: { display: "flex", flexDirection: "column", gap: "12px" },
  caseCard: { border: "1px solid #e5e8ee", borderRadius: "16px", background: "#ffffff", boxShadow: "0 4px 18px rgba(31, 41, 55, 0.04)" },
  caseContent: { display: "flex", flexDirection: "column", gap: "16px", padding: "20px" },
  caseTop: { display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" },
  caseHeading: { display: "flex", alignItems: "flex-start", gap: "12px" },
  caseTitle: { margin: 0, color: "#1c2635", fontSize: "16px", fontWeight: 700 },
  caseSummary: { margin: "5px 0 0", color: "#687385", fontSize: "13px", lineHeight: 1.45 },
  signals: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "7px" },
  signal: { display: "inline-flex", alignItems: "center", gap: "5px", borderRadius: "999px", padding: "5px 9px", background: "#f4f5f7", color: "#5b6472", fontSize: "11px", fontWeight: 700 },
  critical: { background: "#fff0ed", color: "#c34e3e" },
  watch: { background: "#fff8df", color: "#977117" },
  ready: { background: "#eaf8ef", color: "#2d8250" },
  details: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", borderTop: "1px solid #eef0f3", borderBottom: "1px solid #eef0f3", padding: "14px 0" },
  detailLabel: { color: "#8b95a4", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" },
  detailValue: { marginTop: "5px", color: "#3f4958", fontSize: "13px" },
  caseBottom: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  recommendation: { flex: "1 1 320px", margin: 0, color: "#687385", fontSize: "12px", lineHeight: 1.45 },
  footer: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", color: "#8993a2", fontSize: "11px" },
};

const urgencyStyle = (urgency: AssuranceInboxCase["urgency"]) => ({
  ...styles.signal,
  ...(urgency === "critical" ? styles.critical : urgency === "watch" ? styles.watch : styles.ready),
});

const CaseCard = ({ item, onReview }: { item: AssuranceInboxCase; onReview: (id: string) => void }) => (
  <Card style={styles.caseCard}>
    <CardContent style={styles.caseContent}>
      <div style={styles.caseTop}>
        <div style={styles.caseHeading}>
          <Avatar name={item.ownerLabel} colorSeed={item.ownerLabel} size="md" />
          <div>
            <h2 style={styles.caseTitle}>{item.title}</h2>
            <p style={styles.caseSummary}>{item.summary}</p>
          </div>
        </div>
        <div style={styles.signals}>
          <span style={urgencyStyle(item.urgency)}>{item.urgency}</span>
          <span style={styles.signal}>{item.status}</span>
        </div>
      </div>
      <div style={styles.details}>
        <div>
          <div style={styles.detailLabel}>Evidence confidence</div>
          <div style={styles.detailValue}>{Math.round(item.confidence * 100)}% · {item.evidenceLabel}</div>
        </div>
        <div>
          <div style={styles.detailLabel}>Provenance</div>
          <div style={styles.detailValue}>{item.provenanceLabel}</div>
        </div>
        <div>
          <div style={styles.detailLabel}>Next review</div>
          <div style={styles.detailValue}>{item.nextReviewLabel}</div>
        </div>
      </div>
      <div style={styles.caseBottom}>
        <p style={styles.recommendation}><strong>Suggested next step:</strong> {item.recommendedAction}</p>
        <Button type="button" size="sm" variant="outline" onClick={() => onReview(item.id)}>
          Review case <IconArrowUpRight size="14px" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const AssuranceInbox = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | AssuranceInboxCase["urgency"]>("all");
  const [query, setQuery] = useState("");
  const [reviewedCaseId, setReviewedCaseId] = useState<string | null>(null);
  const filteredCases = useMemo(
    () => MODEL.cases.filter((item) => {
      const matchesFilter = activeFilter === "all" || item.urgency === activeFilter;
      const searchText = `${item.title} ${item.summary} ${item.provenanceLabel}`.toLowerCase();
      return matchesFilter && searchText.includes(query.trim().toLowerCase());
    }),
    [activeFilter, query],
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}><IconInbox size="15px" /> Assurance workspace</div>
          <h1 style={styles.title}>Assurance Inbox</h1>
          <p style={styles.subtitle}>A calm review queue for the signals that need a human decision next.</p>
        </div>
        <div style={styles.headerActions}>
          <span style={{ ...styles.signal, background: "#eef7f1", color: "#2d8250" }}><IconShield size="14px" /> Read-only review</span>
          <Button type="button" size="sm" variant="outline" onClick={() => setQuery("")}>
            Reset view
          </Button>
        </div>
      </header>

      <section aria-label="Queue summary" style={styles.summaryGrid}>
        {[
          ["Cases in queue", MODEL.summary.total],
          ["Needs review", MODEL.summary.needsReview],
          ["High confidence", MODEL.summary.highConfidence],
        ].map(([label, value]) => (
          <Card key={label} style={styles.summaryCard}>
            <CardContent style={{ padding: "16px" }}>
              <div style={styles.summaryLabel}>{label}</div>
              <div style={styles.summaryValue}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-label="Case filters" style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <IconFilter size="15px" color="#788293" />
          {(["all", "critical", "watch", "ready"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              style={{ ...styles.filterButton, ...(activeFilter === filter ? styles.activeFilter : {}) }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "all" ? "All cases" : filter}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "220px", color: "#788293" }}>
          <IconSearch size="15px" />
          <Input aria-label="Search assurance cases" placeholder="Search cases" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </section>

      <section aria-label="Assurance cases" style={styles.caseList}>
        {filteredCases.map((item) => (
          <CaseCard key={item.id} item={item} onReview={setReviewedCaseId} />
        ))}
      </section>

      <footer style={styles.footer}>
        <span><IconClock size="13px" /> Next-review signals are illustrative and stay local to this front component.</span>
        {reviewedCaseId && <span>Review focus selected locally · {MODEL.cases.find((item) => item.id === reviewedCaseId)?.title}</span>}
      </footer>
    </main>
  );
};

export default defineFrontComponent({
  universalIdentifier: ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.frontComponent,
  name: "Assurance Inbox",
  description: "Read-only assurance review queue with evidence confidence and provenance signals",
  component: AssuranceInbox,
});
