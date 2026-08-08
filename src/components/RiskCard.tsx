import type { ChronicRiskResult } from "../utils/riskThresholds";

const TONE_MAP = {
  Low:    { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a", bar: "#22c55e" },
  Medium: { bg: "#fffbeb", border: "#fcd34d", badge: "#b45309", bar: "#f59e0b" },
  High:   { bg: "#fff1f2", border: "#fca5a5", badge: "#dc2626", bar: "#ef4444" },
};

interface Props { result: ChronicRiskResult; }

export default function RiskCard({ result }: Props) {
  const t = TONE_MAP[result.riskLevel];

  return (
    <div style={{
      border: `1.5px solid ${t.border}`, borderRadius: 14,
      background: t.bg, padding: "18px 22px",
      animation: "slideUp 0.4s ease both"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{result.disease}</h3>
        <span style={{
          background: t.badge, color: "#fff", borderRadius: 20,
          padding: "3px 14px", fontSize: 13, fontWeight: 700
        }}>{result.riskLevel}</span>
      </div>

      {/* Score bar */}
      <div style={{ background: "#e5e7eb", borderRadius: 99, height: 10, marginBottom: 10 }}>
        <div style={{
          width: `${result.score}%`, background: t.bar,
          height: "100%", borderRadius: 99,
          transition: "width 0.8s ease"
        }} />
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
        Estimated risk score: <strong>{result.score}%</strong>
      </p>

      {/* Factor breakdown */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {result.factors.map(f => (
          <li key={f.name} style={{
            display: "flex", justifyContent: "space-between", fontSize: 13,
            padding: "3px 0", borderBottom: "1px solid rgba(0,0,0,0.06)"
          }}>
            <span>{f.name}</span>
            <span style={{ fontWeight: 600, color: t.badge }}>+{f.impact}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
