import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IntakeContext } from "../contexts/IntakeContext";
import { calculateChronicRisks } from "../utils/riskThresholds";
import RiskCard from "../components/RiskCard";

export default function Results() {
  const { intake } = useContext(IntakeContext);
  const navigate = useNavigate();

  const risks = calculateChronicRisks(
    {}, // no biomarkers from this flow
    { symptoms: intake.symptoms, lifestyle: intake.lifestyle, familyHistory: intake.familyHistory },
    35,     // default age placeholder
    "Other" // default sex placeholder
  );

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Risk Profile</h1>
      <p style={{ color: "#64748b", marginBottom: 28 }}>
        Based on your intake, here is your estimated chronic disease risk summary.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {risks.map(r => <RiskCard key={r.disease} result={r} />)}
      </div>
      <button onClick={() => navigate("/register")}
        style={{ marginTop: 28, padding: "10px 24px", borderRadius: 8, background: "#6366f1",
          color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
        ← Re-enter Intake
      </button>
    </div>
  );
}
