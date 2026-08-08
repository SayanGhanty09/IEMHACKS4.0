// src/pages/Registration.tsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IntakeContext } from "../contexts/IntakeContext";
import { useTranslation } from "../utils/useTranslation";
import { TagInput } from "../components/TagInput";

export default function Registration() {
  const { t } = useTranslation();
  const { setIntake } = useContext(IntakeContext);
  const navigate = useNavigate();

  // Basic patient information
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Dynamic intake fields
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  // History of submitted records (loaded from localStorage)
  const [history, setHistory] = useState<Array<any>>([]);

  // Load any existing history on component mount
  useEffect(() => {
    const saved = localStorage.getItem("patient_records");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record = { name, age, gender, location, symptoms, lifestyle, familyHistory };
    // Update intake context (optional for other parts of app)
    setIntake({ symptoms, lifestyle, familyHistory });
    // Persist the new record at the front of the history array
    const updated = [record, ...history];
    localStorage.setItem("patient_records", JSON.stringify(updated));
    setHistory(updated);
    // Reset form fields for next entry
    setName("");
    setAge("");
    setGender("");
    setLocation("");
    setSymptoms([]);
    setLifestyle([]);
    setFamilyHistory([]);
    // Navigate to results page if desired
    navigate("/results");
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "24px", background: "var(--paper)", borderRadius: "var(--r-2)", boxShadow: "var(--shadow-2)" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 12, color: "var(--ink)" }}>{t('patientIntake') ?? 'Patient Intake'}</h1>
      <p style={{ color: "var(--ink-3)", marginBottom: 24 }}>{t('intakeDescription') ?? 'Provide your details and any relevant health information.'}</p>
      <form onSubmit={handleSubmit}>
        {/* Basic demographic fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <input type="text" placeholder={t('name') ?? 'Name'} value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--hairline)", background: "var(--surface)" }} />
          <input type="number" placeholder={t('age') ?? 'Age'} value={age} onChange={(e) => setAge(e.target.value)} required style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--hairline)", background: "var(--surface)" }} />
          <select value={gender} onChange={(e) => setGender(e.target.value)} required style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--hairline)", background: "var(--surface)" }}>
            <option value="">{t('gender') ?? 'Gender'}</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <input type="text" placeholder={t('location') ?? 'Location'} value={location} onChange={(e) => setLocation(e.target.value)} required style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--hairline)", background: "var(--surface)" }} />
        </div>
        {/* Tag based dynamic inputs */}
        <TagInput label={t('symptoms') ?? 'Symptoms'} placeholder="e.g., headache, fatigue" values={symptoms} setValues={setSymptoms} />
        <TagInput label={t('lifestyle') ?? 'Lifestyle Factors'} placeholder="e.g., smoking, sedentary" values={lifestyle} setValues={setLifestyle} />
        <TagInput label={t('familyHistory') ?? 'Family History'} placeholder="e.g., diabetes, hypertension" values={familyHistory} setValues={setFamilyHistory} />
        <button type="submit" style={{ marginTop: 24, width: "100%", padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-1)" }}>{t('calculateRisk') ?? 'Calculate Risk Profile →'}</button>
      </form>
      {/* History of previous submissions */}
      {history.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, color: "var(--ink)" }}>{t('history') ?? 'Previous Records'}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((rec, idx) => (
              <li key={idx} style={{ padding: "12px", borderBottom: "1px solid var(--hairline)", background: idx % 2 === 0 ? "var(--surface)" : "transparent" }}>
                <strong>{rec.name}</strong> – {rec.age} yrs – {rec.gender} – {rec.location}<br />
                <em>{t('symptoms') ?? 'Symptoms'}:</em> {rec.symptoms.join(", ") || "-"}<br />
                <em>{t('lifestyle') ?? 'Lifestyle'}:</em> {rec.lifestyle.join(", ") || "-"}<br />
                <em>{t('familyHistory') ?? 'Family History'}:</em> {rec.familyHistory.join(", ") || "-"}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
