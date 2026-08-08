import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IntakeContext } from "../contexts/IntakeContext";
import { calculateChronicRisks } from "../utils/riskThresholds";
import RiskCard from "../components/RiskCard";

interface RiskFactor {
  name: string;
  impact: number;
  type: 'symptom' | 'lifestyle' | 'history' | 'vital' | 'demographic';
}

interface RiskResult {
  disease: string;
  score: number;
  riskLevel: string;
  factors: RiskFactor[];
}

export default function Results() {
  const { intake } = useContext(IntakeContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<RiskResult[]>([]);
  const [predictionMode, setPredictionMode] = useState<"ml" | "fallback">("fallback");

  // Read latest record from localStorage
  const records = JSON.parse(localStorage.getItem("patient_records") || "[]");
  const latestPatient = records[0] || {};

  const patientName = latestPatient.name || "Patient";
  const patientAge = parseInt(latestPatient.age) || 35;
  const patientGender = latestPatient.gender || "Other";
  const patientLocation = latestPatient.location || "";
  
  const symptoms = latestPatient.symptoms || intake.symptoms || [];
  const lifestyle = latestPatient.lifestyle || intake.lifestyle || [];
  const familyHistory = latestPatient.familyHistory || intake.familyHistory || [];

  const symptomsStr = JSON.stringify(symptoms);
  const lifestyleStr = JSON.stringify(lifestyle);
  const familyHistoryStr = JSON.stringify(familyHistory);

  useEffect(() => {
    async function fetchMLPredictions() {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/v1/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age: patientAge,
            sex: patientGender,
            symptoms: symptoms,
            lifestyle: lifestyle,
            familyHistory: familyHistory,
          }),
        });

        if (!response.ok) {
          throw new Error("Backend response error");
        }

        const data = await response.json();
        
        // Build factor list from patient's actual inputs to display on the cards
        const factorsList: RiskFactor[] = [];
        symptoms.forEach((s: string) => factorsList.push({ name: `Symptom: ${s}`, impact: 0, type: 'symptom' }));
        lifestyle.forEach((l: string) => factorsList.push({ name: `Lifestyle: ${l}`, impact: 0, type: 'lifestyle' }));
        familyHistory.forEach((f: string) => factorsList.push({ name: `Family: ${f}`, impact: 0, type: 'history' }));

        // Map backend predictions
        const mapped: RiskResult[] = [
          {
            disease: "High Cholesterol",
            score: Math.round(data.cholesterol_risk * 100),
            riskLevel: data.cholesterol_category,
            factors: factorsList,
          },
          {
            disease: "Heart Disease",
            score: Math.round(data.heart_disease_risk * 100),
            riskLevel: data.heart_disease_category,
            factors: factorsList,
          },
          {
            disease: "Chronic Anemia",
            score: Math.round(data.anaemia_risk * 100),
            riskLevel: data.anaemia_category,
            factors: factorsList,
          },
          {
            disease: "Jaundice",
            score: Math.round(data.jaundice_risk * 100),
            riskLevel: data.jaundice_category,
            factors: factorsList,
          },
        ];

        setPredictions(mapped);
        setPredictionMode("ml");
      } catch (err) {
        console.warn("Could not connect to ML backend, falling back to local estimator:", err);
        // Fallback calculations using rules-based engine
        const fallbackRisks = calculateChronicRisks(
          {},
          { symptoms, lifestyle, familyHistory },
          patientAge,
          patientGender === "male" ? "Male" : patientGender === "female" ? "Female" : "Other"
        );
        // Map fallback levels to RiskResult format
        const mappedFallback: RiskResult[] = fallbackRisks.map(r => ({
          disease: r.disease,
          score: r.score,
          riskLevel: r.riskLevel,
          factors: r.factors,
        }));
        setPredictions(mappedFallback);
        setPredictionMode("fallback");
      } finally {
        setLoading(false);
      }
    }

    fetchMLPredictions();
  }, [patientAge, patientGender, symptomsStr, lifestyleStr, familyHistoryStr, latestPatient.id]);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 20px" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>Patient Risk Profile</h1>
        <p style={{ color: "var(--ink-3)", fontSize: 16 }}>
          Analysis for <strong>{patientName}</strong> ({patientAge} yrs, {patientGender}) {patientLocation && `from ${patientLocation}`}.
        </p>
      </header>

      {/* Mode Indicator Banner */}
      {predictionMode === "ml" ? (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "#6366f1", marginBottom: 24, fontSize: 14 }}>
          <strong>✨ Machine Learning Mode Active:</strong> Predictions are generated by the 4 optimized ML models trained on your clinical dataset.
        </div>
      ) : (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#d97706", marginBottom: 24, fontSize: 14 }}>
          <strong>⚠️ Offline Rule-Based Fallback:</strong> ML models are offline. Start your FastAPI server on port 8000 (<code>python medical_api_server.py</code>) to get predictions from the trained classifiers.
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)" }}>
          <p style={{ fontSize: 18 }}>Calculating risk scores using clinical classifiers...</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {predictions.map((r) => (
            <RiskCard key={r.disease} result={r} />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate("/register")}
        style={{
          marginTop: 32,
          padding: "12px 28px",
          borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "var(--shadow-1)",
        }}
      >
        ← Re-enter Intake
      </button>
    </div>
  );
}

