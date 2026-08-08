import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IntakeContext } from "../contexts/IntakeContext";
import { useTranslation } from "../utils/useTranslation";

const symptomOptions = ["polyuria","excessive_thirst","fatigue","headaches","dizziness","shortness_of_breath","chest_pain"];
const lifestyleOptions = ["smoking","sedentary","high_sodium","poor_diet"];
const familyHistoryOptions = ["diabetes","hypertension","cvd"];

function ChipGroup({ label, options, selected, setSelected }: {
  label: string; options: string[]; selected: string[];
  setSelected: (v: string[]) => void;
}) {
  const toggle = (v: string) =>
    selected.includes(v) ? setSelected(selected.filter(x => x !== v)) : setSelected([...selected, v]);
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontWeight: 600, marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1.5px solid #6366f1",
              background: selected.includes(opt) ? "#6366f1" : "transparent",
              color: selected.includes(opt) ? "#fff" : "#6366f1",
              cursor: "pointer", fontWeight: 500, transition: "all 0.2s"
            }}>
            {opt.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Registration() {
  const { t } = useTranslation();
  const { setIntake } = useContext(IntakeContext);
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntake({ symptoms, lifestyle, familyHistory });
    navigate("/results");
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('patientIntake')}</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Select all that apply. This information helps calculate your chronic disease risk profile.
      </p>
      <form onSubmit={handleSubmit}>
        <ChipGroup label={t('symptoms')} options={symptomOptions} selected={symptoms} setSelected={setSymptoms} />
        <ChipGroup label={t('lifestyle')} options={lifestyleOptions} selected={lifestyle} setSelected={setLifestyle} />
        <ChipGroup label={t('familyHistory')} options={familyHistoryOptions} selected={familyHistory} setSelected={setFamilyHistory} />
        <button type="submit"
          style={{
            marginTop: 12, width: "100%", padding: "12px", borderRadius: 10,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer"
          }}>
          Calculate Risk Profile →
        </button>
      </form>
    </div>
  );
}
